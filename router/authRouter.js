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

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});


router.post("/search", async (req, res) => {
  const { userId, userPrompt, gptResponse } = req.body;

  if (!userId || !userPrompt || !gptResponse) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const promptTime = new Date();
    const responseTime = new Date(); 
    const updated = await SearchHistory.findOneAndUpdate(
      { userId },
      {
        $push: {
          chatArr: {
            prompt: userPrompt,
            response: gptResponse,
            timestamp: new Date(), 
          },
        },
        $setOnInsert: {
          userId,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    

    res.status(201).json({ message: "Chat saved successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error saving chat", error });
  }
});


router.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const history = await SearchHistory.findOne({ userId });

    if (!history)
      return res.status(404).json({ message: "No history found" });

    res.status(200).json(history.chatArr);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error });
  }
});

router.get("/history/:userId/:query", async (req, res) => {
  const { userId, query } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const history = await SearchHistory.findOne({ userId });

    if (!history) return res.status(404).json({ message: "No history found" });

    const filteredChats = history.chatArr.filter(chat =>
      chat.prompt.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredChats.length === 0)
      return res.status(404).json({ message: "No matching results" });

    res.status(200).json(filteredChats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error });
  }
});


router.get("/history", async (req, res) => {
  const { userId, keyword } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const history = await SearchHistory.findOne({ userId });

    if (!history) return res.status(404).json({ message: "No history found" });

    const filteredChats = history.chatArr.filter(chat =>
      chat.prompt.toLowerCase().includes(keyword.toLowerCase())
    );

    if (filteredChats.length === 0)
      return res.status(404).json({ message: "No matching results" });

    res.status(200).json(filteredChats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history", error });
  }
});




export default router;
