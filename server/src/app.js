import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/health.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

app.use("/api/health", healthRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running 🚀"
    });
});

export default app;