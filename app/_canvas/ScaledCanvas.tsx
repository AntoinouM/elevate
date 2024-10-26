'use client';

import React, { useEffect, useRef } from 'react';
import canvas from '@styles/_canvas.module.scss';
import Game from '../utils/classes/Game';

const ScaledCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasBackground = useRef<HTMLCanvasElement | null>(null);
  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);

  const setupCanvas = (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr; // Set the actual pixel width
    canvas.height = height * dpr; // Set the actual pixel height
    canvas.style.width = width + 'px'; // Set the style width
    canvas.style.height = height + 'px'; // Set the style height
    context.scale(dpr, dpr); // Scale the context for high-DPI displays
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasBg = canvasBackground.current;

    if (!canvas || !canvasBg) return; // TypeScript safety check

    const context = canvas.getContext('2d');
    const contextBg = canvasBg.getContext('2d');
    if (!context || !contextBg) return; // TypeScript safety check

    const updateDimension = (): void => {
      widthRef.current = canvas.clientWidth;
      heightRef.current = canvas.clientHeight;
      setupCanvas(canvas, context, widthRef.current, heightRef.current);
      setupCanvas(canvasBg, contextBg, widthRef.current, heightRef.current);
    };

    updateDimension(); // Set initial dimensions

    // Set up resize event listener
    window.addEventListener('resize', updateDimension);

    // Initialize the game
    const game = new Game(canvas, context);
    console.log(game);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('resize', updateDimension);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasBackground} className={canvas.background} />
      <canvas ref={canvasRef} className={canvas.main} />
    </>
  );
};

export default ScaledCanvas;
