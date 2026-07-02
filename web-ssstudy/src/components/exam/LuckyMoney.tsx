"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Book as BookIcon,
  FileText,
  Clock,
  FilePlus,
  PlusSquare,
  Play,
  Image as ImageIcon,
  Link as LinkIcon,
  BarChart,
  Video,
  Star,
  Users,
  Menu,
  CheckSquare,
  ListChecks,
  Layers,
  Info,
  BookOpen,
  FolderPlus,
  Tag,
  Gift,
  Sparkles,
} from "lucide-react";

const ctaIconMap: Record<string, React.ReactNode> = {
  Book: <BookIcon size={18} className="text-white" />,
  BookOpen: <BookOpen size={18} className="text-white" />,
  FileText: <FileText size={18} className="text-white" />,
  FilePlus: <FilePlus size={18} className="text-white" />,
  Clock: <Clock size={18} className="text-white" />,
  CheckSquare: <CheckSquare size={18} className="text-white" />,
  ListChecks: <ListChecks size={18} className="text-white" />,
  PlusSquare: <PlusSquare size={18} className="text-white" />,
  Play: <Play size={18} className="text-white" />,
  Menu: <Menu size={18} className="text-white" />,
  Image: <ImageIcon size={18} className="text-white" />,
  Video: <Video size={18} className="text-white" />,
  Link: <LinkIcon size={18} className="text-white" />,
  BarChart: <BarChart size={18} className="text-white" />,
  Info: <Info size={18} className="text-white" />,
  Star: <Star size={18} className="text-white" />,
  Users: <Users size={18} className="text-white" />,
  FolderPlus: <FolderPlus size={18} className="text-white" />,
  Layers: <Layers size={18} className="text-white" />,
  Tag: <Tag size={18} className="text-white" />,
  Gift: <Gift size={18} className="text-white" />,
  Sparkles: <Sparkles size={18} className="text-white" />,
};

interface LuckyMoneyModalProps {
  open: boolean;
  onClose: () => void;
  bannerImage: string;
  redirectUrl?: string | null;
  score?: number;
  minScore?: number;
  description?: string;
  ctaIcon?: { text?: string; icon?: string; icon_src?: string } | null;
}

// Firework particle interface
interface FireworkParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  sparkle: boolean;
}

// Firework rocket interface
interface FireworkRocket {
  id: number;
  x: number;
  y: number;
  targetY: number;
  speed: number;
  color: string;
  secondaryColor: string;
  exploded: boolean;
  particles: FireworkParticle[];
}

// Nhiều màu sắc rực rỡ
const FIREWORK_COLORS = [
  "#ff0000", "#ff3333", "#ffd700", "#ffcc00", "#ff8c00",
  "#ff69b4", "#ff1493", "#00ff88", "#00ff00", "#00bfff",
  "#00ffff", "#ff00ff", "#ffff00", "#ffffff",
];

