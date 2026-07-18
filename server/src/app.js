import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import userRoutes from "./routes/user.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import attachmentRoutes from "./routes/attachment.routes.js";
import groupRoutes from "./routes/group.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

app.use(
    "/uploads",
    express.static(path.resolve("uploads"))
);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/conversations", attachmentRoutes);
app.use("/api/groups", groupRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running 🚀"
    });
});

export default app;