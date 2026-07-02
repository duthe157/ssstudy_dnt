import React from "react";
import { CDN_LINK } from "@/utils/constants";

interface AvatarProps {
  src?: string | null;
  fullname?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showEditIcon?: boolean;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  fullname,
  size = "md",
  className = "",
  showEditIcon = false,
  onClick
}) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base"
  };

  const getInitials = () => {
    if (!fullname) return "A";
    const nameArr = fullname.trim().split(" ");
    if (nameArr.length === 1) {
      return nameArr[0].charAt(0).toUpperCase();
    }
    return (nameArr[0].charAt(0) + nameArr[nameArr.length - 1].charAt(0)).toUpperCase();
  };

  const avatarSrc = src ? (src.startsWith('http') ? src : `${CDN_LINK}${src}`) : null;

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#235CD0] text-white font-semibold flex items-center justify-center">
          {getInitials()}
        </div>
      )}
      {showEditIcon && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Avatar;
