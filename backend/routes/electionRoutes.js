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
		const candidates = Array.isArray(req.body) ? req.body : [req.body];
		const election = await Election.findById(req.params.id);
		
		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		if (election.status !== "Pending") {
			return res.status(400).json({ message: "Cannot add candidates to ongoing or completed elections" });
		}

		// Validate and add multiple candidates
		for (const candidateData of candidates) {
			const { name, position, department, year, studentId, profileImage, platform, bio } = candidateData;
			
			// Check if candidate with same studentId already exists in this election
			const existingCandidate = election.candidates.find(c => c.studentId === studentId);
			if (existingCandidate) {
				return res.status(400).json({ 
					message: `Candidate with student ID ${studentId} already exists in this election` 
				});
			}

			election.candidates.push({
				name,
				position,
				department,
				year,
				studentId,
				profileImage,
				platform: Array.isArray(platform) ? platform : [platform],
				bio,
			});
		}

		await election.save();
		res.status(201).json({ 
			message: `${candidates.length} candidate(s) added successfully`, 
			election 
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Remove candidate from election (Admin only)
router.delete("/:electionId/candidates/:candidateId", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const election = await Election.findById(req.params.electionId);
		
		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		if (election.status !== "Pending") {
			return res.status(400).json({ message: "Cannot remove candidates from ongoing or completed elections" });
		}

		const candidateIndex = election.candidates.findIndex(c => c._id.toString() === req.params.candidateId);
		if (candidateIndex === -1) {
			return res.status(404).json({ message: "Candidate not found" });
		}

		election.candidates.splice(candidateIndex, 1);
		await election.save();
		
		res.status(200).json({ message: "Candidate removed successfully", election });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Update candidate in election (Admin only)
router.put("/:electionId/candidates/:candidateId", authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { name, position, department, year, studentId, profileImage, platform, bio } = req.body;
		const election = await Election.findById(req.params.electionId);
		
		if (!election) {
			return res.status(404).json({ message: "Election not found" });
		}

		if (election.status !== "Pending") {
			return res.status(400).json({ message: "Cannot update candidates in ongoing or completed elections" });
		}

		const candidate = election.candidates.id(req.params.candidateId);
		if (!candidate) {
			return res.status(404).json({ message: "Candidate not found" });
		}

		// Check if studentId is being changed and if it conflicts with existing candidates
		if (studentId && studentId !== candidate.studentId) {
			const existingCandidate = election.candidates.find(c => 
				c.studentId === studentId && c._id.toString() !== req.params.candidateId
			);
			if (existingCandidate) {
				return res.status(400).json({ 
					message: `Candidate with student ID ${studentId} already exists in this election` 
				});
			}
		}

		// Update candidate fields
		if (name) candidate.name = name;
		if (position) candidate.position = position;
		if (department) candidate.department = department;
		if (year) candidate.year = year;
		if (studentId) candidate.studentId = studentId;
		if (profileImage) candidate.profileImage = profileImage;
		if (platform) candidate.platform = Array.isArray(platform) ? platform : [platform];
		if (bio) candidate.bio = bio;

		await election.save();
		res.status(200).json({ message: "Candidate updated successfully", election });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Vote for a candidate
router.post("/:electionId/vote", authenticateToken, async (req, res) => {
	try {
		const { candidateIds } = req.body; // Support voting for multiple candidates
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

		// Support both single candidate and multiple candidates voting
		const candidatesToVoteFor = Array.isArray(candidateIds) ? candidateIds : [candidateIds];
		
		// Validate all candidates exist
		for (const candidateId of candidatesToVoteFor) {
			const candidate = election.candidates.id(candidateId);
			if (!candidate) {
				return res.status(404).json({ message: `Candidate with ID ${candidateId} not found` });
			}
		}

		// Cast votes for all selected candidates
		for (const candidateId of candidatesToVoteFor) {
			const candidate = election.candidates.id(candidateId);
			candidate.votes += 1;
		}
		
		election.totalVotes += candidatesToVoteFor.length;
		election.voters.push(req.user._id);

		await election.save();
		res.status(200).json({ 
			message: `Vote(s) cast successfully for ${candidatesToVoteFor.length} candidate(s)` 
		});
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