import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  prompt: String,
  response: String,
  keyword: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chatArr: [chatSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

export default SearchHistory;
