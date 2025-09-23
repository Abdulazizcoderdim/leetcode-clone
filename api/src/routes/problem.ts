import problemController from "@/controller/problem.controller";
import authenticate from "@/middleware/authenticate";
import authorize from "@/middleware/authorize";
import validationError from "@/middleware/validationError";
import { Role } from "@/models/user";
import { Router } from "express";
import { body } from "express-validator";

const router = Router();

// get problems
router.get("/", validationError, problemController.getProblems);

// get problem
router.get("/:slug", validationError, problemController.getProblem);

// create problem
router.post(
  "/create",
  authenticate,
  authorize([Role.ADMIN]),
  body("title").notEmpty().withMessage("Title is required"),
  body("question").notEmpty().withMessage("Question is required"),
  body("level").isIn(["Easy", "Medium", "Hard"]).withMessage("Invalid level"),
  body("tags").isArray().withMessage("Tags must be array"),
  body("codeStubs").isObject().withMessage("Code stubs required"),
  validationError,
  problemController.createProblem
);

// update problem
router.put(
  "/update/:id",
  authenticate,
  authorize([Role.ADMIN]),
  validationError,
  problemController.updateProblem
);

// delete problem
router.delete(
  "/delete/:id",
  authenticate,
  authorize([Role.ADMIN]),
  validationError,
  problemController.deleteProblem
);

export default router;
