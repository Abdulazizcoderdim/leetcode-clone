import submissionController from "@/controller/submission.controller";
import authenticate from "@/middleware/authenticate";
import authorize from "@/middleware/authorize";
import validationError from "@/middleware/validationError";
import { Role } from "@/models/user";
import { Router } from "express";
import { body, param } from "express-validator";

const router = Router();

// Kod yuborish va bajarish
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  body("problemId").isMongoId().withMessage("Invalid problem ID"),
  body("code").notEmpty().withMessage("Code is required"),
  body("language")
    .isIn([
      "python",
      "javascript",
      "typescript",
      "java",
      "c",
      "cpp",
      "csharp",
      "kotlin",
    ])
    .withMessage("Invalid language"),
  validationError,
  submissionController.create
);

// Ma'lum bir submissionni olish
router.get(
  "/:id",
  authenticate,
  param("id").isMongoId().withMessage("Invalid submission ID"),
  validationError,
  submissionController.getSubmissionById
);

// foydalanuvchini submissionlarini olish
router.get(
  "/user",
  authenticate,
  validationError,
  submissionController.getUserSubmissions
);

export default router;
