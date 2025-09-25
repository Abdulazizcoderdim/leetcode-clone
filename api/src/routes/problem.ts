import problemController from "@/controller/problem.controller";
import authenticate from "@/middleware/authenticate";
import authorize from "@/middleware/authorize";
import validationError from "@/middleware/validationError";
import { Router } from "express";
import { body } from "express-validator";

const router = Router();

// get problems
router.get("/", validationError, problemController.getProblems);

// get problem
router.get("/:slug", validationError, problemController.getProblem);

// create problem
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  body("title").notEmpty().withMessage("Title is required"),
  body("question").notEmpty().withMessage("Question is required"),
  body("difficulty")
    .isIn([
      "8 kyu",
      "7 kyu",
      "6 kyu",
      "5 kyu",
      "4 kyu",
      "3 kyu",
      "2 kyu",
      "1 kyu",
    ])
    .withMessage("Invalid difficulty"),
  body("tags").isArray().withMessage("Tags must be array"),
  body("codeStubs").isObject().withMessage("Code stubs required"),
  validationError,
  problemController.createProblem
);

// update problem
router.put(
  "/update/:id",
  authenticate,
  authorize(["admin"]),
  validationError,
  problemController.updateProblem
);

// delete problem
router.delete(
  "/delete/:id",
  authenticate,
  authorize(["admin"]),
  validationError,
  problemController.deleteProblem
);

export default router;