const LuckyMoneyModal: React.FC<LuckyMoneyModalProps> = ({
  open,
  onClose,
  bannerImage,
  redirectUrl,
  description = "",
  ctaIcon,
}) => {
  const resolvedCtaIcon = ctaIcon?.icon_src ? (
    <img src={ctaIcon.icon_src} alt="" className="w-5 h-5 object-contain" />
  ) : ctaIcon?.icon ? (
    ctaIconMap[ctaIcon.icon] || null
  ) : null;
  const ctaText = ctaIcon?.text || "Nhận lì xì";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const rocketsRef = useRef<FireworkRocket[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Create explosion particles - TỐI ƯU
  const createExplosion = useCallback((x: number, y: number, color: string, secondaryColor: string): FireworkParticle[] => {
    const particles: FireworkParticle[] = [];
    const particleCount = 50 + Math.floor(Math.random() * 20);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
      const speed = 2.5 + Math.random() * 4;
      const useSecondary = Math.random() > 0.6;
      
      particles.push({
        id: i, x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: useSecondary ? secondaryColor : color,
        size: 2 + Math.random() * 2.5,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.008,
        sparkle: Math.random() > 0.7,
      });
    }
    return particles;
  }, []);

  // Launch a new firework
  const launchFirework = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
    const secondaryColor = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];

    const rocket: FireworkRocket = {
      id: Date.now() + Math.random(),
      x: Math.random() * canvas.width * 0.7 + canvas.width * 0.15,
      y: canvas.height,
      targetY: canvas.height * 0.15 + Math.random() * canvas.height * 0.35,
      speed: 8 + Math.random() * 4,
      color,
      secondaryColor,
      exploded: false,
      particles: [],
    };
    rocketsRef.current.push(rocket);
  }, []);

  // Animation loop - TỐI ƯU HIỆU SUẤT
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Trail effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rocketsRef.current = rocketsRef.current.filter((rocket) => {
      if (!rocket.exploded) {
        // Vẽ đầu rocket sáng hơn
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = rocket.color + "80";
        ctx.fill();

        // Trail gradient
        const gradient = ctx.createLinearGradient(rocket.x, rocket.y, rocket.x, rocket.y + 40);
        gradient.addColorStop(0, rocket.color);
        gradient.addColorStop(1, "transparent");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rocket.x, rocket.y);
        ctx.lineTo(rocket.x, rocket.y + 40);
        ctx.stroke();

        rocket.y -= rocket.speed;
        rocket.speed *= 0.99;

        if (rocket.y <= rocket.targetY || rocket.speed < 3) {
          rocket.exploded = true;
          rocket.particles = createExplosion(rocket.x, rocket.y, rocket.color, rocket.secondaryColor);
        }
        return true;
      } else {
        rocket.particles = rocket.particles.filter((p) => {
          p.vy += 0.05;
          p.vx *= 0.99;
          p.vy *= 0.99;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          if (p.alpha <= 0) return false;

          const alphaHex = Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
          
          // Particle chính
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${alphaHex}`;
          ctx.fill();

          // Glow effect nhẹ (không dùng shadowBlur)
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 80).toString(16).padStart(2, "0")}`;
          ctx.fill();
          
          // Sparkle cho một số particle
          if (p.sparkle && p.alpha > 0.5 && Math.random() > 0.5) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.3})`;
            ctx.fill();
          }

          return true;
        });
        return rocket.particles.length > 0;
      }
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [createExplosion]);

  // Start fireworks - INFINITE LOOP
  useEffect(() => {
    if (!open) {
      setShowContent(false);
      setImageLoaded(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    animationRef.current = requestAnimationFrame(animate);

    const launchInterval = setInterval(() => {
      launchFirework();
      if (Math.random() > 0.5) setTimeout(launchFirework, 100 + Math.random() * 200);
    }, 400 + Math.random() * 400);

    for (let i = 0; i < 3; i++) setTimeout(launchFirework, i * 200);

    const contentTimeout = setTimeout(() => setShowContent(true), 600);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      clearInterval(launchInterval);
      clearTimeout(contentTimeout);
      rocketsRef.current = [];
    };
  }, [open, animate, launchFirework]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBannerClick = () => {
    if (redirectUrl) window.open(redirectUrl, "_blank", "noopener,noreferrer");
  };

  // Chỉ hiển thị nút CTA khi có redirectUrl
  const showCtaButton = !!redirectUrl;

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      {/* Backdrop - không đóng khi click, chỉ đóng qua 2 nút */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Fireworks Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1001]"
        style={{ background: "transparent" }}
      />

      {/* Nút X đóng - góc phải trên cùng trang web */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[1003] w-10 h-10 sm:w-12 sm:h-12 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Modal Content */}
      {showContent && (
        <div
          className="relative z-[1002] w-full max-w-[90vw] sm:max-w-md md:max-w-lg animate-scale-in"
          onClick={handleModalClick}
        >
          {/* ẢNH BANNER - KHUNG CỐ ĐỊNH, GIỮ TỈ LỆ */}
          <div className="relative mb-3 sm:mb-4">
            {/* Loading placeholder - responsive height */}
            {!imageLoaded && (
              <div className="w-full h-40 sm:h-52 md:h-64 bg-gradient-to-br from-red-100 to-yellow-100 flex items-center justify-center rounded-xl sm:rounded-2xl">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500 text-xs sm:text-sm">Đang tải...</span>
                </div>
              </div>
            )}
            
            {/* Banner Image - KHUNG CỐ ĐỊNH, GIỮ TỈ LỆ ẢNH */}
            <div
              className={`relative cursor-pointer group h-40 sm:h-52 md:h-64 flex items-center justify-center ${!imageLoaded ? 'hidden' : 'animate-zoom-out'}`}
              onClick={handleBannerClick}
            >
              <img
                src={bannerImage}
                alt="Lì xì"
                className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-xl transition-all duration-500 ease-out group-hover:scale-[1.1] group-hover:shadow-2xl group-hover:brightness-105"
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/default-lixi-banner.png";
                  setImageLoaded(true);
                }}
              />
            </div>
          </div>

          {/* NÚT NHẬN LÌ XÌ - chỉ hiển thị khi có redirectUrl */}
          {showCtaButton && (
            <div className="flex justify-center">
              <button
                onClick={handleBannerClick}
                className="flex-1 max-w-[160px] sm:max-w-[180px] md:max-w-[200px] py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
              >
                {resolvedCtaIcon || <span>🧧</span>}
                <span>{ctaText}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-scale-in {
          animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes zoomOut {
          0% { transform: scale(1.25); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        
        .animate-zoom-out {
          animation: zoomOut 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes borderRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(220, 38, 38, 0.5), 0 0 30px rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 25px rgba(220, 38, 38, 0.7), 0 0 50px rgba(251, 191, 36, 0.6); }
        }

        .animated-border-wrapper {
          background: linear-gradient(90deg, #dc2626, #fbbf24, #dc2626, #fbbf24, #dc2626);
          background-size: 300% 100%;
          animation: borderRotate 2s linear infinite, borderGlow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LuckyMoneyModal;
