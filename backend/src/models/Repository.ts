import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repoName: { type: String, required: true },
  repoUrl: { type: String, required: true },
  techStack: [{ type: String }],
  summary: { type: String },
  fileCount: { type: Number, default: 0 },
  graphData: { type: mongoose.Schema.Types.Mixed }, // Stores nodes and edges
}, { timestamps: true });

export const Repository = mongoose.model('Repository', repositorySchema);
