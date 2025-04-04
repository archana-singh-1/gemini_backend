
import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, 
  },
  chatArr: [
    {
      prompt: String,
      response: String,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);
export default SearchHistory;
