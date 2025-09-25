import mongoose, { Document, Schema } from "mongoose";

export interface IProblem extends Document {
  title: string;
  slug: string;
  question: string;
  difficulty: string;
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
    difficulty: {
      type: String,
      required: true,
      enum: [
        "8 kyu",
        "7 kyu",
        "6 kyu",
        "5 kyu",
        "4 kyu",
        "3 kyu",
        "2 kyu",
        "1 kyu",
      ],
    },
    tags: { type: [String], required: true },
    codeStubs: {
      python: { type: String },
      javascript: { type: String },
      typescript: { type: String },
      java: { type: String },
      c: { type: String },
      cpp: { type: String },
      csharp: { type: String },
      kotlin: { type: String },
    },
  },
  { timestamps: true }
);

ProblemSchema.index({ slug: 1 }, { unique: true });

export const Problem = mongoose.model<IProblem>("Problem", ProblemSchema);
