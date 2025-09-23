import mongoose, { Document, ObjectId, Schema, Types } from "mongoose";

export interface ITestCase extends Document {
  problemId: ObjectId;
  type: string;
  input: string;
  output: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>(
  {
    problemId: { type: Types.ObjectId, required: true, ref: "Problem" },
    type: { type: String, required: true },
    input: { type: String, required: true },
    output: { type: String, required: true },
    order: { type: Number, required: true, unique: true },
  },
  { timestamps: true }
);

TestCaseSchema.index({ problemId: 1, order: 1 }, { unique: true });

export const TestCase = mongoose.model<ITestCase>("TestCase", TestCaseSchema);
