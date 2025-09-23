import mongoose, { Document, ObjectId, Schema, Types } from "mongoose";

export interface ISubmission extends Document {
  userId: ObjectId;
  problemId: ObjectId;
  code: string;
  language: string;
  status: string;
  runtime: number;
  memory: number;
  results?: {
    testCaseId: ObjectId;
    passed: boolean;
    input?: string;
    expected?: string;
    actual?: string;
    runtime?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    problemId: { type: Types.ObjectId, required: true, ref: "Problem" },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, required: true },
    runtime: { type: Number, required: true },
    memory: { type: Number, required: true },
    results: { type: Array, required: false, default: [] },
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>(
  "Submission",
  SubmissionSchema
);
