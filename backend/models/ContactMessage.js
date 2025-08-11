/** @format */

import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	subject: { type: String },
	message: { type: String, required: true },
	category: { type: String },
	createdAt: { type: Date, default: Date.now },
});

const ContactMessage = mongoose.model("ContactMessage", ContactMessageSchema);

export default ContactMessage;
