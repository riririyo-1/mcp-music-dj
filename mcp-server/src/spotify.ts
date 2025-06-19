import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  preview_url: string | null;
  external_urls: { spotify: string };
  popularity: number;
  duration_ms: number;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

export class SpotifyClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private clientId: string = process.env.SPOTIFY_CLIENT_ID || '',
    private clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET || ''
  ) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify credentials not found in environment variables');
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        SPOTIFY_TOKEN_URL,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      
      return this.accessToken!;
    } catch (error) {
      throw new Error(`Failed to get Spotify access token: ${error}`);
    }
  }

  async searchTracks(query: string, limit: number = 10): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get<SpotifySearchResponse>(
        `${SPOTIFY_API_BASE}/search`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            q: query,
            type: 'track',
            market: 'JP',
            limit: limit,
          },
        }
      );

      return response.data.tracks.items.sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
      throw new Error(`Failed to search tracks: ${error}`);
    }
  }

  formatTrack(track: SpotifyTrack) {
    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url || null,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      popularity: track.popularity,
      durationMs: track.duration_ms,
    };
  }
}