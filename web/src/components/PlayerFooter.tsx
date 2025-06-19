'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Track } from '@/types/music';

declare global {
  interface Window {
    debugAudio?: HTMLAudioElement;
  }
}

interface PlayerFooterProps {
  currentTrack: Track | null;
  tracks: Track[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onTrackChange: (track: Track) => void;
}

export default function PlayerFooter({ 
  currentTrack, 
  tracks, 
  isPlaying, 
  onPlayPause,
  onTrackChange 
}: PlayerFooterProps) {
  console.log('PlayerFooter レンダー:', { 
    currentTrack: currentTrack?.name, 
    previewUrl: currentTrack?.previewUrl,
    isPlaying 
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = async () => {
      if (!audioRef.current || !currentTrack?.previewUrl) return;
      
      try {
        if (isPlaying) {
          console.log('Audio再生試行:', currentTrack.previewUrl);
          // ブラウザの自動再生ポリシーに対応
          await audioRef.current.play();
          console.log('Audio再生成功');
        } else {
          audioRef.current.pause();
          console.log('Audio一時停止');
        }
      } catch (error: any) {
        console.error('再生エラー:', error);
        // DOMException: The play() request was interrupted
        if (error?.name === 'AbortError') {
          console.log('再生が中断されました');
        } else if (error?.name === 'NotAllowedError') {
          console.log('ブラウザの自動再生ポリシーによりブロックされました');
        }
      }
    };
    
    playAudio();
  }, [isPlaying, currentTrack]);

  // 楽曲が変更されたときの処理
  useEffect(() => {
    setCurrentTime(0);
    if (audioRef.current && currentTrack?.previewUrl) {
      audioRef.current.load();
      // デバッグ用にグローバルに公開
      window.debugAudio = audioRef.current;
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handlePrevious = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      onTrackChange(tracks[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < tracks.length - 1) {
      onTrackChange(tracks[currentIndex + 1]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 常に表示するため、この行を削除

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      {/* audioタグは常にレンダリング */}
      <audio
        ref={audioRef}
        src={currentTrack?.previewUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={(e) => {
          console.error('Audioエラー:', e);
          console.error('プレビューURL:', currentTrack?.previewUrl);
        }}
        onCanPlay={() => console.log('Audio再生準備完了')}
      />
      
      {/* プログレスバー */}
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-green-500 transition-all"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          {/* 楽曲情報 */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {currentTrack ? (
              <>
                {currentTrack.albumArt && (
                  <img
                    src={currentTrack.albumArt}
                    alt={currentTrack.album}
                    className="w-12 h-12 rounded shadow"
                  />
                )}
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm truncate">{currentTrack.name}</h4>
                  <p className="text-xs text-gray-600 truncate">{currentTrack.artists}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">曲が選択されていません</p>
                  <p className="text-xs text-gray-400">検索して楽曲を選択してください</p>
                </div>
              </div>
            )}
          </div>

          {/* 再生コントロール */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={!currentTrack || tracks.findIndex(t => t.id === currentTrack?.id) === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={() => {
                console.log('再生ボタンクリック:', { currentTrack, isPlaying, previewUrl: currentTrack?.previewUrl });
                onPlayPause();
              }}
              disabled={!currentTrack || !currentTrack.previewUrl}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={handleNext}
              disabled={!currentTrack || tracks.findIndex(t => t.id === currentTrack?.id) === tracks.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* タイムバー */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-xs">
            <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              disabled={!currentTrack || !currentTrack.previewUrl}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-xs text-gray-500">{formatTime(duration)}</span>
          </div>

          {/* ボリュームコントロール */}
          <div className="hidden lg:flex items-center space-x-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (newVolume > 0) setIsMuted(false);
              }}
              className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}