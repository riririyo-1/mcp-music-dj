'use client';

import { Track } from '@/types/music';
import { Play, ExternalLink, Clock } from 'lucide-react';

interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
  selectedTrackId?: string;
}

export default function TrackList({ tracks, onSelectTrack, selectedTrackId }: TrackListProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.id}
          className={`bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
            selectedTrackId === track.id ? 'border-green-500 shadow-md' : ''
          }`}
          onClick={() => onSelectTrack(track)}
        >
          <div className="flex items-center space-x-4">
            {track.albumArt && (
              <img
                src={track.albumArt}
                alt={track.album}
                className="w-12 h-12 rounded"
              />
            )}
            
            <div className="flex-1">
              <h4 className="font-semibold">{track.name}</h4>
              <p className="text-sm text-gray-600">{track.artists}</p>
              <p className="text-xs text-gray-500">{track.album}</p>
            </div>

            <div className="flex items-center space-x-3 text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span className="text-xs">{formatDuration(track.durationMs)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                  人気度: {track.popularity}
                </div>
              </div>

              {track.previewUrl && (
                <Play size={16} className="text-green-500" />
              )}
              
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-600"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}