import { Router } from "express";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import { loginUser, registerUser, logoutUser, getMe } from "./auth.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const input = registerSchema.parse(req.body);

    const user = await registerUser(input);

    res.status(201).json({
      success: true,
      data: user,
      message: "Registration successful",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    res.status(400).json({
      success: false,
      error: {
        code: "REGISTRATION_ERROR",
        message,
      },
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    res.cookie("token", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        user: result.user,
      },
      message: "Login successful",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed";

    res.status(401).json({
      success: false,
      error: {
        code: "LOGIN_ERROR",
        message,
      },
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({
      success: true,
      data: {},
      message: "Logout successful",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Logout failed";

    res.status(400).json({
      success: false,
      error: {
        code: "LOGOUT_ERROR",
        message,
      },
    });
  }
});

router.get("/me", requireAuth, async (req: import("../../middleware/auth.middleware.js").AuthenticatedRequest, res) => {
  try {
    const user = await getMe(req.user!.userId);

    res.json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve user";

    res.status(404).json({
      success: false,
      error: {
        code: "USER_NOT_FOUND",
        message,
      },
    });
  }
});

export default router;