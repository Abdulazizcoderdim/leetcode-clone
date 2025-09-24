import { model, Schema, Types } from "mongoose";

interface IToken {
  token: string;
  userId: Types.ObjectId;
}

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    require: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

export const Token = model<IToken>("Token", tokenSchema);
