'use client'
import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  stream: MediaStream | null;
}

export function AudioWaveform({ stream }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    if (!stream || !canvasRef.current) return;
    
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 5;
        
        ctx.fillStyle = `rgb(${barHeight + 200}, 0, 0)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [stream]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={20} 
      className="w-full rounded-md bg-background"
    />
  );
} 