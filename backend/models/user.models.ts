import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Name must be at least 2 characters long"],
      maxLength: [50, "Name must be at most 50 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    avatar: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// indexes
// userSchema.index({ email: 1 });

// pre-save hook: hash password only when modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
