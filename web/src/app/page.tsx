'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import TrackList from '@/components/TrackList';
import PlayerFooter from '@/components/PlayerFooter';
import { ChatMessage, Track, SearchMusicResponse } from '@/types/music';
import axios from 'axios';
import { Music2 } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSendMessage = async (prompt: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post<SearchMusicResponse>('/api/mcp', {
        prompt,
        limit: 10,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        timestamp: Date.now(),
        tracks: response.data.tracks,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.data.success && response.data.tracks.length > 0) {
        setTracks(response.data.tracks);
        const firstTrack = response.data.tracks[0];
        setSelectedTrack(firstTrack);
        console.log('最初の楽曲を選択:', firstTrack);
        console.log('プレビューURL:', firstTrack.previewUrl);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `エラーが発生しました: ${
          error instanceof Error ? error.message : '不明なエラー'
        }`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    console.log('再生/一時停止:', !isPlaying);
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (track: Track) => {
    console.log('楽曲選択:', track);
    setSelectedTrack(track);
    // プレビューURLがある場合のみ自動再生
    if (track.previewUrl) {
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-2">
          <Music2 className="text-green-500" size={32} />
          <h1 className="text-2xl font-bold text-gray-800">MCP Music DJ</h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '5rem' }}>
        <div className="h-full max-w-7xl mx-auto flex">
          <div className="w-1/3 border-r bg-white">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {tracks.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">検索結果</h2>
                  <TrackList
                    tracks={tracks}
                    onSelectTrack={handleTrackSelect}
                    selectedTrackId={selectedTrack?.id}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Music2 size={48} className="mx-auto mb-4" />
                  <p>音楽を検索してください</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-80 border-l p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">詳細情報</h2>
            {selectedTrack ? (
              <div className="space-y-4">
                {selectedTrack.albumArt && (
                  <img
                    src={selectedTrack.albumArt}
                    alt={selectedTrack.album}
                    className="w-full rounded-lg shadow"
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg">{selectedTrack.name}</h3>
                  <p className="text-gray-600">{selectedTrack.artists}</p>
                  <p className="text-sm text-gray-500">{selectedTrack.album}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                    人気度: {selectedTrack.popularity}
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                    {Math.floor(selectedTrack.durationMs / 60000)}:{((selectedTrack.durationMs % 60000) / 1000).toFixed(0).padStart(2, '0')}
                  </div>
                </div>
                <a
                  href={selectedTrack.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition w-full justify-center"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotifyで開く
                </a>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>楽曲を選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* フッタープレイヤー */}
      <PlayerFooter
        currentTrack={selectedTrack}
        tracks={tracks}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onTrackChange={handleTrackSelect}
      />
      
      {/* フッター分のスペーサー - 常に表示 */}
    </div>
  );
}