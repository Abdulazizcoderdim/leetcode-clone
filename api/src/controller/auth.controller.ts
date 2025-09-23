import config from "@/config";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";
import { IUser, User } from "@/models/user";
import type { Request, Response } from "express";

class AuthController {
  async login() {
    return {};
  }
  async register(req: Request, res: Response) {
    type UserData = Pick<IUser, "email" | "password" | "role" | "username">;

    const { email, password, role, username } = req.body as UserData;

    if (role === "admin" && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
      res.status(403).json({
        code: "AuthorizationError",
        message: "You cannot register as an admin",
      });

      logger.warn(
        `User with email ${email} tried to register as an admin but is not in the whitelist`
      );
      return;
    }

    try {
      const newUser = await User.create({
        username,
        email,
        password,
        role,
      });

      const accessToken = generateAccessToken(newUser._id);
      const refreshToken = generateRefreshToken(newUser._id);

      await token.create({ token: refreshToken, userId: newUser._id });
      logger.info("Refresh token created for user", {
        userId: newUser._id,
        token: refreshToken,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(201).json({
        user: {
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
        accessToken,
      });

      logger.info("User registered successfullt", {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      });
    } catch (error) {
      res.status(500).json({
        code: "ServerError",
        message: "Internal server error",
        error,
      });

      logger.error("Error during user registeration", error);
    }
  }
  async logout() {
    return {};
  }

  async refresh() {}
}

export default new AuthController();
