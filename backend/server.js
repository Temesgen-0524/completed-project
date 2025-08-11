/** @format */

import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Use CORS middleware
app.use(cors({
	origin: ["http://localhost:5173", "http://localhost:3000"],
	credentials: true
}));
app.use(express.json());

console.log("MongoDB URI:", process.env.MONGODB_URI);

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("MongoDB connected successfully!"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Middleware to check MongoDB connection
const checkMongoDBConnection = (req, res, next) => {
	if (mongoose.connection.readyState === 1) {
		next();
	} else {
		res.status(500).json({ message: "MongoDB connection is not available." });
	}
};

app.use(checkMongoDBConnection);

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stats", statsRoutes);

// Health check endpoint
app.get("/", (req, res) => {
	res.json({ message: "DBU Student Union API is running!" });
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});