import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import socialAuthRouter from "./routes/socialAuthRoutes.js";
import accountRouter from "./routes/accountRoutes.js";
import postRouter from "./routes/postRoutes.js";
import activityRouter from "./routes/activityRoutes.js";
import { initScheduler } from "./services/schedulerService.js";

const app = express();

// Database connection
try {
    await connectDB();
} catch (error) {
    console.error("Server started without a working database connection:", error);
}

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

const port = Number(process.env.PORT || 3000);

app.get('/', (_req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use("/api/auth", authRouter)
app.use("/api/oauth", socialAuthRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/posts", postRouter)
app.use("/api/activity", activityRouter)

// Initialize Scheduler
initScheduler()

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction)=>{
    console.error(err);
    res.status(500).send(err?.response?.data?.message || err?.message)
})

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
});