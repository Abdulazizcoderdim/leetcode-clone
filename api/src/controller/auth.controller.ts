import config from "@/config";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { logger } from "@/lib/winston";
import { Token } from "@/models/token";
import { IUser, User } from "@/models/user";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Types } from "mongoose";

class AuthController {
  async login(req: Request, res: Response) {
    try {
      type UserData = Pick<IUser, "email" | "password">;

      const { email, password } = req.body as UserData;

      const user = await User.findOne({ email })
        .select("username email password role")
        .lean()
        .exec();

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({
          code: "ValidationError",
          message: "User email or password is invalid",
        });
      }

      const accessToken = generateAccessToken(user._id as Types.ObjectId);
      const refreshToken = generateRefreshToken(user._id as Types.ObjectId);

      await Token.create({ token: refreshToken, userId: user._id });

      logger.info("Refresh token created for user", {
        userId: user._id,
        token: refreshToken,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(201).json({
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
        accessToken,
      });

      logger.info("User registered successfullt", user);
    } catch (error) {
      res.status(500).json({
        code: "ServerError",
        message: "Internal server error",
        error,
      });

      logger.error("Error during user registeration", error);
    }
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

      const accessToken = generateAccessToken(newUser._id as Types.ObjectId);
      const refreshToken = generateRefreshToken(newUser._id as Types.ObjectId);

      await Token.create({ token: refreshToken, userId: newUser._id });

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

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken as string;

      if (refreshToken) {
        await Token.deleteOne({ token: refreshToken });

        logger.info("User refresh token deleted", {
          userId: req.userId,
          token: refreshToken,
        });
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.sendStatus(204);

      logger.info("User logged out successfully", {
        userId: req.userId,
      });
    } catch (error) {
      res.status(500).json({
        code: "ServerError",
        message: "Internal server error",
        error,
      });

      logger.error("Error during logout", error);
    }
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken as string;

    try {
      const tokenExists = await Token.exists({ token: refreshToken });

      if (!tokenExists) {
        res.status(401).json({
          code: "AuthenticationError",
          message: "Invalid refresh token",
        });
        return;
      }

      const jwtPayload = verifyRefreshToken(refreshToken) as {
        userId: Types.ObjectId;
      };

      const accessToken = generateAccessToken(jwtPayload.userId);

      res.status(200).json({
        accessToken,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        res.status(401).json({
          code: "AuthenticationError",
          message: "Refresh token expired, please login again.",
        });
        return;
      }

      if (error instanceof JsonWebTokenError) {
        res.status(401).json({
          code: "AuthenticationError",
          message: "Invalid refresh token",
        });
        return;
      }

      res.status(500).json({
        code: "ServerError",
        message: "Internal server error",
        error,
      });
    }
  }
}

export default new AuthController();
