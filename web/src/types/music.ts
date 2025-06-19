export interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumArt: string | null;
  previewUrl: string | null;
  spotifyUrl: string;
  popularity: number;
  durationMs: number;
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
  tracks: Track[];
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tracks?: Track[];
}