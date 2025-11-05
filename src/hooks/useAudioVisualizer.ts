import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioProcessor } from '../utils/audioProcessor';
import { AudioData, PlaybackState } from '../types';

export const useAudioVisualizer = () => {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
  });
  const [fileName, setFileName] = useState<string>('');

  const audioProcessorRef = useRef<AudioProcessor | null>(null);
  const animationFrameRef = useRef<number>();

  const updateAudioData = useCallback(() => {
    if (audioProcessorRef.current) {
      const data = audioProcessorRef.current.getAudioData();
      if (data) {
        setAudioData(data);
      }
    }
    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, []);

  const loadAudio = async (file: File) => {
    // Clean up existing audio
    if (audioProcessorRef.current) {
      audioProcessorRef.current.destroy();
    }

    // Create new processor
    audioProcessorRef.current = new AudioProcessor();
    const audio = await audioProcessorRef.current.loadAudio(file);

    setFileName(file.name);

    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      setPlaybackState((prev) => ({
        ...prev,
        duration: audio.duration,
      }));
    });

    audio.addEventListener('timeupdate', () => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    });

    audio.addEventListener('play', () => {
      setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
      updateAudioData();
    });

    audio.addEventListener('pause', () => {
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    });

    audio.addEventListener('ended', () => {
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    });

    // Set initial volume
    audioProcessorRef.current.setVolume(playbackState.volume);
  };

  const play = () => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.play();
    }
  };

  const pause = () => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.pause();
    }
  };

  const togglePlayPause = () => {
    if (playbackState.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (time: number) => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.setCurrentTime(time);
    }
  };

  const setVolume = (volume: number) => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.setVolume(volume);
    }
    setPlaybackState((prev) => ({ ...prev, volume }));
  };

  const setSmoothingTimeConstant = (value: number) => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.setSmoothingTimeConstant(value);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioProcessorRef.current) {
        audioProcessorRef.current.destroy();
      }
    };
  }, []);

  return {
    audioData,
    playbackState,
    fileName,
    loadAudio,
    togglePlayPause,
    seek,
    setVolume,
    setSmoothingTimeConstant,
  };
};
