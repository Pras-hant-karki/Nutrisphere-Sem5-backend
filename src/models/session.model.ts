import mongoose, { Document, Schema } from "mongoose";

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type SessionDay = (typeof DAYS_OF_WEEK)[number];

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  day: SessionDay;
  sessionName: string;
  timeRange: string;
  location: string;
  workoutTitle: string;
  exercises: string[];
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema<ISession>(
  {
    day: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: [true, "Day is required"],
      trim: true,
    },
    sessionName: {
      type: String,
      required: [true, "Session name is required"],
      trim: true,
    },
    timeRange: {
      type: String,
      required: [true, "Time range is required"],
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    workoutTitle: {
      type: String,
      default: "",
      trim: true,
    },
    exercises: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const SessionModel = mongoose.model<ISession>("Session", SessionSchema);

