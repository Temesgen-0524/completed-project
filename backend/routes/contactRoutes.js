/** @format */

import express from "express";
import ContactMessage from "../models/ContactMessage.js";

const router = express.Router();

// Submit a contact message
router.post("/", async (req, res) => {
	const { name, email, subject, message, category } = req.body;

	const contactMessage = new ContactMessage({
		name,
		email,
		subject,
		message,
		category,
	});
	try {
		const savedMessage = await contactMessage.save();
		res.status(201).json(savedMessage);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

export default router;
