import mongoose, { Document } from "mongoose";

export interface IVault extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic: boolean;
  userId: mongoose.Types.ObjectId;
}

const vaultSchema = new mongoose.Schema<IVault>(
  {
    name: {
      type: String,
      required: [true, "Vault name is required"],
      trim: true,
      minLength: [2, "Vault name must be at least 2 characters long"],
      maxLength: [30, "Vault name must be at most 30 characters long"],
    },
    slug: {
      type: String,
      required: [true, "Vault slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [200, "Description must be at most 200 characters long"],
    },
    icon: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      match: [
        /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
        "Color must be a valid hex code",
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vault must belong to a user"],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// indexes
vaultSchema.index({ userId: 1, slug: 1 }, { unique: true });
vaultSchema.index({ userId: 1 });

const Vault: mongoose.Model<IVault> = mongoose.model<IVault>(
  "Vault",
  vaultSchema,
);
export default Vault;
