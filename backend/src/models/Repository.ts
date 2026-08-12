import mongoose, { Schema, Document } from 'mongoose';

export interface IRepository extends Document {
  owner: mongoose.Types.ObjectId;
  repoUrl: string;
  repoName: string;
  techStack: string[];
  astAnalysis: mongoose.Schema.Types.Mixed; // Store AST info
  dependencyGraph: mongoose.Schema.Types.Mixed; // Store nodes and edges
  summary: string;
  importantFiles: string[];
  metrics: {
    fileCount: number;
    dependencyCount: number;
    complexityScore?: number;
    averageHealth?: number;
  };
  analysisTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema: Schema = new Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    repoUrl: { type: String, required: true },
    repoName: { type: String, required: true },
    techStack: [{ type: String }],
    astAnalysis: { type: mongoose.Schema.Types.Mixed },
    dependencyGraph: { type: mongoose.Schema.Types.Mixed },
    summary: { type: String },
    importantFiles: [{ type: String }],
    metrics: {
      fileCount: { type: Number, default: 0 },
      dependencyCount: { type: Number, default: 0 },
      complexityScore: { type: Number, default: 0 },
      averageHealth: { type: Number, default: 100 },
    },
    analysisTimestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Repository = mongoose.model<IRepository>('Repository', RepositorySchema);
