import jwt from "jsonwebtoken";
export const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});
export function sendSession(user, res, status = 200) {
  const token = jwt.sign(
    { id: user._id, version: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: "2d", algorithm: "HS256" },
  );
  const { password, tokenVersion, ...profile } = user.toObject();
  return res
    .status(status)
    .cookie("access_token", token, {
      ...cookieOptions(),
      maxAge: 2 * 24 * 60 * 60 * 1000,
    })
    .json(profile);
}
