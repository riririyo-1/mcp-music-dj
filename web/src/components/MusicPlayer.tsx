'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { Track } from '@/types/music';

interface MusicPlayerProps {
  track: Track | null;
  tracks?: Track[];
  onPlayStateChange?: (track: Track | null) => void;
  onTrackChange?: (track: Track) => void;
}

export default function MusicPlayer({ track, tracks = [], onPlayStateChange, onTrackChange }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(30);
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (!audioRef.current || !track?.previewUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      onPlayStateChange?.(null);
    } else {
      audioRef.current.play();
      onPlayStateChange?.(track);
    }
    setIsPlaying(!isPlaying);
  };

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
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNextTrack();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const getCurrentTrackIndex = () => {
    if (!track) return -1;
    return tracks.findIndex(t => t.id === track.id);
  };

  const handlePreviousTrack = () => {
    const currentIndex = getCurrentTrackIndex();
    if (currentIndex > 0) {
      const previousTrack = tracks[currentIndex - 1];
      onTrackChange?.(previousTrack);
    }
  };

  const handleNextTrack = () => {
    const currentIndex = getCurrentTrackIndex();
    let nextIndex;

    if (isShuffle) {
      // ランダム選択
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex < tracks.length) {
      const nextTrack = tracks[nextIndex];
      onTrackChange?.(nextTrack);
    } else {
      // 最後の曲の場合は停止
      setIsPlaying(false);
      setCurrentTime(0);
      onPlayStateChange?.(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  if (!track) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
        楽曲を選択してください
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      {track.previewUrl ? (
        <>
          <audio
            ref={audioRef}
            src={track.previewUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
          
          {/* 楽曲情報 */}
          <div className="flex items-center space-x-4 mb-4">
            {track.albumArt && (
              <img
                src={track.albumArt}
                alt={track.album}
                className="w-16 h-16 rounded"
              />
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{track.name}</h3>
              <p className="text-sm text-gray-600">{track.artists}</p>
              <p className="text-xs text-gray-500">{track.album}</p>
            </div>
          </div>

          {/* 再生コントロール */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition ${
                isShuffle ? 'text-green-500 bg-green-100' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Shuffle size={18} />
            </button>
            
            <button
              onClick={handlePreviousTrack}
              disabled={getCurrentTrackIndex() <= 0}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack size={20} />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={handleNextTrack}
              disabled={getCurrentTrackIndex() >= tracks.length - 1 && !isShuffle}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward size={20} />
            </button>
            
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition ${
                isRepeat ? 'text-green-500 bg-green-100' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* プログレスバー */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* ボリュームコントロール */}
          <div className="flex items-center space-x-2">
            <button onClick={toggleMute} className="text-gray-500 hover:text-gray-700">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
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
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-500 w-8">
              {Math.round((isMuted ? 0 : volume) * 100)}
            </span>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="flex items-center space-x-4 mb-4">
            {track.albumArt && (
              <img
                src={track.albumArt}
                alt={track.album}
                className="w-16 h-16 rounded"
              />
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{track.name}</h3>
              <p className="text-sm text-gray-600">{track.artists}</p>
              <p className="text-xs text-gray-500">{track.album}</p>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-gray-600 mb-2">プレビューは利用できません</p>
            <p className="text-xs text-gray-500">すべての楽曲にプレビューがあるわけではありません</p>
          </div>
          
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotifyで開く
          </a>
        </div>
      )}
    </div>
  );
}