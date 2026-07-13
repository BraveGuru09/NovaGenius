/**
 * GitHub API Integration Service
 * Allows NovaGenius to query and learn from GitHub repositories
 */

import axios, { AxiosInstance } from 'axios';

export interface GitHubRepo {
  owner: string;
  repo: string;
  url: string;
  description?: string;
  language?: string;
}

export interface GitHubFile {
  path: string;
  content: string;
  language?: string;
}

export class GitHubAPIService {
  private client: AxiosInstance;
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN || '';
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: this.token ? { Authorization: `token ${this.token}` } : {},
    });
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}`);
      return {
        owner,
        repo,
        url: response.data.html_url,
        description: response.data.description,
        language: response.data.language,
      };
    } catch (error) {
      console.error('Failed to fetch repository:', error);
      throw error;
    }
  }

  /**
   * Get file from repository
   */
  async getFile(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main'
  ): Promise<GitHubFile> {
    try {
      const response = await this.client.get(
        `/repos/${owner}/${repo}/contents/${path}`,
        {
          params: { ref: branch },
        }
      );

      const content = Buffer.from(response.data.content, 'base64').toString(
        'utf-8'
      );

      return {
        path,
        content,
        language: this.getLanguageFromPath(path),
      };
    } catch (error) {
      console.error('Failed to fetch file:', error);
      throw error;
    }
  }

  /**
   * Search repositories
   */
  async searchRepositories(query: string, limit: number = 10) {
    try {
      const response = await this.client.get('/search/repositories', {
        params: {
          q: query,
          per_page: limit,
          sort: 'stars',
        },
      });

      return response.data.items.map((item: any) => ({
        owner: item.owner.login,
        repo: item.name,
        url: item.html_url,
        description: item.description,
        language: item.language,
        stars: item.stargazers_count,
      }));
    } catch (error) {
      console.error('Failed to search repositories:', error);
      throw error;
    }
  }

  /**
   * Get README content
   */
  async getReadme(owner: string, repo: string): Promise<string> {
    try {
      const response = await this.client.get(
        `/repos/${owner}/${repo}/readme`
      );
      const content = Buffer.from(response.data.content, 'base64').toString(
        'utf-8'
      );
      return content;
    } catch (error) {
      console.error('Failed to fetch README:', error);
      return '';
    }
  }

  /**
   * Get repository issues
   */
  async getIssues(owner: string, repo: string, state: string = 'open') {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/issues`, {
        params: { state, per_page: 10 },
      });

      return response.data.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        url: issue.html_url,
      }));
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(username: string) {
    try {
      const response = await this.client.get(`/users/${username}`);
      return {
        name: response.data.name,
        username: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
        publicRepos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,
        url: response.data.html_url,
      };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Get user repositories
   */
  async getUserRepositories(username: string, limit: number = 10) {
    try {
      const response = await this.client.get(`/users/${username}/repos`, {
        params: {
          per_page: limit,
          sort: 'updated',
        },
      });

      return response.data.map((repo: any) => ({
        owner: repo.owner.login,
        repo: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        url: repo.html_url,
      }));
    } catch (error) {
      console.error('Failed to fetch user repositories:', error);
      throw error;
    }
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const languageMap: { [key: string]: string } = {
      ts: 'TypeScript',
      tsx: 'TypeScript',
      js: 'JavaScript',
      jsx: 'JavaScript',
      py: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      go: 'Go',
      rs: 'Rust',
      rb: 'Ruby',
      php: 'PHP',
      md: 'Markdown',
      json: 'JSON',
    };
    return languageMap[ext] || ext.toUpperCase();
  }
}

export default GitHubAPIService;
