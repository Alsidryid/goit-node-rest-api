import express from "express";

import authControllers from "../controllers/authControllers.js";
import upload from "../middlewars/upload.js";
import {
  userSignupSchema,
  userLoginSchema,
  userUpdateSubSchema,
} from "../schemas/userSchemas.js";
import validateBody from "../helpers/validateBody.js";

import authenticate from "../middlewars/authenticate.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(userSignupSchema),
  authControllers.signup
);

authRouter.post(
  "/login",
  validateBody(userLoginSchema),
  authControllers.signin
);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.signout);

authRouter.patch(
  "/",
  authenticate,
  validateBody(userUpdateSubSchema),
  authControllers.updateSub
);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authControllers.updateAvatar
);

export default authRouter;
