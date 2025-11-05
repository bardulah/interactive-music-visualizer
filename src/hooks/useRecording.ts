import { useState, useRef, useCallback } from 'react';

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async (canvas: HTMLCanvasElement) => {
    try {
      const stream = canvas.captureStream(30); // 30 FPS

      // Add audio track if available
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      if (audioStream) {
        const audioTrack = audioStream.getAudioTracks()[0];
        stream.addTrack(audioTrack);
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visualization-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording(canvas);
      }
    },
    [isRecording, startRecording, stopRecording]
  );

  return {
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
