import mongoose, { Document, Schema } from "mongoose";

export interface IProblem extends Document {
  title: string;
  slug: string;
  question: string;
  level: string;
  tags: string[];
  codeStubs: {
    python: string;
    javascript: string;
    typescript: string;
    java: string;
    c: string;
    cpp: string;
    csharp: string;
    kotlin: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    level: { type: String, required: true },
    tags: { type: [String], required: true },
    codeStubs: {
      python: { type: String, required: false },
      javascript: { type: String, required: false },
      typescript: { type: String, required: false },
      java: { type: String, required: false },
      c: { type: String, required: false },
      cpp: { type: String, required: false },
      csharp: { type: String, required: false },
      kotlin: { type: String, required: false },
    },
  },
  { timestamps: true }
);

ProblemSchema.index({ slug: 1 }, { unique: true });

export const Problem = mongoose.model<IProblem>("Problem", ProblemSchema);
