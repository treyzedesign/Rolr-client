"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, X, Loader2, Volume2, RotateCcw } from "lucide-react";
import { generateSpeakingPrompt } from "@/lib/ai/gemini";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (audioBlob: Blob) => void;
  existingVoiceUrl?: string;
}

const SPEAKING_PROMPTS = [
  "I am passionate about technology and enjoy solving complex problems through innovative solutions. My experience in software development has taught me the importance of attention to detail and collaborative teamwork.",
  "Throughout my career, I have consistently demonstrated strong communication skills and the ability to adapt to new challenges. I believe that continuous learning is essential for professional growth and success.",
  "My approach to work combines analytical thinking with creative problem-solving. I thrive in environments where I can contribute to meaningful projects while developing my technical expertise.",
  "I am dedicated to delivering high-quality results and take pride in my ability to meet deadlines while maintaining attention to detail. Team collaboration and effective communication are my core strengths.",
  "With a strong foundation in my field, I am eager to apply my skills to challenging projects. I value professional development and actively seek opportunities to expand my knowledge and capabilities.",
  "My experience has prepared me to handle diverse responsibilities with confidence. I am committed to excellence and always strive to exceed expectations in everything I do.",
  "I bring a unique perspective to every project I undertake. My ability to think critically and communicate effectively allows me to contribute meaningfully to team objectives.",
  "Professional growth is important to me, and I actively seek opportunities to enhance my skills. I believe that dedication and continuous improvement lead to long-term success.",
  "I am excited about the possibility of contributing my expertise to innovative projects. My background has equipped me with the tools necessary to tackle complex challenges.",
  "My commitment to excellence is reflected in my work ethic and attention to detail. I am confident in my ability to make valuable contributions to any team."
];

export function VoiceRecordingModal({ 
  isOpen, 
  onClose, 
  onRecordingComplete, 
  existingVoiceUrl 
}: VoiceRecordingModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && !currentPrompt) {
      generateRandomPrompt();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      setAudioElement(audio);
    }
    
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioUrl]);

  const generateRandomPrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const response = await generateSpeakingPrompt();
      setCurrentPrompt(response.prompt);
      setWordCount(response.word_count);
      setEstimatedDuration(response.estimated_duration_seconds);
    } catch (error) {
      console.error('Error generating AI prompt:', error);
      // Fallback to static prompts
      const randomIndex = Math.floor(Math.random() * SPEAKING_PROMPTS.length);
      const fallbackPrompt = SPEAKING_PROMPTS[randomIndex];
      setCurrentPrompt(fallbackPrompt);
      setWordCount(fallbackPrompt.split(' ').length);
      setEstimatedDuration(Math.ceil(fallbackPrompt.split(' ').length / 2.5));
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const startRecording = async () => {
    // iOS specific: Check if we're in iOS and handle permissions differently
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please try a different browser.');
        return;
      }
      
      let stream: MediaStream;
      if (isIOS) {
        // iOS requires specific constraints and may need user gesture
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            } 
          });
        } catch (iosError) {
          console.error('iOS microphone access error:', iosError);
          // Fallback for iOS - try with basic constraints
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (fallbackError) {
            throw fallbackError;
          }
        }
      } else {
        // Standard browser handling
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;

      // Create MediaRecorder with iOS compatibility
      let mediaRecorder: MediaRecorder;
      let mimeType = 'audio/webm'; // Default fallback
      
      // Try to find the best supported MIME type
      const possibleTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mpeg',
        'audio/ogg'
      ];
      
      for (const type of possibleTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      console.log('Using MIME type:', mimeType);
      
      const options = mimeType ? { mimeType } : undefined;
      
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (recorderError) {
        console.error('MediaRecorder creation error:', recorderError);
        // Fallback to default constructor
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create blob with the actual recorded MIME type
        // For iOS compatibility, we'll convert to mpeg later if needed
        const recordedMimeType = mediaRecorder.mimeType || 'audio/webm';
        let audioBlob: Blob;
        
        if (isIOS && recordedMimeType.includes('webm')) {
          // For iOS, try to create as mpeg format blob for better compatibility
          audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        } else {
          // Use the recorded format
          audioBlob = new Blob(audioChunksRef.current, { type: recordedMimeType });
        }
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // Don't auto-save, let user review and save manually
      };

      // Start recording with error handling
      try {
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (startError) {
        console.error('Error starting recording:', startError);
        // Clean up on error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        alert('Failed to start recording. Please try again.');
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      // More detailed error message for iOS
      if (isIOS) {
        alert('To enable microphone on iOS: \n1. Use Safari browser\n2. Allow microphone access when prompted\n3. Make sure your device is not in silent mode');
      } else {
        alert('Please allow microphone access to record your voice introduction.');
      }
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
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    setAudioElement(null);
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!audioUrl || audioChunksRef.current.length === 0) return;
    
    setIsSaving(true);
    
    // Stop the audio if it's playing
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
    
    try {
      // Create blob with appropriate MIME type for iOS compatibility
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      let audioBlob: Blob;
      
      if (isIOS) {
        // For iOS, create as mpeg format for better compatibility
        audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
      } else {
        // For other browsers, use the original format
        audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      }
      
      // Wait for the API response
      await onRecordingComplete(audioBlob);
      
      // Only close the modal after successful save
      onClose();
    } catch (error) {
      console.error('Error saving recording:', error);
      // You could show an error message here if needed
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Voice Recording Assessment
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Read the text below to record your voice introduction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Prompt Text */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Read this text aloud:
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200">
                  ✨ AI Generated
                </span>
              </div>
              <button
                onClick={generateRandomPrompt}
                disabled={isRecording || isGeneratingPrompt}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3 h-3" />
                {isGeneratingPrompt ? 'Generating...' : 'AI Text'}
              </button>
            </div>
            
            {isGeneratingPrompt ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : (
              <>
                <blockquote className="text-lg italic font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{currentPrompt}"
                </blockquote>
                {wordCount && estimatedDuration && (
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Words:</span> {wordCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Est. Time:</span> {estimatedDuration}s
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recording Status */}
          <div className="flex items-center justify-center">
            {isRecording ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">
                  {isPaused ? 'Paused' : 'Recording'} 
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-mono">
                  {formatTime(recordingTime)}
                </span>
                <AudioEqualizer isPlaying={!isPaused} size="md" />
              </div>
            ) : audioUrl ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <span className="text-green-600 font-medium">
                  Recording completed
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-mono">
                  {formatTime(recordingTime)}
                </span>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                Click "Start Recording" and read the text above
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={!currentPrompt}
                className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                >
                  <Square className="w-5 h-5" />
                </button>
                <button
                  onClick={pauseRecording}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
              </>
            )}

            {audioUrl && !isRecording && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={togglePlayPause}
                  className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={deleteRecording}
                  className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Recording Tips:</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>Speak clearly and at a natural pace</li>
              <li>Find a quiet environment with minimal background noise</li>
              <li>Read the entire text for best assessment results</li>
              <li>Allow microphone access when prompted</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!audioUrl || isSaving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Recording'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
