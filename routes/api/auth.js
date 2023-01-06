const express = require("express");

const ctrl = require("../../controllers/auth");

const { validateBody, authentificate, upload } = require("../../middlewares");

const { schemas } = require("../../models/user");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.get("/current", authentificate, ctrl.getCurrent);

router.get("/logout", authentificate, ctrl.logout);

router.patch(
  "/users/avatars",
  authentificate,
  upload.single("avatar"),
  ctrl.changeAvatar
);

router.get("/users/verify/:verifyToken", ctrl.verify);

router.post(
  "/users/verify",
  validateBody(schemas.verifyEmailSchema),
  ctrl.resendVerifyEmail
);

module.exports = router;
