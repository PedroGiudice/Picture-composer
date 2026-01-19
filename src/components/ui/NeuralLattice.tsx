import React, { useRef, useEffect } from 'react';

interface NeuralLatticeProps {
  text?: string;
  className?: string;
}

export const NeuralLattice: React.FC<NeuralLatticeProps> = ({ text = "ANALYZING", className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - canvas.width / 2;
      mouse.y = e.clientY - rect.top - canvas.height / 2;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const easeInOutSigmoid = (x: number) => 1 / (1 + Math.exp(-10 * (x - 0.5)));

    const render = (time: number) => {
      const t = time * 0.001;
      
      // 1. Calculate 'Breath'
      const cycle = (Math.sin(t * 0.5) + 1) / 2;
      const breath = 0.8 + easeInOutSigmoid(cycle) * 0.6; // map(cycle, 0, 1, 0.8, 1.4)

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      const numPoints = 80;
      const goldenAngle = 137.508 * (Math.PI / 180);
      const rotation = t * 0.2;
      const spread = 14 * breath;
      
      const points: { x: number; y: number }[] = [];

      // 2. Generate Points with Mouse Interaction
      for (let i = 0; i < numPoints; i++) {
        const angle = i * goldenAngle + rotation;
        const dist = spread * Math.sqrt(i);
        
        let x = Math.cos(angle) * dist;
        let y = Math.sin(angle) * dist;
        
        // Repulsion Field
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dToMouse = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 120;
        
        if (dToMouse < repelRadius) {
          const force = (repelRadius - dToMouse) / repelRadius;
          const push = force * force * force * 60;
          const len = dToMouse || 1;
          x += (dx / len) * push;
          y += (dy / len) * push;
        }

        points.push({ x, y });
      }

      // 3. Render Connections
      const neighbors = [1, 8, 13];
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const hue = (180 + i * 2 + t * 20) % 360;
        
        // Particles
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 1)`;
        const pSize = 1 + (i / numPoints) * 3;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, pSize, 0, Math.PI * 2);
        ctx.fill();

        // Lines
        for (const offset of neighbors) {
          const neighborIdx = i - offset;
          if (neighborIdx >= 0) {
            const p2 = points[neighborIdx];
            const ldx = p1.x - p2.x;
            const ldy = p1.y - p2.y;
            const d = Math.sqrt(ldx * ldx + ldy * ldy);
            
            if (d < 70 * breath) {
              const alpha = 1 - (d / (70 * breath));
              ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${alpha * 0.5})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center gap-8 ${className}`}>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="w-64 h-64 md:w-80 md:h-80 opacity-80"
      />
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] tracking-[0.4em] font-bold text-white/30 uppercase animate-pulse">
          {text}
        </p>
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
};