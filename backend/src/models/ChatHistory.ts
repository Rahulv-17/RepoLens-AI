import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  repoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
}, { timestamps: true });

export const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
