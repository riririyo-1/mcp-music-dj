'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import TrackList from '@/components/TrackList';
import MusicPlayer from '@/components/MusicPlayer';
import { ChatMessage, Track, SearchMusicResponse } from '@/types/music';
import axios from 'axios';
import { Music2 } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Track | null>(null);

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
        setSelectedTrack(response.data.tracks[0]);
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-2">
          <Music2 className="text-green-500" size={32} />
          <h1 className="text-2xl font-bold text-gray-800">MCP Music DJ</h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
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
                    onSelectTrack={setSelectedTrack}
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
            <h2 className="text-xl font-semibold mb-4">プレイヤー</h2>
            <MusicPlayer 
              track={selectedTrack} 
              tracks={tracks}
              onPlayStateChange={setCurrentlyPlaying}
              onTrackChange={setSelectedTrack}
            />
          </div>
        </div>
      </div>
      
      {/* 下部の再生バー */}
      {currentlyPlaying && (
        <div className="bg-white border-t shadow-lg p-3">
          <div className="max-w-7xl mx-auto flex items-center space-x-4">
            {currentlyPlaying.albumArt && (
              <img
                src={currentlyPlaying.albumArt}
                alt={currentlyPlaying.album}
                className="w-10 h-10 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{currentlyPlaying.name}</h4>
              <p className="text-xs text-gray-600 truncate">{currentlyPlaying.artists}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                再生中
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}