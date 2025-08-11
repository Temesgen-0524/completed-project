/** @format */

import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
	name: { type: String, required: true },
	category: { type: String, required: true },
	members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	description: { type: String },
	image: { type: String },
	posts: [{
		title: { type: String, required: true },
		content: { type: String, required: true },
		image: { type: String },
		author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		createdAt: { type: Date, default: Date.now }
	}],
	joinRequests: [{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		department: { type: String, required: true },
		year: { type: String, required: true },
		reason: { type: String },
		status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
		requestedAt: { type: Date, default: Date.now }
	}],
	events: [
		{
			title: { type: String, required: true },
			date: { type: Date, required: true },
		},
	],
	founded: { type: Date },
	createdAt: { type: Date, default: Date.now },
});

const Club = mongoose.model("Club", clubSchema);

export default Club;