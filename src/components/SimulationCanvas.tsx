import React, { useEffect, useRef } from 'react';
import { useStore } from '../hooks/useSimulation';
import type { Point } from '../utils/types';

export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trajectory, obstacles, start, goal } = useStore();
  const crashedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const padding = 20;
    const minX = Math.min(start.x, goal.x);
    const maxX = Math.max(start.x, goal.x);
    const minY = Math.min(start.y, goal.y);
    const maxY = Math.max(start.y, goal.y);
    const scaleX = (canvas.width - padding*2) / (maxX - minX || 1);
    const scaleY = (canvas.height - padding*2) / (maxY - minY || 1);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw path
      if (trajectory.length > 1) {
        ctx.beginPath();
        trajectory.forEach((p, i) => {
          const x = (p.x - minX) * scaleX + padding;
          const y = (p.y - minY) * scaleY + padding;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw obstacles
      obstacles.forEach(o => {
        const x = (o.x - minX) * scaleX + padding;
        const y = (o.y - minY) * scaleY + padding;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI*2);
        ctx.fillStyle = 'red';
        ctx.fill();
      });

      // Crash detection
      if (!crashedRef.current) {
        for (const p of trajectory) {
          if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
            alert('Crashed into a wall!');
            crashedRef.current = true;
            break;
          }
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
  }, [trajectory, obstacles, start, goal]);

  return (
    <canvas ref={canvasRef} width={600} height={400} className="border bg-white" />
  );
}
