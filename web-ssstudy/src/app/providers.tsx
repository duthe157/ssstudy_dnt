"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { RootProvider } from "@/contexts/RootContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "katex/dist/katex.min.css";
import "../styles/katex-custom.css";
import { setupAutoRender, ensureFractionLines } from "@/utils/mathProcessor";
import { setupUnsupportedImageHandlers } from "@/utils/imageProcessor";
// Xóa import QueryParamProvider từ nuqs
import DialogProvider from "@/contexts/DialogProvider";

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let debounceTimer: any = null;

    // Re-render on visibility change (needed for exam screens, etc.)
    const setupMathRendering = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        ensureFractionLines();
      }, 100);
    };

    // Setup handlers cho các định dạng ảnh không được hỗ trợ
    setupUnsupportedImageHandlers();

    // Initial setup
    setupMathRendering();

    // Setup mutation observer để re-render khi có thay đổi DOM
    const observer = new MutationObserver(() => {
      setupMathRendering();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
    });

    const onVisibility = () => setupMathRendering();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <Provider store={store}>
      <RootProvider>
        <DialogProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{
              zIndex: 99999,
              width: "100%",
              maxWidth: "420px",
              padding: "16px",
            }}
          />
        </DialogProvider>
      </RootProvider>
    </Provider>
  );
}
