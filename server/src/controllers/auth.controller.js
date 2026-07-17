import { registerSchema } from "../validations/auth.validation.js";
import { registerUser } from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { loginSchema } from "../validations/auth.validation.js";
import { loginUser } from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);

    await registerUser(data);

    res.status(201).json({
        success: true,
        message: "User registered successfully"
    });
});

export const login = asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);

    const result = await loginUser(data);

    res.status(200).json({
        success: true,
        message: "Login successful",
        ...result
    });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});