import { Router, Request, Response } from 'express';
import EnhancedTechericAi from '../models/EnhancedTechericAi';

const router = Router();
const ai = new EnhancedTechericAi();

router.post('/learn-repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.body;
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }
    const message = await ai.learnFromRepository(owner, repo);
    res.json({ success: true, message, status: `Now learning from ${owner}/${repo}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to learn from repository', details: error.message });
  }
});

router.post('/search-learn', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const results = await ai.searchAndLearn(query);
    res.json({ success: true, resultsCount: results.length, repositories: results });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to search and learn', details: error.message });
  }
});

router.get('/repo-file', async (req: Request, res: Response) => {
  try {
    const { owner, repo, path } = req.query;
    if (!owner || !repo || !path) {
      return res.status(400).json({ error: 'Owner, repo, and path are required' });
    }
    const content = await ai.getRepositoryFile(owner as string, repo as string, path as string);
    res.json({ success: true, file: path, content });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get file', details: error.message });
  }
});

router.get('/repo-issues', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }
    const issues = await ai.getRepositoryIssues(owner as string, repo as string);
    res.json({ success: true, issuesCount: issues.length, issues });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get issues', details: error.message });
  }
});

router.post('/learn-user', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const profile = await ai.learnUserProfile(username);
    res.json({ success: true, user: profile, message: `Learned about ${username}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to learn user', details: error.message });
  }
});

router.get('/memory-status', (req: Request, res: Response) => {
  try {
    const status = ai.getMemoryStatus();
    res.json({ success: true, ...status });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get memory status', details: error.message });
  }
});

router.get('/full-context', (req: Request, res: Response) => {
  try {
    const context = ai.getFullContext();
    res.json({ success: true, context });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get context', details: error.message });
  }
});

export default router;
