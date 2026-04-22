/**
 * Chat history + vector memory for companions.
 * Upgraded 2026-04-21 from Pinecone v1 + langchain 0.0.92 to
 * Pinecone v3 + @langchain/* split packages.
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { Redis } from '@upstash/redis';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager | null = null;

  public history: Redis;
  public pinecone: Pinecone;

  private constructor() {
    this.history = Redis.fromEnv();
    this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ?? '' });
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public async vectorSearch(recentChatHistory: string, companionFileName: string) {
    const indexName = process.env.PINECONE_INDEX ?? 'tightandhard';
    const pineconeIndex = this.pinecone.index(indexName);

    try {
      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY }),
        { pineconeIndex },
      );

      const similarDocs = await vectorStore.similaritySearch(recentChatHistory, 3, {
        fileName: companionFileName,
      });
      return similarDocs;
    } catch (err) {
      console.warn('[memory] vector search failed:', err);
      return [];
    }
  }

  private generateRedisCompanionKey(key: CompanionKey): string {
    return `${key.companionName}-${key.modelName}-${key.userId}`;
  }

  public async writeToHistory(text: string, companionKey: CompanionKey) {
    if (!companionKey?.userId) return '';
    const key = this.generateRedisCompanionKey(companionKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });
    return result;
  }

  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    if (!companionKey?.userId) return '';
    const key = this.generateRedisCompanionKey(companionKey);
    let result = await this.history.zrange(key, 0, Date.now(), { byScore: true });
    result = (result as string[]).slice(-30).reverse();
    return (result as string[]).reverse().join('\n');
  }

  public async seedChatHistory(
    seedContent: string,
    delimiter: string = '\n',
    companionKey: CompanionKey,
  ) {
    const key = this.generateRedisCompanionKey(companionKey);
    if (await this.history.exists(key)) return;
    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}
