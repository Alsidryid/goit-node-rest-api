import Joi from "joi";
import { emailRegex } from "../constants/userConstants.js";

export const userSignupSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).message("invalid email").required(),
  password: Joi.string().min(6).required(),
});
export const userLoginSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
});

export const userUpdateSubSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

export const userEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).message("invalid email").required(),
});
