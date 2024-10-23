'use client';

import React, { useEffect, useRef } from 'react';
import canvas from '@styles/_canvas.module.scss';
import Game from '../utils/classes/Game';

const ScaledCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const widthRef = useRef<number>(0);
  const heightRef = useRef<number>(0);

  const setupCanvas = (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.scale(dpr, dpr); // Scale the canvas context
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return; // TypeScript safety check

    const context = canvas.getContext('2d');
    if (!context) return; // TypeScript safety check

    const updateDimension = (): void => {
      widthRef.current = canvas.clientWidth;
      heightRef.current = canvas.clientHeight;
      setupCanvas(canvas, context, widthRef.current, heightRef.current);
    };

    updateDimension(); // Set initial dimensions

    // Set up resize event listener
    window.addEventListener('resize', updateDimension);

    // Initialize the game
    const game = new Game(canvas, context);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('resize', updateDimension);
    };
  }, []);

  return <canvas ref={canvasRef} className={canvas.main} />;
};

export default ScaledCanvas;
