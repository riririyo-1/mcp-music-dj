import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SpotifyClient } from './spotify.js';
import { AIAnalyzer } from './ai.js';

export const SEARCH_MUSIC_TOOL: Tool = {
  name: 'search_music',
  description: '自然言語のリクエストから音楽を検索します。例: "カフェで流れるようなジャズ", "朝のランニングに最適な曲"',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: '音楽検索のための自然言語プロンプト',
      },
      limit: {
        type: 'number',
        description: '返す楽曲の最大数',
        default: 10,
        minimum: 1,
        maximum: 50,
      },
    },
    required: ['prompt'],
  },
};

export interface SearchMusicParams {
  prompt: string;
  limit?: number;
}

export interface SearchMusicResponse {
  success: boolean;
  prompt: string;
  analysis: {
    searchQuery: string;
    mood?: string;
    genre?: string;
    energy?: number;
    tempo?: string;
    era?: string;
    language?: string;
  };
  tracks: Array<{
    id: string;
    name: string;
    artists: string;
    album: string;
    albumArt: string | null;
    previewUrl: string | null;
    spotifyUrl: string;
    popularity: number;
    durationMs: number;
  }>;
  message: string;
}

export class MusicSearchHandler {
  private spotifyClient: SpotifyClient;
  private aiAnalyzer: AIAnalyzer;

  constructor() {
    this.spotifyClient = new SpotifyClient();
    this.aiAnalyzer = new AIAnalyzer();
  }

  async handleSearchMusic(params: SearchMusicParams): Promise<SearchMusicResponse> {
    try {
      const { prompt, limit = 10 } = params;

      const analysis = await this.aiAnalyzer.analyzePrompt(prompt);
      
      const enhancedQuery = this.aiAnalyzer.buildEnhancedQuery(analysis);
      
      const spotifyTracks = await this.spotifyClient.searchTracks(enhancedQuery, limit);
      
      const tracks = spotifyTracks.map(track => this.spotifyClient.formatTrack(track));
      
      // デバッグ用ログ
      console.log('検索結果数:', tracks.length);
      if (tracks.length > 0) {
        console.log('最初の楽曲:', {
          name: tracks[0].name,
          previewUrl: tracks[0].previewUrl,
          hasPreview: !!tracks[0].previewUrl
        });
      }

      if (tracks.length === 0) {
        return {
          success: false,
          prompt,
          analysis,
          tracks: [],
          message: '楽曲が見つかりませんでした。別のキーワードでお試しください。',
        };
      }

      return {
        success: true,
        prompt,
        analysis,
        tracks,
        message: `${tracks.length}曲の楽曲が見つかりました。`,
      };
    } catch (error) {
      console.error('Search error:', error);
      
      return {
        success: false,
        prompt: params.prompt,
        analysis: {
          searchQuery: params.prompt,
        },
        tracks: [],
        message: `検索中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
      };
    }
  }
}