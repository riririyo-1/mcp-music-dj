'use client';

import { useState } from 'react';
import { Send, Music, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types/music';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Music size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold mb-2">音楽を探しましょう！</p>
            <p className="text-sm">自然言語でリクエストしてください</p>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-400">例:</p>
              <p>"カフェで流れるようなボサノバ"</p>
              <p>"朝のランニングに最適な曲"</p>
              <p>"90年代の懐かしいJ-POP"</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.tracks && message.tracks.length > 0 && (
                <p className="text-sm mt-2 opacity-80">
                  {message.tracks.length}曲の楽曲が見つかりました
                </p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Loader2 className="animate-spin" size={20} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="音楽のリクエストを入力..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}