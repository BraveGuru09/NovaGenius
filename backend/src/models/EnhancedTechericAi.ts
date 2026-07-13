/**
 * Enhanced TechericAi with GitHub Integration and Memory
 */

import TechericAi from './TechericAi';
import GitHubAPIService from '../services/GitHubAPIService';
import MemoryManager from '../services/MemoryManager';

export class EnhancedTechericAi extends TechericAi {
  private github: GitHubAPIService;
  private memory: MemoryManager;
  private linkedRepos: Set<string> = new Set();

  constructor() {
    super();
    this.github = new GitHubAPIService();
    this.memory = new MemoryManager();

    const linkedRepos = this.memory.getLinkedRepositories();
    this.linkedRepos = new Set(Object.keys(linkedRepos));
  }

  async learnFromRepository(owner: string, repo: string): Promise<string> {
    try {
      const repoInfo = await this.github.getRepository(owner, repo);
      const readme = await this.github.getReadme(owner, repo);

      this.memory.linkRepository(owner, repo, {
        url: repoInfo.url,
        description: repoInfo.description,
        language: repoInfo.language,
        readmePreview: readme.substring(0, 500),
      });

      this.learn(repo);
      if (repoInfo.description) {
        this.learn(repoInfo.description);
      }

      const message = `Learned about repository ${owner}/${repo}: ${repoInfo.description || 'No description'}`;
      this.memory.addConversation('system', message, {
        type: 'github_learning',
        repo: `${owner}/${repo}`,
      });

      return message;
    } catch (error) {
      console.error('Failed to learn from repository:', error);
      throw error;
    }
  }

  async searchAndLearn(query: string): Promise<any> {
    try {
      const results = await this.github.searchRepositories(query, 5);

      for (const repo of results) {
        await this.learnFromRepository(repo.owner, repo.repo);
      }

      const message = `Found and learned about ${results.length} repositories for "${query}"`;
      this.memory.addConversation('system', message, {
        type: 'github_search',
        query,
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      console.error('Failed to search and learn:', error);
      throw error;
    }
  }

  async getRepositoryFile(
    owner: string,
    repo: string,
    filePath: string
  ): Promise<string> {
    try {
      const file = await this.github.getFile(owner, repo, filePath);

      this.memory.addConversation('system', `Retrieved file ${filePath}`, {
        type: 'github_file_fetch',
        repo: `${owner}/${repo}`,
        file: filePath,
      });

      return file.content;
    } catch (error) {
      console.error('Failed to get repository file:', error);
      throw error;
    }
  }

  async getRepositoryIssues(
    owner: string,
    repo: string
  ): Promise<any[]> {
    try {
      const issues = await this.github.getIssues(owner, repo);

      this.memory.addConversation('system', `Retrieved ${issues.length} issues`, {
        type: 'github_issues',
        repo: `${owner}/${repo}`,
      });

      return issues;
    } catch (error) {
      console.error('Failed to get repository issues:', error);
      throw error;
    }
  }

  async learnUserProfile(username: string): Promise<any> {
    try {
      const profile = await this.github.getUserProfile(username);
      const repos = await this.github.getUserRepositories(username);

      this.memory.storeUserProfile(username, {
        ...profile,
        repositories: repos,
      });

      const message = `Learned about user ${username}: ${profile.name || username}`;
      this.memory.addConversation('system', message, {
        type: 'user_profile',
        username,
      });

      return profile;
    } catch (error) {
      console.error('Failed to learn user profile:', error);
      throw error;
    }
  }

  override respond(query: string): string {
    this.memory.addConversation('user', query);
    const context = this.memory.getContext(5);
    let response = this.generateResponse(query, context);
    this.memory.addConversation('assistant', response);
    return response;
  }

  private generateResponse(query: string, context: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('github')) {
      if (lowerQuery.includes('search')) {
        return `I can search GitHub for repositories. Try: "search AI projects"`;
      }
      if (lowerQuery.includes('learn')) {
        return `I can learn from GitHub repositories. Try: "learn from owner/repo-name"`;
      }
    }

    if (lowerQuery.includes('remember') || lowerQuery.includes('what do you know')) {
      const topics = this.getTopics();
      return `I have learned about: ${topics.join(', ') || 'nothing yet'}`;
    }

    const responses: { [key: string]: string } = {
      hello: "Hello! I'm NovaGenius with GitHub integration. How can I help?",
      'tell me a joke': "Why did the developer go broke? Because he used up all his cache! 💻",
      'play fortnite': 'Loading Fortnite... Ready to drop some wins! 🎮',
      'what is ai': 'AI is intelligence demonstrated by machines. I learn from GitHub and remember our conversations!',
      help: 'I can discuss code, search GitHub, learn from repositories, play games, and more!',
    };

    for (const [key, value] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) {
        return value;
      }
    }

    if (context) {
      return `Based on our conversation: I think you're asking about "${query}". Can you clarify?`;
    }

    return `Interesting query: "${query}". Tell me more!`;
  }

  getMemoryStatus(): object {
    return {
      stats: this.memory.getMemoryStats(),
      linkedRepositories: Array.from(this.linkedRepos),
      topics: this.getTopics(),
    };
  }

  getFullContext(): object {
    return {
      memory: this.memory.getAllMemory(),
      topics: this.getTopics(),
      linkedRepos: Array.from(this.linkedRepos),
    };
  }
}

export default EnhancedTechericAi;
