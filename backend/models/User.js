/** @format */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	department: { type: String, required: true },
	year: { type: String, required: true },
	studentId: { type: String, required: true, unique: true },
	role: { type: String, enum: ["student", "admin"], default: "student" },
	joinedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
	votedElections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Election" }],
	createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;