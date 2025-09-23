import testcaseController from "@/controller/testcase.controller";
import authenticate from "@/middleware/authenticate";
import authorize from "@/middleware/authorize";
import validationError from "@/middleware/validationError";
import { Role } from "@/models/user";
import { Router } from "express";
import { body } from "express-validator";

const router = Router();

// Problem uchun test caselarni olish
router.get("/problem/:problemId", testcaseController.getTestCasesByProblemId);

// Yangi test case yaratish
router.post(
  "/",
  authenticate,
  authorize([Role.ADMIN]),
  body("problemId").isMongoId().withMessage("Invalid problem ID"),
  body("type").isIn(["sample", "hidden"]).withMessage("Invalid type"),
  body("input").notEmpty().withMessage("Input is required"),
  body("output").notEmpty().withMessage("Output is required"),
  body("order").isInt({ min: 1 }).withMessage("Order must be positive integer"),
  validationError,
  testcaseController.createTestCase
);
export default router;
