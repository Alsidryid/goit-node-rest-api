import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorator/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import gravatar from "gravatar";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";

const posterPath = path.resolve("public", "avatars");

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const verificationToken = nanoid();
  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const avatarUrl = gravatar.url(email, { d: "identicon" });
  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await authServices.signup({
    ...req.body,
    avatarUrl,
    password: hashPassword,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "verify email",
    html: `<h1>Hello ${email}</h1><a target = "_blank" href="${BASE_URL}/users/register/verify/${verificationToken}">Click for verify email<a/>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
    avatarUrl: newUser.avatarUrl,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await authServices.findUser({ verificationToken });
  console.log(user);
  if (!user) {
    throw HttpError(404, "Email not found or already verified");
  }

  await authServices.updateUser(
    { _id: user._id },
    { verify: true, verificationToken: "null" }
  );
  res.json({
    message: "Verification successful",
  });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await authServices.findUser({ email });
  if (!email) {
    throw HttpError(400, "missing required field email");
  }
  if (!user) {
    throw HttpError(404, "Email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "verify email",
    html: `<h1>Hello ${email}</h1><a target = "_blank" href="${BASE_URL}/users/register/verify/${user.verificationToken}">Click for verify email<a/>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "verify email send again",
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or passwor invalid");
  }
  if (!user.verify) {
    throw HttpError(401, "Email not verified");
  }
  const passworCompare = await bcrypt.compare(password, user.password);
  if (!passworCompare) {
    throw HttpError(401, "Email or passwor invalid");
  }
  const { _id: id, subscription, avatarUrl } = user;
  const payload = {
    id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await authServices.updateUser({ _id: id }, { token });
  res.json({
    token,
    user: { email, subscription, avatarUrl },
  });
};

const getCurrent = async (req, res) => {
  const { subscription, email, avatarUrl } = req.user;
  res.json({ email, subscription, avatarUrl });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await authServices.updateUser({ _id }, { token: "" });
  res.status(204).json({ message: "Signout success" });
};

const updateSub = async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;
  const result = await authServices.updateUser({ _id }, { subscription });

  res.json({ email: result.email, subscription: result.subscription });
};

const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "Please send the file");
  }
  const { path: oldPath, filename } = req.file;
  const { _id, email } = req.user;

  Jimp.read(oldPath, (err, lenna) => {
    if (err) throw err;
    lenna.resize(250, 250).quality(60).greyscale().write(newPath);
  });
  const newFilename = `${email}_${filename}`;
  const newPath = path.join(posterPath, newFilename);
  await fs.rename(oldPath, newPath);
  const avatar = path.join("avatars", newFilename);
  const result = await authServices.updateUser({ _id }, { avatarUrl: avatar });

  res.json({ email: result.email, avatarUrl: result.avatarUrl });
};
export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  updateSub: ctrlWrapper(updateSub),
  updateAvatar: ctrlWrapper(updateAvatar),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
};
