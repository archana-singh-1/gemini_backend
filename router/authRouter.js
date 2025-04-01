import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/userSchema.js"; 

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
      console.log("Login Request Data:", req.body);
  
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
  


router.get("/verify", async (req, res) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;