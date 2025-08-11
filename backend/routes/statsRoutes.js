/** @format */

import express from "express";
import User from "../models/User.js";
import Club from "../models/Club.js";
import Post from "../models/Post.js";
import Election from "../models/Election.js";
import Complaint from "../models/Complaint.js";

const router = express.Router();

// Get dashboard statistics
router.get("/", async (req, res) => {
	try {
		const [
			totalStudents,
			totalClubs,
			totalPosts,
			activeElections,
			pendingComplaints
		] = await Promise.all([
			User.countDocuments({ role: "student" }),
			Club.countDocuments(),
			Post.countDocuments(),
			Election.countDocuments({ status: "Ongoing" }),
			Complaint.countDocuments({ status: "submitted" })
		]);

		res.status(200).json({
			totalStudents,
			totalClubs,
			totalPosts,
			activeElections,
			pendingComplaints
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;