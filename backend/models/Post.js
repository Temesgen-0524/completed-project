/** @format */

import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ["Event", "News", "Update"], // Example enum values
		required: true,
	},
	title: { type: String, required: true },
	content: { type: String, required: true },
	date: { type: Date, required: true },
	category: { type: String },
	image: { type: String },
	location: { type: String },
	time: { type: String },
	important: { type: Boolean, default: false },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
