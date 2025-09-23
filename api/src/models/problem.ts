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
      python: { type: String, required: true },
      javascript: { type: String, required: true },
      typescript: { type: String, required: true },
      java: { type: String, required: true },
      c: { type: String, required: true },
      cpp: { type: String, required: true },
      csharp: { type: String, required: true },
      kotlin: { type: String, required: true },
    },
  },
  { timestamps: true }
);

ProblemSchema.index({ slug: 1 }, { unique: true });

export const Problem = mongoose.model<IProblem>("Problem", ProblemSchema);
