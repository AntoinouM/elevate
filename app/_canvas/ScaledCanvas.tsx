'use client';

import React, { useEffect, useRef } from 'react';
import canvas from '@styles/_canvas.module.scss';

const ScaledCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // TypeScript safety check

    const context = canvas.getContext('2d');
    if (!context) return; // TypeScript safety check

    const dpr = window.devicePixelRatio || 1;

    // Set the canvas size based on devicePixelRatio
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the canvas context to make drawing consistent
    context.scale(dpr, dpr);
  }, []);

  return <canvas ref={canvasRef} className={canvas.main} />;
};

export default ScaledCanvas;
