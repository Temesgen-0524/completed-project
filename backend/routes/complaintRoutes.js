/** @format */

import express from "express";
import Complaint from "../models/Complaint.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Create a new complaint
router.post("/", authenticateToken, async (req, res) => {
	try {
		const { title, description, category, branch, priority } = req.body;
		const complaint = new Complaint({
			title,
			description,
			category,
			branch,
			priority,
			submittedBy: req.user._id,
		});

		const savedComplaint = await complaint.save();
		await savedComplaint.populate("submittedBy", "name email");
		res.status(201).json(savedComplaint);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Get all complaints
router.get("/", authenticateToken, async (req, res) => {
	try {
		let query = {};
		
		// If not admin, only show user's own complaints
		if (req.user.role !== "admin") {
			query.submittedBy = req.user._id;
		}

		const complaints = await Complaint.find(query)
			.populate("submittedBy", "name email")
			.sort({ submittedAt: -1 });
		res.status(200).json(complaints);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get complaint by ID
router.get("/:id", authenticateToken, async (req, res) => {
	try {
		const complaint = await Complaint.findById(req.params.id)
			.populate("submittedBy", "name email");
		
		if (!complaint) {
			return res.status(404).json({ message: "Complaint not found" });
		}

		// Check if user can access this complaint
		if (req.user.role !== "admin" && complaint.submittedBy._id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Access denied" });
		}
		
		res.status(200).json(complaint);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Add response to complaint (Admin only)
router.post("/:id/responses", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { message } = req.body;
		const complaint = await Complaint.findById(req.params.id);
		
		if (!complaint) {
			return res.status(404).json({ message: "Complaint not found" });
		}

		complaint.responses.push({
			author: req.user.name,
			message,
		});

		await complaint.save();
		res.status(201).json({ message: "Response added successfully", complaint });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Update complaint status (Admin only)
router.patch("/:id/status", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { status } = req.body;
		const complaint = await Complaint.findById(req.params.id);
		
		if (!complaint) {
			return res.status(404).json({ message: "Complaint not found" });
		}

		complaint.status = status;
		await complaint.save();
		
		res.status(200).json({ message: "Complaint status updated successfully", complaint });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;