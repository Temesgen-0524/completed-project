/** @format */

import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
	const { name, email } = req.body;
	const user = new User({ name, email });
	try {
		const savedUser = await user.save();
		res.status(201).json(savedUser);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Get all users
router.get("/", async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;
