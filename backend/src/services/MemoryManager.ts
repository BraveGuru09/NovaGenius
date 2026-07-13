/**
 * Memory Management System
 * Persists conversations, learned topics, and context
 */

import fs from 'fs';
import path from 'path';

export interface ConversationEntry {
  timestamp: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  context?: any;
}

export interface MemoryData {
  conversations: ConversationEntry[];
  learnedTopics: string[];
  userProfiles: { [key: string]: any };
  linkedRepositories: { [key: string]: any };
  preferences: { [key: string]: any };
  metadata: {
    createdAt: string;
    lastUpdated: string;
    version: string;
  };
}

export class MemoryManager {
  private memoryDir: string;
  private memoryFile: string;
  private memory: MemoryData;

  constructor(memoryPath: string = './data/memory') {
    this.memoryDir = memoryPath;
    this.memoryFile = path.join(this.memoryDir, 'memory.json');
    this.memory = this.loadMemory();
  }

  private ensureMemoryPath(): void {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
  }

  private loadMemory(): MemoryData {
    this.ensureMemoryPath();

    if (fs.existsSync(this.memoryFile)) {
      try {
        const data = fs.readFileSync(this.memoryFile, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        console.error('Failed to load memory:', error);
      }
    }

    return {
      conversations: [],
      learnedTopics: [],
      userProfiles: {},
      linkedRepositories: {},
      preferences: {},
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }

  private saveMemory(): void {
    try {
      this.memory.metadata.lastUpdated = new Date().toISOString();
      fs.writeFileSync(
        this.memoryFile,
        JSON.stringify(this.memory, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }

  addConversation(
    role: 'user' | 'assistant' | 'system',
    content: string,
    context?: any
  ): void {
    this.memory.conversations.push({
      timestamp: new Date().toISOString(),
      role,
      content,
      context,
    });

    if (this.memory.conversations.length > 1000) {
      this.memory.conversations = this.memory.conversations.slice(-1000);
    }

    this.saveMemory();
  }

  getConversationHistory(limit: number = 50): ConversationEntry[] {
    return this.memory.conversations.slice(-limit);
  }

  searchConversations(keyword: string): ConversationEntry[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.memory.conversations.filter((entry) =>
      entry.content.toLowerCase().includes(lowerKeyword)
    );
  }

  getContext(limit: number = 10): string {
    return this.memory.conversations
      .slice(-limit)
      .map((entry) => `${entry.role}: ${entry.content}`)
      .join('\n');
  }

  addLearnedTopic(topic: string): void {
    if (!this.memory.learnedTopics.includes(topic)) {
      this.memory.learnedTopics.push(topic);
      this.saveMemory();
    }
  }

  getLearnedTopics(): string[] {
    return this.memory.learnedTopics;
  }

  linkRepository(owner: string, repo: string, data: any): void {
    const key = `${owner}/${repo}`;
    this.memory.linkedRepositories[key] = {
      ...data,
      linkedAt: new Date().toISOString(),
    };
    this.saveMemory();
  }

  getLinkedRepositories(): { [key: string]: any } {
    return this.memory.linkedRepositories;
  }

  storeUserProfile(username: string, profile: any): void {
    this.memory.userProfiles[username] = {
      ...profile,
      savedAt: new Date().toISOString(),
    };
    this.saveMemory();
  }

  getUserProfile(username: string): any {
    return this.memory.userProfiles[username];
  }

  setPreference(key: string, value: any): void {
    this.memory.preferences[key] = value;
    this.saveMemory();
  }

  getPreference(key: string): any {
    return this.memory.preferences[key];
  }

  getAllMemory(): MemoryData {
    return this.memory;
  }

  clearMemory(): void {
    this.memory = {
      conversations: [],
      learnedTopics: [],
      userProfiles: {},
      linkedRepositories: {},
      preferences: {},
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      },
    };
    this.saveMemory();
  }

  exportMemory(): string {
    return JSON.stringify(this.memory, null, 2);
  }

  getMemoryStats(): object {
    return {
      conversationCount: this.memory.conversations.length,
      topicsLearned: this.memory.learnedTopics.length,
      linkedRepos: Object.keys(this.memory.linkedRepositories).length,
      userProfiles: Object.keys(this.memory.userProfiles).length,
      preferences: Object.keys(this.memory.preferences).length,
      createdAt: this.memory.metadata.createdAt,
      lastUpdated: this.memory.metadata.lastUpdated,
    };
  }
}

export default MemoryManager;
