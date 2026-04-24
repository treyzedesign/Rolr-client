"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Upload } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  existingVoiceUrl?: string;
  isUploading?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, existingVoiceUrl, isUploading = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingVoiceUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (existingVoiceUrl) {
      setAudioUrl(existingVoiceUrl);
    }
  }, [existingVoiceUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionGranted(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete?.(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionGranted(false);
      alert('Please allow microphone access to record your voice introduction.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="w-4 h-4" />
            Record
          </button>
        ) : (
          <>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
            <button
              onClick={pauseRecording}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </>
        )}

        {audioUrl && !isRecording && (
          <>
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={deleteRecording}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        )}
      </div>

      {/* Recording Status */}
      <div className="flex items-center gap-3">
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600 font-medium">
              {isPaused ? 'Paused' : 'Recording'} • {formatTime(recordingTime)}
            </span>
          </div>
        )}
        
        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">
              Voice intro ready • {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Instructions */}
      {!audioUrl && !isRecording && (
        <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Voice Introduction Tips:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Record a 30-60 second introduction about yourself</li>
            <li>Speak clearly and mention your key skills</li>
            <li>Find a quiet environment with minimal background noise</li>
            <li>Allow microphone access when prompted</li>
          </ul>
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Uploading voice introduction...
        </div>
      )}
    </div>
  );
}
