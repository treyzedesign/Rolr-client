"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface IOSAudioPlayerProps {
  audioUrl: string;
  className?: string;
}

export function IOSAudioPlayer({ audioUrl, className = "" }: IOSAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create audio element with iOS-specific settings
    const audio = new Audio();
    audioRef.current = audio;
    
    // iOS Safari requires these settings for proper playback
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    
    // Set up event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      let errorMessage = 'Unable to play this audio file.';
      
      // Get more detailed error information
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio playback was aborted.';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error occurred while loading audio.';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio format not supported on this device.';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio source not supported. The file may be in WebM format which is not supported on iOS. Try re-recording in MP3 format.';
            break;
          default:
            errorMessage = `Audio error occurred (code: ${audio.error.code}).`;
        }
        console.error('Audio error details:', {
          code: audio.error.code,
          message: audio.error.message,
          src: audio.src
        });
      } else {
        console.error('Audio error event:', e);
      }
      
      // iOS-specific error handling
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        errorMessage += ' iOS Safari may have issues with this audio format. Try re-recording in a compatible format.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    
    const handleLoadStart = () => {
      setIsLoading(true);
    };
    
    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    
    // Set audio source with iOS-specific handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // iOS Safari: Try different loading strategies
      audio.preload = 'none'; // Don't preload on iOS
      
      // Add timestamp to prevent caching issues
      const separator = audioUrl.includes('?') ? '&' : '?';
      const iosAudioUrl = `${audioUrl}${separator}_t=${Date.now()}`;
      
      audio.src = iosAudioUrl;
    } else {
      audio.src = audioUrl;
    }
    
    // Cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    // Clear previous errors when trying to play
    if (error) {
      setError(null);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        // iOS Safari requires user interaction to play
        setIsLoading(true);
        
        // For iOS, try to load the audio first
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && audioRef.current.preload === 'none') {
          audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Play error:', error);
            setIsLoading(false);
            
            // Provide specific error messages for iOS
            if (error.name === 'NotAllowedError') {
              setError('Audio playback blocked. Please tap the play button again and allow playback.');
            } else if (error.name === 'NotSupportedError') {
              setError('This audio format is not supported on your device. Try re-recording in a different format.');
            } else {
              setError('Failed to play audio. Please try again.');
            }
          });
        }
      } catch (error) {
        console.error('Play error:', error);
        setIsLoading(false);
        setError('Unable to play audio on this device.');
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
    
    // Force reload the audio
    if (audioRef.current) {
      const currentSrc = audioRef.current.src;
      audioRef.current.src = '';
      audioRef.current.src = currentSrc;
      audioRef.current.load();
    }
  };

  const detectMimeType = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return contentType || 'audio/unknown';
    } catch (error) {
      console.error('Error detecting MIME type:', error);
      return 'audio/unknown';
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <p className="text-xs text-red-500">
              If this issue persists, try re-recording your voice introduction in a different format.
            </p>
          </div>
          <button
            onClick={handleRetry}
            className="ml-3 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        {/* Audio Info and Progress */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Voice Recording Preview
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer"
            >
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
