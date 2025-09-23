import { logger } from "@/lib/winston";
import { Problem } from "@/models/problem";
import { TestCase } from "@/models/test-case";
import type { Request, Response } from "express";

class TestCaseController {
  async getTestCasesByProblemId(req: Request, res: Response) {
    try {
      const testCases = await TestCase.find({
        problemId: req.params.problemId,
      }).sort({ order: 1 });

      res.status(200).json(testCases);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      logger.error("Error get test cases by problem ID.", error);
    }
  }

  async createTestCase(req: Request, res: Response) {
    try {
      // Check if problem exists
      const problem = await Problem.findById(req.body.problemId);
      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }

      const testCase = new TestCase(req.body);
      await testCase.save();
      res.status(201).json(testCase);
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ error: "Order already exists" });
      }

      res.status(500).json({ message: "Internal server error", error });
      logger.error("Error creating test case.", error);
    }
  }
}

export default new TestCaseController();
