import { chatWithRepo } from './src/controllers/repoController';
import mongoose from 'mongoose';
import { Repository } from './src/models/Repository';

async function test() {
  const req: any = {
    params: { id: new mongoose.Types.ObjectId().toString() },
    user: { userId: new mongoose.Types.ObjectId().toString() },
    body: { message: "Where is auth?" }
  };
  const res: any = {
    status: (s: number) => {
      console.log('STATUS:', s);
      return { json: (j: any) => console.log('JSON:', j) };
    }
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    // create a fake repo
    const repo = await Repository.create({
      owner: req.user.userId,
      repoUrl: 'http://test.com',
      repoName: 'Test',
      techStack: ['Node'],
      astAnalysis: [
        { filePath: 'src/auth.js', functions: ['login'], imports: [], exports: [] }
      ],
      dependencyGraph: { nodes: [], edges: [] },
      summary: 'Test',
      importantFiles: [],
      metrics: { fileCount: 1, dependencyCount: 0, complexityScore: 0, averageHealth: 100 }
    });
    
    req.params.id = repo._id.toString();

    await chatWithRepo(req, res);
  } catch(e) {
    console.error("CRASH:", e);
  } finally {
    await mongoose.disconnect();
  }
}
test();
