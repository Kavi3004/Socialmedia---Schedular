import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("Missing MongoDB connection string. Set MONGODB_URI or MONGO_URI in your environment.");
    }

    try {
        mongoose.connection.on("connected", async () => {
            console.log("MongoDB connected");
        });

        mongoose.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });

        await mongoose.connect(mongoUri);
    } catch (error: any) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDB;


