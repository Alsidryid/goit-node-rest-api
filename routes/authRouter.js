import express from "express";

import authControllers from "../controllers/authControllers.js";
import { userSignupSchema, userLoginSchema } from "../schemas/userSchemas.js";
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

export default authRouter;
