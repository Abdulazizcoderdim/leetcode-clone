import { logger } from "@/lib/winston";
import { Problem } from "@/models/problem";
import { TestCase } from "@/models/test-case";
import uniqeSlug from "@/utils/uniqeSlug";
import type { Request, Response } from "express";

class ProblemController {
  async getProblems(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const level = req.query.level as string;
      const tags = req.query.tags as string;

      const filter: any = {};
      if (level) filter.level = level;
      if (tags) filter.tags = tags;

      const [total, problems] = await Promise.all([
        Problem.countDocuments(filter),
        Problem.find(filter)
          .select("-codeStubs")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
      ]);

      res.status(200).json({
        data: problems,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      logger.error("Error get problems.", error);
    }
  }

  async getProblem(req: Request, res: Response) {
    try {
      const problem = await Problem.findOne({ slug: req.params.slug });
      if (!problem) {
        return res.status(404).json({ error: "Problem not found" });
      }

      // Get sample test cases (type: 'sample')
      const sampleTestCases = await TestCase.find({
        problemId: problem._id,
        type: "sample",
      }).sort({ order: 1 });

      res.json({
        problem,
        sampleTestCases,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
      logger.error("Error get problem.", error);
    }
  }

  async createProblem(req: Request, res: Response) {
    try {
      const { title, question, level, tags, codeStubs } = req.body;

      const slug = await uniqeSlug(title);

      const problem = new Problem({
        title,
        slug,
        question,
        level,
        tags,
        codeStubs,
      });

      await problem.save();

      res.status(201).json(problem);
    } catch (error: any) {
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ error, message: "Problem already exists" });
      }

      res.status(500).json({ message: "Server error", error });

      logger.error("Error creating problem.", error);
    }
  }

  async updateProblem(req: Request, res: Response) {
    try {
    } catch (error) {}
  }

  async deleteProblem(req: Request, res: Response) {
    try {
    } catch (error) {}
  }
}

export default new ProblemController();
