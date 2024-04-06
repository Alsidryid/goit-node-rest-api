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

const posterPath = path.resolve("public", "avatars");

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
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
  });
  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
    avatarUrl: newUser.avatarUrl,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or passwor invalid");
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
  const { path: oldPath, filename } = req.file;
  const { _id, email } = req.user;

  Jimp.read(oldPath, (err, lenna) => {
    if (err) throw err;
    lenna.resize(250, 250).quality(60).greyscale().write(newPath);
  });

  const newPath = path.join(posterPath, `${email}_${filename}`);

  await fs.rename(oldPath, newPath);

  const result = await authServices.updateUser({ _id }, { avatarUrl: newPath });

  res.json({ email: result.email, avatarUrl: result.avatarUrl });
};
export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  updateSub: ctrlWrapper(updateSub),
  updateAvatar: ctrlWrapper(updateAvatar),
};
