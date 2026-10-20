import { randomBytes } from "node:crypto";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../middleware/error.js";
import { googleAuth } from "../services/googleAuth.js";
import { sendSession } from "../services/session.js";

const validEmail = (value) =>
  typeof value === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
  value.length <= 254;
const validPassword = (value) =>
  typeof value === "string" &&
  value.length >= 8 &&
  Buffer.byteLength(value) <= 72;

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (
    typeof username !== "string" ||
    !/^[a-z0-9]{7,20}$/.test(username) ||
    !validEmail(email) ||
    !validPassword(password)
  ) {
    return next(
      errorHandler(
        400,
        "Use a lowercase username of 7–20 letters or digits, a valid email, and a password of at least 8 characters (at most 72 bytes)",
      ),
    );
  }
  try {
    await User.create({
      username,
      email: email.trim().toLowerCase(),
      password: await bcryptjs.hash(password, 12),
    });
    return res.status(201).json("Signup successful");
  } catch (error) {
    return next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (
    !validEmail(email) ||
    typeof password !== "string" ||
    !password ||
    Buffer.byteLength(password) > 72
  ) {
    return next(errorHandler(400, "Email and password are required"));
  }
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return next(errorHandler(401, "Invalid email or password"));
    }
    return sendSession(user, res);
  } catch (error) {
    return next(error);
  }
};

export const google = async (req, res, next) => {
  let claims;
  try {
    claims = await googleAuth.verify(req.body.idToken);
  } catch (error) {
    return next(
      errorHandler(
        error.statusCode === 503 ? 503 : 401,
        error.statusCode === 503
          ? "Google sign-in is not configured"
          : "Invalid Google identity",
      ),
    );
  }
  if (!validEmail(claims.email))
    return next(errorHandler(401, "Verified email required"));
  try {
    const email = claims.email.trim().toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      const prefix =
        (claims.name || "googleuser")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 10) || "googleuser";
      user = await User.create({
        username: prefix + randomBytes(4).toString("hex"),
        email,
        password: await bcryptjs.hash(randomBytes(32).toString("hex"), 12),
        profilePicture: claims.picture,
      });
    }
    return sendSession(user, res);
  } catch (error) {
    return next(error);
  }
};
