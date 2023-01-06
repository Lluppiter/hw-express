const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const jimp = require("jimp");
const uniqueId = require("uniqid");

const { User } = require("../models/user");

const { HttpError, ctrlWrapper, sendEmail } = require("../helpers/index");

require("dotenv").config();
const { SECRET_KEY, BASE_URL } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = uniqueId();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verificationEmail = {
    to: email,
    subject: "Verify your email",
    text: "Click verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verificationEmail);

  res.status(201).json({
    email: newUser.email,
  });
};

const verify = async (req, res) => {
  const { verifyToken } = req.params;
  console.log(req.params);
  const user = await User.findOne({ verifyToken });
  if (!user) {
    throw HttpError(404);
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json({
    message: "Verify email success",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  if (!user.verify) {
    throw HttpError(400, "Email is not verify");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    subscription,
    email,
  });
};

const logout = async (req, res) => {
  const { _id } = req.body;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.json({
    message: "Logout succes",
  });
};

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const resiseImg = async (tmpUpload, resultUpload) => {
  const image = await jimp.read(tmpUpload);
  await image.resize(250, 250);
  await image.writeAsync(tmpUpload);
  await fs.rename(tmpUpload, resultUpload);
};

const changeAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tmpUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);
  resiseImg(tmpUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404);
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verificationEmail = {
    to: email,
    subject: "Verify your email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verificationEmail);

  res.json({
    message: "Verify email resend succcess",
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  changeAvatar: ctrlWrapper(changeAvatar),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
