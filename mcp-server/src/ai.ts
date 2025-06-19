import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export interface MusicAnalysis {
  searchQuery: string;
  mood?: string;
  genre?: string;
  energy?: number;
  tempo?: string;
  era?: string;
  language?: string;
}

export class AIAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string = process.env.OPENAI_API_KEY || '') {
    if (!apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    this.openai = new OpenAI({ apiKey });
  }

  async analyzePrompt(prompt: string): Promise<MusicAnalysis> {
    try {
      const systemPrompt = `あなたは音楽検索のためのプロンプト解析AIです。
ユーザーの自然言語リクエストを分析し、Spotify検索に最適なクエリと属性を抽出してください。

出力は必ず以下のJSON形式で返してください：
{
  "searchQuery": "Spotify検索用のキーワード（英語）",
  "mood": "雰囲気（calm, energetic, happy, sad, etc.）",
  "genre": "ジャンル（jazz, pop, rock, classical, etc.）",
  "energy": 0-100の数値（エネルギーレベル）,
  "tempo": "テンポ（slow, medium, fast）",
  "era": "年代（90s, 2000s, 2010s, etc.）",
  "language": "言語（japanese, english, etc.）"
}

例：
入力: "カフェで流れるようなジャズ"
出力: {
  "searchQuery": "jazz cafe ambient smooth",
  "mood": "calm",
  "genre": "jazz",
  "energy": 30,
  "tempo": "slow",
  "era": null,
  "language": null
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(content) as MusicAnalysis;
      
      if (!analysis.searchQuery) {
        analysis.searchQuery = prompt;
      }

      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      
      return {
        searchQuery: prompt,
        mood: undefined,
        genre: undefined,
        energy: undefined,
        tempo: undefined,
        era: undefined,
        language: undefined
      };
    }
  }

  buildEnhancedQuery(analysis: MusicAnalysis): string {
    const parts: string[] = [analysis.searchQuery];

    if (analysis.genre && !analysis.searchQuery.toLowerCase().includes(analysis.genre)) {
      parts.push(analysis.genre);
    }

    if (analysis.mood) {
      parts.push(analysis.mood);
    }

    if (analysis.era) {
      parts.push(analysis.era);
    }

    if (analysis.tempo) {
      parts.push(analysis.tempo);
    }

    return parts.join(' ');
  }
}