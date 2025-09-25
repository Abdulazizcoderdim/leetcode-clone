import bcrypt from "bcrypt";
import mongoose, { Document, Schema, Types } from "mongoose";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: Role;
  submissions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: Role.USER },
    submissions: [{ type: Types.ObjectId, ref: "Submission" }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
