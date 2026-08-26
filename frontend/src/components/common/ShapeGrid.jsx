import { useEffect, useRef } from 'react';
import './ShapeGrid.css';

export default function ShapeGrid({ direction = 'right', speed = 1, borderColor = '#999', squareSize = 40, size, hoverFillColor = '#222', hoverColor, shape = 'square', className = '' }) {
  const cellSize = size ?? squareSize;
  const fillColor = hoverColor ?? hoverFillColor;
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(null);
  const opacityRef = useRef(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const hexWidth = cellSize * 1.5;
    const hexHeight = cellSize * Math.sqrt(3);

    const resize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * scale;
      canvas.height = canvas.offsetHeight * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const drawHex = (x, y) => {
      ctx.beginPath();
      for (let side = 0; side < 6; side += 1) {
        const angle = side * Math.PI / 3;
        const pointX = x + cellSize * Math.cos(angle);
        const pointY = y + cellSize * Math.sin(angle);
        side === 0 ? ctx.moveTo(pointX, pointY) : ctx.lineTo(pointX, pointY);
      }
      ctx.closePath();
    };
    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const offsetX = ((offsetRef.current.x % hexWidth) + hexWidth) % hexWidth;
      const offsetY = ((offsetRef.current.y % hexHeight) + hexHeight) % hexHeight;
      ctx.clearRect(0, 0, width, height);
      const columns = Math.ceil(width / hexWidth) + 3;
      const rows = Math.ceil(height / hexHeight) + 3;
      for (let column = -2; column < columns; column += 1) {
        for (let row = -2; row < rows; row += 1) {
          const x = column * hexWidth + offsetX;
          const y = row * hexHeight + (column % 2 ? hexHeight / 2 : 0) + offsetY;
          const key = `${column},${row}`;
          const opacity = opacityRef.current.get(key) || 0;
          if (opacity) {
            ctx.globalAlpha = opacity;
            drawHex(x, y);
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          drawHex(x, y);
          ctx.strokeStyle = borderColor;
          ctx.stroke();
        }
      }
    };
    const animate = () => {
      const distance = Math.max(speed, 0.1);
      if (direction === 'right' || direction === 'diagonal') offsetRef.current.x = (offsetRef.current.x - distance + hexWidth * 2) % (hexWidth * 2);
      if (direction === 'left') offsetRef.current.x = (offsetRef.current.x + distance + hexWidth * 2) % (hexWidth * 2);
      if (direction === 'up' || direction === 'diagonal') offsetRef.current.y = (offsetRef.current.y + distance + hexHeight) % hexHeight;
      if (direction === 'down') offsetRef.current.y = (offsetRef.current.y - distance + hexHeight) % hexHeight;
      for (const [key, opacity] of opacityRef.current) {
        const next = opacity * 0.85;
        next < 0.005 ? opacityRef.current.delete(key) : opacityRef.current.set(key, next);
      }
      if (hoverRef.current) opacityRef.current.set(`${hoverRef.current.x},${hoverRef.current.y}`, 1);
      draw();
      frameRef.current = requestAnimationFrame(animate);
    };
    const handleMouseMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      hoverRef.current = {
        x: Math.round((event.clientX - bounds.left - offsetRef.current.x) / hexWidth),
        y: Math.round((event.clientY - bounds.top - offsetRef.current.y) / hexHeight)
      };
    };
    const handleMouseLeave = () => { hoverRef.current = null; };
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [borderColor, direction, fillColor, shape, speed, cellSize]);

  return <canvas ref={canvasRef} className={`shapegrid-canvas ${className}`} aria-hidden="true" />;
}