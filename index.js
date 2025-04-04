import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./router/authRouter.js";

dotenv.config(); 



const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT 
const mongoDbUrl = process.env.mongoDb;

mongoose
  .connect(mongoDbUrl) 
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
