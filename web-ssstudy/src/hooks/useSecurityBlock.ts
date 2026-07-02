import { useEffect, useRef, useState } from 'react';

interface UseSecurityBlockOptions {
  enabled?: boolean;
  silent?: boolean;
  allowKeyboardShortcuts?: boolean;
  targetSelector?: string; // CSS selector cho container chứa video
  removeIframe?: boolean;  // Tự động xóa iframe khi phát hiện
}

/**
 * Custom hook để chặn các hành vi bảo mật:
 * - Phát hiện và chặn DevTools (ngay cả khi đã mở trước đó)
 * - Chặn copy/paste/cut
 * - Chặn chuột phải
 * - Ngăn chặn selection
 */
export function useSecurityBlock(options: UseSecurityBlockOptions = {}) {
  const { 
    enabled = true, 
    silent = true, 
    allowKeyboardShortcuts = false,
    targetSelector,
    removeIframe = true,
  } = options;
  const addressBarFocusedRef = useRef(false);
  const devToolsCheckIntervalRef = useRef<number | null>(null);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const hasBlocked = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    //  PHÁT HIỆN DEVTOOLS (nhiều phương pháp)
    const detectDevTools = () => {
      let detected = false;

      // Phát hiện iOS/Mobile
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Method 1: Window size detection (Sensitive threshold)
      const threshold = (isIOS || isMobile) ? 300 : 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        detected = true;
      }

      // Method 2: Timing detection (debugger)
      if (!isIOS && !isMobile) {
        const start = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const end = performance.now();
        if (end - start > 100) {
          detected = true;
        }
      }

      // Method 3: RegExp toString trick (Rất nhạy với Console)
      const r = /./;
      (r as any).toString = () => {
        detected = true;
        return 'devtools-detect';
      };
      
      // Method 4: Element property detection (dir trick)
      if (!isIOS && !isMobile && !detected) {
        const element = document.createElement('div');
        Object.defineProperty(element, 'id', {
          get: function () {
            detected = true;
            return 'devtools-detect';
          }
        });
        console.dir(element);
      }

      if (detected) {
        setIsDevToolsOpen(true);
        if (!silent) {
          console.warn('🚨 DevTools detected! Please close DevTools to continue.');
        }

        // CHẶN TOÀN BỘ TRANG/CONTAINER
        blockPage();
      } else {
        setIsDevToolsOpen(false);
        unblockPage();
      }
    };

    //  CHẶN TRANG/CONTAINER KHI DEVTOOLS MỞ
    const blockPage = () => {
      if (hasBlocked.current) return;
      
      // Xóa iframe bài học nếu được yêu cầu
      if (removeIframe) {
        const container = targetSelector ? document.querySelector(targetSelector) : document;
        if (container) {
          const iframes = Array.from(container.querySelectorAll("iframe"));
          iframes.forEach(iframe => iframe.remove());
          
          const videos = Array.from(container.querySelectorAll("video"));
          videos.forEach(video => video.remove());
        }
      }

      let blocker = document.getElementById('devtools-blocker');
      if (!blocker) {
        blocker = document.createElement('div');
        blocker.id = 'devtools-blocker';
        
        const isTargeted = !!targetSelector && !!document.querySelector(targetSelector);

        if (isTargeted) {
          const target = document.querySelector(targetSelector) as HTMLElement;
          target.style.position = "relative";
          blocker.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            flex-direction: column;
            gap: 20px;
            text-align: center;
            padding: 20px;
            border-radius: inherit;
          `;
        } else {
          blocker.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #000;
            z-index: 999999999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            flex-direction: column;
            gap: 20px;
          `;
        }

        blocker.innerHTML = `
          <div style="font-size: ${isTargeted ? '40px' : '64px'};">🔒</div>
          <h1 style="font-size: ${isTargeted ? '20px' : '32px'}; margin: 0;">DevTools Detected</h1>
          <p style="font-size: ${isTargeted ? '14px' : '16px'}; color: #ccc; margin: 0;">Vui lòng đóng Developer Tools để tiếp tục</p>
        `;
        
        if (isTargeted) {
          document.querySelector(targetSelector)?.appendChild(blocker);
        } else {
          document.body.appendChild(blocker);
        }
        
        hasBlocked.current = true;
      }
    };

    //  MỞ KHÓA TRANG KHI DEVTOOLS ĐÓNG
    const unblockPage = () => {
      const blocker = document.getElementById('devtools-blocker');
      if (blocker) {
        blocker.remove();
        document.body.style.overflow = "";
      }
      hasBlocked.current = false;
    };

    //  CHẶN PHÍM TẮT
    const onKeyDown = (e: KeyboardEvent) => {
      const key = (e.key || '').toLowerCase();
      const code = (e.code || '').toLowerCase();

      //  LUÔN CHẶN DEVTOOLS VÀ CÁC PHÍM CHỨC NĂNG (F1-F12)
      const isFunctionKey = /^f\d{1,2}$/i.test(e.key || '');
      const isDevToolsShortcut =
        key === 'f12' ||
        isFunctionKey || // Chặn luôn toàn bộ phím F theo yêu cầu
        (e.ctrlKey && e.shiftKey && key === 'i') ||
        (e.ctrlKey && e.shiftKey && key === 'c') ||
        (e.ctrlKey && e.shiftKey && key === 'j') ||
        (e.ctrlKey && e.shiftKey && key === 'k') ||
        (e.metaKey && e.altKey && key === 'i') ||
        (e.metaKey && e.altKey && key === 'c') ||
        (e.metaKey && e.altKey && key === 'j') ||
        (e.ctrlKey && key === 'u');

      if (isDevToolsShortcut) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      //  LUÔN CHẶN COPY/PASTE/CUT
      const isCopyPasteShortcut =
        (e.ctrlKey && key === 'c') ||
        (e.ctrlKey && key === 'v') ||
        (e.ctrlKey && key === 'x') ||
        (e.metaKey && key === 'c') ||
        (e.metaKey && key === 'v') ||
        (e.metaKey && key === 'x');

      if (isCopyPasteShortcut) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      if (allowKeyboardShortcuts) {
        return;
      }

      // Mode chặn đầy đủ
      const isWindowsKey =
        key === 'meta' ||
        key === 'os' ||
        key === 'win' ||
        key === 'windows' ||
        code === 'metaleft' ||
        code === 'metaright' ||
        code === 'osleft' ||
        code === 'osright' ||
        e.keyCode === 91 ||
        e.keyCode === 92 ||
        e.keyCode === 93;

      if (isWindowsKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }

      const isBlockedCombo =
        e.ctrlKey ||
        e.metaKey ||
        key === 'control' ||
        key === 'ctrl' ||
        key === 'cmd' ||
        (e.altKey && key === 'tab') ||
        isFunctionKey ||
        key === 'f5' ||
        key === 'printscreen' ||
        key === 'print' ||
        e.keyCode === 44;

      if (isBlockedCombo) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (allowKeyboardShortcuts) return;

      const key = (e.key || '').toLowerCase();
      const code = (e.code || '').toLowerCase();

      const isBlockedKey =
        key === 'control' ||
        key === 'ctrl' ||
        key === 'meta' ||
        key === 'cmd' ||
        key === 'os' ||
        key === 'win' ||
        key === 'windows' ||
        code === 'metaleft' ||
        code === 'metaright' ||
        code === 'osleft' ||
        code === 'osright' ||
        key === 'printscreen' ||
        key === 'print' ||
        e.keyCode === 91 ||
        e.keyCode === 92 ||
        e.keyCode === 93 ||
        e.keyCode === 44;

      if (isBlockedKey) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !target.isContentEditable
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 📱 THÊM EVENT LISTENERS
    const options: AddEventListenerOptions = { capture: true, passive: false };

    window.addEventListener('keydown', onKeyDown, options);
    window.addEventListener('keyup', onKeyUp, options);
    window.addEventListener('resize', detectDevTools, options);
    window.addEventListener('blur', detectDevTools, options);
    window.addEventListener('focus', detectDevTools, options);

    document.addEventListener('contextmenu', onContextMenu, options);
    document.addEventListener('copy', onCopy, options);
    document.addEventListener('cut', onCut, options);
    document.addEventListener('paste', onPaste, options);
    document.addEventListener('selectstart', onSelectStart, options);

    // CSS để ngăn chặn selection
    const style = document.createElement('style');
    style.id = 'security-block-styles';
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    //  KIỂM TRA DEVTOOLS NGAY LẬP TỨC
    detectDevTools();

    //  KIỂM TRA LIÊN TỤC (Tăng tần suất lên 200ms để nhạy hơn)
    devToolsCheckIntervalRef.current = window.setInterval(detectDevTools, 200);

    // CLEANUP
    return () => {
      window.removeEventListener('keydown', onKeyDown, options as any);
      window.removeEventListener('keyup', onKeyUp, options as any);
      document.removeEventListener('contextmenu', onContextMenu, options as any);
      document.removeEventListener('copy', onCopy, options as any);
      document.removeEventListener('cut', onCut, options as any);
      document.removeEventListener('paste', onPaste, options as any);
      document.removeEventListener('selectstart', onSelectStart, options as any);

      const styleElement = document.getElementById('security-block-styles');
      if (styleElement) {
        styleElement.remove();
      }

      if (devToolsCheckIntervalRef.current) {
        clearInterval(devToolsCheckIntervalRef.current);
      }

      window.removeEventListener('resize', detectDevTools, options as any);
      window.removeEventListener('blur', detectDevTools, options as any);
      window.removeEventListener('focus', detectDevTools, options as any);

      unblockPage();
    };
  }, [enabled, silent, allowKeyboardShortcuts]);

  return isDevToolsOpen;
}
