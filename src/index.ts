import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";
import authRoutes from "./routes/auth.route";
import fitnessRoutes from "./routes/fitness.route";
import adminRoutes from "./routes/admin.route";

const app: Application = express();

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3030"],
  })
);

// Body parsing (MUST come before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for public folder (images, videos, etc)
app.use("/", express.static("public"));

// Static files for uploads folder (user images, etc)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/fitness", fitnessRoutes);
app.use("/api/admin", adminRoutes);

// Root
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

// GLOBAL ERROR HANDLER 
app.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.statusCode || 500).json({
      message: err.message || "Internal server error",
    });
  }
);

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
