"use client";

import React, { useMemo } from "react";

type Props = {
  onFullScreen?: () => void;
  src: string;
  onError?: () => void;
};

/**
 * Convert MediaDelivery wrapper URL to direct embed URL
 * Example:
 * - Input:  https://iframe.mediadelivery.net/play/175696/81366727-4f29-4723-9263-fc1372afc556
 * - Output: https://iframe.mediadelivery.net/embed/175696/81366727-4f29-4723-9263-fc1372afc556?autoplay=true
 */
function convertToDirectEmbedUrl(url: string): string {
  try {
    // Check if it's a mediadelivery.net URL with /play/ path
    if (url.includes("iframe.mediadelivery.net/play/")) {
      // Extract the library ID and video ID from /play/ URL
      const playMatch = url.match(/\/play\/(\d+)\/([\w-]+)/);

      if (playMatch) {
        const [, libraryId, videoId] = playMatch;
        // Convert to /embed/ URL with autoplay and postMessage enabled
        const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&enable_post_message=true`;
        return embedUrl;
      }
    }

    // If already an embed URL, ensure postMessage is enabled
    if (url.includes("iframe.mediadelivery.net/embed/")) {
      const separator = url.includes("?") ? "&" : "?";
      if (!url.includes("enable_post_message=")) {
        return `${url}${separator}enable_post_message=true`;
      }
    }

    return url;
  } catch (error) {
    console.error(" [VideoPlayer] Error converting URL:", error);
    return url;
  }
}

export const VideoPlayer = ({ src, onError }: Props) => {
  // Convert URL to direct embed if needed
  const videoSrc = useMemo(() => convertToDirectEmbedUrl(src), [src]);

  // Iframe không hỗ trợ onError, dùng onLoad để check
  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const iframe = e.currentTarget;
      // Check nếu iframe load nhưng không có nội dung hoặc bị block
      if (!iframe.contentWindow) {
        console.error(" [VideoPlayer] Iframe has no contentWindow");
        onError?.();
      }
    } catch (error) {
      // Cross-origin error - iframe đã load nhưng bị restrict
      // Trong trường hợp này, coi như iframe đã load OK
    }
  };

  // Chặn right-click để bảo vệ video
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div 
      className="w-full h-full relative rounded-lg overflow-hidden"
      onContextMenu={handleContextMenu}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* link is iframe - Render trực tiếp không qua MediaController */}
      <div className="w-full h-full relative">
        <iframe
          src={videoSrc}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
          onLoad={handleIframeLoad}
          title="Video player"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            minHeight: "100%",
            objectFit: "cover",
          }}
        ></iframe>
      </div>

      {/* <div className="absolute top-1/2 left-0 cursor-pointer -translate-y-1/2">
        <BackWardIcon
          className={cn(
            "w-[80px] h-[55px] lg:w-[171px] lg:h-[171px] md:w-[156px] md:h-[110px]"
          )}
        />
        <MediaSeekBackwardButton
          seekOffset={10}
          className="absolute top-0 left-0 right-0 bottom-0 opacity-0"
        />
      </div>
      <div className="absolute top-1/2 right-0 cursor-pointer -translate-y-1/2">
        <ForwardIcon
          className={cn(
            "w-[80px] h-[55px] xl:w-[171px] xl:h-[171px] md:w-[156px] md:h-[110px]"
          )}
        />
        <MediaSeekForwardButton
          seekOffset={10}
          className="absolute top-0 left-0 right-0 bottom-0 opacity-0"
        />
      </div> */}

      {/* <ReactPlayer
        slot="media"
        src={src}
        controls={false}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playing={isPlaying}
        className="w-full h-full"
        style={
          {
            width: "100%",
            height: "100%",
            "--controls": "none",
          } as React.CSSProperties
        }
      /> */}
      {/* <MediaControlBar
        className={cn(
          "bg-button/65 backdrop-blur-[4.51px] flex items-center",
          "w-full bottom-0 absolute rounded-none pl-5 pr-3",
          "lg:pl-9 lg:pr-6 mx-auto lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-[80%] lg:rounded-2xl"
        )}
      >
        {isPlaying ? (
          <CirclePause
            className="cursor-pointer size-[22px]"
            onClick={() => setIsPlaying(false)}
          />
        ) : (
          <CirclePlay
            className="size-[22px] cursor-pointer"
            onClick={() => setIsPlaying(true)}
          />
        )}

        <MediaTimeDisplay className="bg-transparent text-[10px]" />
        <MediaTimeRange className="bg-transparent" />
        <MediaDurationDisplay className="text-[10px] bg-transparent" />
        <SkipForward className="size-[14px] mx-6 cursor-pointer" />
        <div className="flex items-center group">
          <MediaMuteButton className="bg-transparent size-[14px] p-0" />
          <MediaVolumeRange className="p-0 bg-transparent w-0 opacity-0 transition-all duration-300 group-hover:w-24 group-hover:opacity-100 me-2" />
        </div>

        <div className="relative mx-6">
          <Settings
            className="size-[14px] cursor-pointer"
            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
          />
          {isSettingsMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 flex flex-col items-start">
              <MediaPlaybackRateButton />
            </div>
          )}
        </div>
        {!isMobile && onFullScreen ? (
          <Maximize
            className="size-[14px] cursor-pointer"
            onClick={onFullScreen}
          />
        ) : (
          <MediaFullscreenButton className="bg-transparent size-[14px] p-0" />
        )}
      </MediaControlBar> */}
    </div>
  );
};
