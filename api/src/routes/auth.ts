import authController from "@/controller/auth.controller";
import authenticate from "@/middleware/authenticate";
import validationError from "@/middleware/validationError";
import { User } from "@/models/user";
import bcrypt from "bcrypt";
import { Router } from "express";
import { body, cookie } from "express-validator";

const router = Router();

router.post(
  "/register",
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Ism kerak")
    .isLength({ max: 50 })
    .withMessage("Ism 50 belgidan kam bo'lishi kerak")
    .custom(async (value) => {
      const userExists = await User.exists({ username: value });
      if (userExists) throw new Error("User already exists.");
    }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Elektron pochta kerak")
    .isLength({ max: 50 })
    .withMessage("Elektron pochta 50 belgidan kam bo'lishi kerak")
    .isEmail()
    .withMessage("Yaroqsiz elektron pochta manzillari")
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) throw new Error("User already exists.");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password talab qilinadi")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long"),
  body("role")
    .optional()
    .isString()
    .withMessage("Role must be a string")
    .isIn(["admin", "user"])
    .withMessage("Role must be either admin or user"),
  validationError,
  authController.register
);

router.post(
  "/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Elektron pochta kerak")
    .isLength({ max: 50 })
    .withMessage("Elektron pochta 50 belgidan kam bo'lishi kerak")
    .isEmail()
    .withMessage("Yaroqsiz elektron pochta manzillari"),
  body("password")
    .notEmpty()
    .withMessage("Password talab qilinadi")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long")
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await User.findOne({ email })
        .select("password")
        .lean()
        .exec();

      if (!user) {
        throw new Error("User email or password is invalid");
      }

      const passwordMatch = await bcrypt.compare(value, user.password);

      if (!passwordMatch) {
        throw new Error("User email or password is invalid");
      }
    }),
  validationError,
  authController.login
);

router.post(
  "/refresh-token",
  cookie("refreshToken")
    .notEmpty()
    .withMessage("Refresh token required")
    .isJWT()
    .withMessage("Invalid refresh token"),
  validationError,
  authController.refresh
);

router.post("/logout", authenticate, authController.logout);

export default router;
