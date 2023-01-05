const fs = require("fs/promises");
const path = require("path");
const jimp = require("jimp");

const { User } = require("../models/user");

const { ctrlWrapper } = require("../helpers/index");

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

module.exports = {
  changeAvatar: ctrlWrapper(changeAvatar),
};
