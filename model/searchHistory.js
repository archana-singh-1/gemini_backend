import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  history: [
    {
      query: { type: String, required: true },
      response: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);
export default SearchHistory;
