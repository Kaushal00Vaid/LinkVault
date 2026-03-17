import mongoose, { Document } from "mongoose";

export type LinkTag =
  | "Docs"
  | "UI/UX"
  | "Tutorial"
  | "Deployment"
  | "Tool"
  | "Reference"
  | "Other";

export interface ILink extends Document {
  title: string;
  url: string;
  alias: string;
  description?: string;
  tags: LinkTag[];
  vaultId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isFavorite: boolean;
}

const linkSchema = new mongoose.Schema<ILink>(
  {
    title: {
      type: String,
      required: [true, "Link title is required"],
      trim: true,
      minLength: [2, "Link title must be at least 2 characters long"],
      maxLength: [100, "Link title must be at most 100 characters long"],
    },
    url: {
      type: String,
      required: true,
      trim: true,
      match: [/^https?:\/\/.+/, "URL must start with http:// or https://"],
    },
    alias: {
      type: String,
      trim: true,
      minLength: [2, "Alias must be at least 2 characters long"],
      maxLength: [60, "Alias must be at most 60 characters long"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [300, "Description must be at most 300 characters long"],
    },
    tags: [
      {
        type: [String],
        enum: {
          values: [
            "Docs",
            "UI/UX",
            "Tutorial",
            "Deployment",
            "Tool",
            "Reference",
            "Other",
          ],
          message: "{VALUE} is not a valid tag",
        },
        validate: {
          validator: (tags: String[]) => tags.length <= 5,
          message: "A link can have at most 5 tags",
        },
        default: [],
      },
    ],
    vaultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vault",
      required: [true, "Link must belong to a vault"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Link must belong to a user"],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// indexes
linkSchema.index({ vaultId: 1 });
linkSchema.index({ userId: 1 });

// text index for the quick search/retrieval feature
linkSchema.index({ title: "text", alias: "text", url: "text" });

const Link: mongoose.Model<ILink> = mongoose.model<ILink>("Link", linkSchema);
export default Link;
