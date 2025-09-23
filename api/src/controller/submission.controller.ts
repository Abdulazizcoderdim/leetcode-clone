import { logger } from "@/lib/winston";
import { Problem } from "@/models/problem";
import { Submission } from "@/models/submission";
import { TestCase } from "@/models/test-case";
import { executeCodeWithDocker } from "@/services/dockerExecution";
import type { Request, Response } from "express";

class SubmissionController {
  async create(req: Request, res: Response) {
    try {
      const { problemId, code, language } = req.body;
      const userId = req.userId;

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }

      const testCases = await TestCase.find({ problemId }).sort({ order: 1 });

      if (testCases.length === 0) {
        return res.status(404).json({ error: "No test cases found" });
      }

      const executionResult = await executeCodeWithDocker(
        code,
        language,
        testCases
      );

      // create submission
      const submission = new Submission({
        userId,
        problemId,
        code,
        status: executionResult.status,
        runtime: executionResult.runtime,
        memory: executionResult.memory,
        results: executionResult.results,
      });

      await submission.save();

      res.status(201).json({
        submissionId: submission._id,
        status: submission.status,
        runtime: submission.runtime,
        memory: submission.memory,
        results: submission.results,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      logger.error("Error creating submission.", error);
    }
  }

  async getSubmissionById(req: Request, res: Response) {
    try {
      const submission = await Submission.findOne({
        _id: req.params.id,
        userId: req.userId,
      }).populate("problemId", "title slug level");

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      res.status(200).json(submission);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      logger.error("Error get submission by ID.", error);
    }
  }

  async getUserSubmissions(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [total, submissions] = await Promise.all([
        Submission.countDocuments({ userId }),
        Submission.find({ userId })
          .populate("problemId", "title slug level")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
      ]);

      res.status(200).json({
        data: submissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      logger.error("Error get submissions by user ID.", error);
    }
  }
}

export default new SubmissionController();
