"use client";

import { useEffect } from "react";

export default function ContactMenu() {
  useEffect(() => {
    const scriptId = "omiLiveTalk";
    const styleId = "omi-hide-style";
    const offsetStyleId = "omi-mobile-offset-style";

    const hideStyle = document.getElementById(styleId);
    if (hideStyle) {
      hideStyle.remove();
    }

    // Inject CSS đẩy widget lên trên mobile/tablet để không che bottom nav
    if (!document.getElementById(offsetStyleId)) {
      const style = document.createElement("style");
      style.id = offsetStyleId;
      style.innerHTML = `
        @media (max-width: 1439px) {
          .omi-lt-nhc-vr,
          .omi-lt-vtr-vr,
          #omi_kep {
            bottom: 60px !important;
          }
        }
        body.account-menu-open .omi-lt-nhc-vr,
        body.account-menu-open [class*="omi-lt-"] {
          z-index: 39 !important;
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "text/javascript";
      script.src =
        "https://cdn.omicrm.com/script/livetalk/main.js#domain=sachtoanthaydat2510";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          [id^="omi-"], [class^="omi-"], iframe[src*="omicrm.com"] {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    };
  }, []);

  return null;
}
