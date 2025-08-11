/** @format */

import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	category: { type: String, required: true },
	branch: { type: String, required: true },
	priority: { type: String, default: "medium" },
	status: { type: String, default: "submitted" },
	submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	submittedAt: { type: Date, default: Date.now },
	responses: [
		{
			author: { type: String, required: true },
			message: { type: String, required: true },
			timestamp: { type: Date, default: Date.now },
		},
	],
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);

export default Complaint;
