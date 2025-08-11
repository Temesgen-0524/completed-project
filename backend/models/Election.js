/** @format */

import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
	name: { type: String, required: true },
	position: { type: String, required: true },
	department: { type: String, required: true },
	year: { type: String, required: true },
	studentId: { type: String, required: true },
	votes: { type: Number, default: 0 },
	profileImage: { type: String, required: true },
	platform: { type: [String], required: true },
	bio: { type: String },
});

const ElectionSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	status: {
		type: String,
		enum: ["Ongoing", "Completed", "Pending"],
		default: "Pending",
	},
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	totalVotes: { type: Number, default: 0 },
	eligibleVoters: { type: Number, required: true },
	candidates: [CandidateSchema],
	voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	createdAt: { type: Date, default: Date.now },
});

const Election = mongoose.model("Election", ElectionSchema);

export default Election;