import React, { useRef, useEffect } from 'react';

const Starfield = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars with twinkling properties
    const numStars = 300;
    starsRef.current = [];
    for (let i = 0; i < numStars; i++) {
      starsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        baseRadius: Math.random() * 2 + 0.5,
        radius: Math.random() * 2 + 0.5,
        color: `hsl(${220 + Math.random() * 40}, 60%, ${60 + Math.random() * 20}%)`,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      timeRef.current += 0.016; // Approximate 60fps
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        // Twinkling effect
        star.radius = star.baseRadius + Math.sin(timeRef.current * star.twinkleSpeed + star.twinkleOffset) * 0.3;

        // Calculate parallax effect based on mouse position
        const parallaxX = (mouseRef.current.x - canvas.width / 2) * (star.z / 1000) * 0.15;
        const parallaxY = (mouseRef.current.y - canvas.height / 2) * (star.z / 1000) * 0.15;

        const x = star.x + parallaxX;
        const y = star.y + parallaxY;

        // Wrap around edges
        if (x < 0) star.x = canvas.width;
        if (x > canvas.width) star.x = 0;
        if (y < 0) star.y = canvas.height;
        if (y > canvas.height) star.y = 0;

        // Draw star with glow effect
        ctx.save();
        ctx.shadowColor = star.color;
        ctx.shadowBlur = star.radius * 2;
        ctx.beginPath();
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, #0d1b2a 0%, #1b263b 50%, #0a0a0a 100%)',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default Starfield;