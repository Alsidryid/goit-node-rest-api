import HttpError from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import { findUser } from "../services/authServices.js";
import "dotenv/config";
const { JWT_SECRET } = process.env;
const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(HttpError(401, "invalid authorization"));
  }
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    return next(HttpError(401, "invalid authorization"));
  }
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await findUser({ _id: id });
    if (!user) {
      return next(HttpError(401, "Not authorized"));
    }
    if (!user.token) {
      return next(HttpError(401, "Token invalid"));
    }
    req.user = user;
    next();
  } catch (error) {
    next(HttpError(401, error.message));
  }
};
export default authenticate;
