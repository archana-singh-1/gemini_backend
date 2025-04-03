import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../model/userSchema.js";
import SearchHistory from "../model/searchHistory.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});


router.post("/search", async (req, res) => {
  const { userId, query, response } = req.body;


  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const historyEntry = { query, response };
    const result = await SearchHistory.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $push: { history: historyEntry } },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Search history recorded" });
  } catch (error) {
    console.error("Error saving search history:", error);
    res.status(500).json({ message: "Error saving search history", error });
  }
});

router.get("/search-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const history = await SearchHistory.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    res.json(history ? history.history : []);
  } catch (error) {
    console.error("Error fetching search history:", error);
    res.status(500).json({ message: "Error fetching search history", error });
  }
});


export default router;


