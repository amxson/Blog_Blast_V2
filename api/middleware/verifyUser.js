import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { errorHandler } from "./error.js";
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) return next(errorHandler(401, "Please sign in"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    const user = await User.findById(decoded.id);
    if (!user || (decoded.version || 0) !== (user.tokenVersion || 0))
      return next(errorHandler(401, "Please sign in again"));
    req.user = { id: String(user._id), isAdmin: user.isAdmin === true };
    return next();
  } catch {
    return next(errorHandler(401, "Please sign in again"));
  }
};
