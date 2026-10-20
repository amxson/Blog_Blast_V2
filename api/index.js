import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";

import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDb is connected");
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();
const clientDir = path.resolve(
  __dirname,
  process.cwd().endsWith("/api") ? "../client/dist" : "client/dist",
);

const app = express();
app.disable("x-powered-by");

const corsOptions = {
  origin: (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim()),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000!");
});

app.use((req, res, next) => {
  const allowed = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((value) => value.trim());
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    !allowed.includes(req.headers.origin)
  )
    return res.status(403).json({ message: "Origin not allowed" });
  next();
});
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

app.use(express.static(clientDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

app.use((err, req, res, next) => {
  const statusCode =
    err.code === 11000
      ? 409
      : ["ValidationError", "CastError"].includes(err.name)
        ? 400
        : err.statusCode || 500;
  const message =
    statusCode >= 500
      ? "Internal Server Error"
      : err.code === 11000
        ? "Account or post already exists"
        : err.message || "Request failed";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
