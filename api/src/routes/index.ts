import { Router } from "express";
import authRouter from "./auth";
import problemRouter from "./problem";
import submissionRouter from "./submission";
import testcaseRouter from "./testcase";

const router = Router();

router.use("/auth", authRouter);
router.use("/problem", problemRouter);
router.use("/testcase", testcaseRouter);
router.use("/submission", submissionRouter);

export default router;
