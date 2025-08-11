/** @format */

import express from "express";
import Election from "../models/Election.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Create a new election (Admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const {
			title,
			description,
			startDate,
			endDate,
			eligibleVoters,
			candidates,
		} = req.body;

		const election = new Election({
			title,
			description,
			startDate,
			endDate,
			eligibleVoters,
			candidates,
			createdBy: req.user._id,
		});

		const savedElection = await election.save();
		res.status(201).json(savedElection);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Get all elections
router.get("/", async (req, res) => {
	try {
		const elections = await Election.find()
			.populate("createdBy", "name")
			.sort({ createdAt: -1 });
		res.status(200).json(elections);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get election by ID
router.get("/:id", async (req, res) => {
	try {
		const election = await Election.findById(req.params.id)
			.populate("createdBy", "name")
			.populate("voters", "name email");
		
		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}
		
		res.status(200).json(election);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Add candidate to election (Admin only)
router.post("/:id/candidates", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { name, position, department, year, studentId, profileImage, platform, bio } = req.body;
		const election = await Election.findById(req.params.id);
		
		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		if (election.status !== "Pending") {
			return res.status(400).json({ message: "Cannot add candidates to ongoing or completed elections" });
		}

		election.candidates.push({
			name,
			position,
			department,
			year,
			studentId,
			profileImage,
			platform,
			bio,
		});

		await election.save();
		res.status(201).json({ message: "Candidate added successfully", election });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Vote for a candidate
router.post("/:electionId/vote", authenticateToken, async (req, res) => {
	try {
		const { candidateId } = req.body;
		const { electionId } = req.params;

		const election = await Election.findById(electionId);
		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		if (election.status !== "Ongoing") {
			return res.status(400).json({ message: "Election is not currently active" });
		}

		// Check if user has already voted
		if (election.voters.includes(req.user._id)) {
			return res.status(400).json({ message: "You have already voted in this election" });
		}

		const candidate = election.candidates.id(candidateId);
		if (!candidate) {
			return res.status(404).json({ message: "Candidate not found" });
		}

		candidate.votes += 1;
		election.totalVotes += 1;
		election.voters.push(req.user._id);

		await election.save();
		res.status(200).json({ message: "Vote cast successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Update election status (Admin only)
router.patch("/:id/status", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { status } = req.body;
		const election = await Election.findById(req.params.id);
		
		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		election.status = status;
		await election.save();
		
		res.status(200).json({ message: "Election status updated successfully", election });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;