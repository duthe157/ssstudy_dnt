import katex from "katex";
import renderMathInElement from "katex/contrib/auto-render";
import React from "react";

/**
 *  Hàm xử lý math : processMathSpansToLatex
 *  Giữ nguyên display math \[...\] thay vì convert sang inline \(...\)
 */
export const processMathSpansToLatex = (content: string): string => {
  if (!content) return content;
  
  // Bước 1: Xử lý các span math-symbol của admin
  let result = content.replace(
    /<span class="math[^"]*"[^>]*data-latex="([^"]*)"[^>]*>([\s\S]*?)<\/span>|<span class="math[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (match, latexFromData, _, innerContent) => {
      let latex = (latexFromData || innerContent || "").trim();
      // Kiểm tra xem có phải display math không
      const isDisplay = /^\\{1,2}\[/.test(latex) || /\\{1,2}\]$/.test(latex);
      // Loại bỏ các dấu ngoặc mở ở đầu: \[ hoặc \\[
      latex = latex.replace(/^\\{1,2}\[|^\\{1,2}\(/, "");
      // Loại bỏ các dấu ngoặc đóng ở cuối: \] hoặc \\] (có thể có space trước)
      latex = latex.replace(/\s*\\{1,2}\]$|\s*\\{1,2}\)$/, "").trim();
      if (!latex) return match;
      // Giữ display math là \[...\], inline math là \(...\)
      return isDisplay ? `\\[${latex}\\]` : `\\(${latex}\\)`;
    },
  );

  return result;
};

/**
 *  Giải mã các HTML entities để về đúng nội dung gốc do admin lưu
 */
export const unescapeHtmlEntities = (content: string): string => {
  if (!content) return "";
  return content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
};

/**
 *  Xử lý hình ảnh base64 để hiển thị responsive giống admin
 * Hỗ trợ tất cả các định dạng: png, jpg, jpeg, gif, bmp, svg+xml, wmf
 */
const processImageContent = (content: string): string => {
  if (!content) return content;
  return content.replace(
    /<img([^>]*src="data:image\/(png|jpg|jpeg|gif|bmp|svg\+xml|wmf)[^"]*"[^>]*)>/gi,
    '<img$1 style="max-width: 100%; height: auto; display: block; margin: 10px 0;" class="img-fluid responsive-image exam-image">',
  );
};

/**
 *  Setup auto-render
 */
export const setupAutoRender = (container?: HTMLElement) => {
  const targetContainer = container || document.body;
  if (targetContainer) {
    try {
      renderMathInElement(targetContainer, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
        throwOnError: false,
        strict: false,
        ignoredTags: [
          "script",
          "noscript",
          "style",
          "textarea",
          "pre",
          "code",
          "option",
        ],
        ignoredClasses: ["no-math", "skip-math"],
      });
    } catch (error) {
      console.warn("LaTeX rendering error:", error);
    }
  }
};

/**
 *  Hook để xử lý math : 3 bước
 */
export const useAdminMathHTML = (rawHtml: string): string => {
  if (!rawHtml) return "";

  // Bước 0: Unescape các HTML entities giống admin
  const unescaped = unescapeHtmlEntities(rawHtml);

  // Bước 1: Chuyển <span class="math"> thành \(...\) giống admin
  const toLatex = processMathSpansToLatex(unescaped);

  // Debug: log nếu có display math để kiểm tra pipeline
  if (process.env.NODE_ENV === "development" && toLatex.includes("\\[")) {
    console.log("[mathProcessor] after processMathSpansToLatex:", toLatex);
  }

  // Bước 2: Giữ nguyên display math \[...\] và inline math \(...\)
  // Không convert display math sang inline để đảm bảo block math hiển thị đúng

  // Bước 3: Xử lý ảnh base64 để responsive giống admin
  const withImages = processImageContent(toLatex);

  // Bước 4: Pre-render KaTeX ngay lập tức để tránh flickering khi re-render
  return renderMathInHTMLString(withImages);
};

/**
 * Preprocess LaTeX string to handle Vietnamese characters and common admin typos
 */
const preprocessLatex = (latex: string): string => {
  if (!latex) return "";

  let p = latex;

  // 0. Unwrap \text{} blocks chứa ký tự toán học Unicode
  //    Ví dụ: \text{∞} -> ∞, \text{∈} -> ∈
  //    Để symbolMap bên dưới convert đúng thành \infty, \in, v.v.
  const mathUnicodePattern =
    /\\text\{([∈∉⊂⊃⊆⊇∩∪∀∃±÷×≤≥≠∞≈≡π→←↔⇒⇔αβγδεθλμσωΔΩ]+)\}/g;
  p = p.replace(mathUnicodePattern, "$1");

  // 1. Chuyển các ký tự toán học Unicode phổ biến sang lệnh LaTeX
  const symbolMap: Record<string, string> = {
    "∈": "\\in",
    "∉": "\\notin",
    "⊂": "\\subset",
    "⊃": "\\supset",
    "⊆": "\\subseteq",
    "⊇": "\\supseteq",
    "∩": "\\cap",
    "∪": "\\cup",
    "∀": "\\forall",
    "∃": "\\exists",
    "±": "\\pm",
    "÷": "\\div",
    "×": "\\times",
    "≤": "\\le",
    "≥": "\\ge",
    "≠": "\\ne",
    "∞": "\\infty",
    "≈": "\\approx",
    "≡": "\\equiv",
    π: "\\pi",
    α: "\\alpha",
    β: "\\beta",
    γ: "\\gamma",
    δ: "\\delta",
    ε: "\\epsilon",
    θ: "\\theta",
    λ: "\\lambda",
    μ: "\\mu",
    σ: "\\sigma",
    ω: "\\omega",
    Δ: "\\Delta",
    Ω: "\\Omega",
    "→": "\\rightarrow",
    "←": "\\leftarrow",
    "↔": "\\leftrightarrow",
    "⇒": "\\Rightarrow",
    "⇔": "\\Leftrightarrow",
  };

  Object.entries(symbolMap).forEach(([symbol, command]) => {
    p = p.split(symbol).join(command + " ");
  });

  // 2. Sửa lỗi admin: \mathbb{\in Z} hoặc \mathbb{ \in Z} -> \in \mathbb{Z}
  p = p.replace(/\\mathbb\{\s*\\in\s*([A-Z])\}/g, "\\in \\mathbb{$1}");

  // Sửa lỗi \mathbb{ Z} -> \mathbb{Z}
  p = p.replace(/\\mathbb\{\s+([A-Z])\}/g, "\\mathbb{$1}");

  // 2b. Fix \left[ \begin{matrix}...\end{matrix} \right.\ dạng hệ điều kiện
  // \\ \\ (double line break) -> \\ (single line break)
  p = p.replace(/\\\\\s*\\\\/g, "\\\\");
  // Trailing \. hoặc \\ ở cuối \end{...} bị thừa
  p = p.replace(/(\\end\{[^}]+\}\s*\\right[.\|]?)\s*\\+\s*$/g, "$1");

  // 3. Xử lý tiếng Việt: Bọc các cụm ký tự non-ASCII trong \text{}
  // Tiếng Việt trong math mode sẽ gây lỗi KaTeX nếu không nằm trong \text{}
  p = p.replace(/([^\x00-\x7F]+)/g, "\\text{$1}");

  return p.trim();
};

/**
 *  Pre-render KaTeX trong chuỗi HTML bằng katex.renderToString
 *  Thay vì dùng setupAutoRender (post-render trên DOM), hàm này biên dịch
 *  trực tiếp các delimiter toán học thành HTML KaTeX trong string.
 *  → dangerouslySetInnerHTML luôn chứa công thức đã render hoàn chỉnh
 *  → Không bị mất khi React re-render (chuyển tab, v.v.)
 */
export const renderMathInHTMLString = (html: string): string => {
  if (!html) return "";

  let result = html;

  // 0. Fallback: xử lý các span math-symbol còn sót lại chưa được processMathSpansToLatex xử lý
  result = result.replace(
    /<span class="math[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (match, innerContent) => {
      let latex = innerContent.trim();
      if (!latex) return match;
      // Detect display math (1 or 2 backslashes before bracket)
      const isDisplay = /^\\{1,2}\[/.test(latex) || /\\{1,2}\]$/.test(latex);
      // Strip delimiters (1 or 2 backslashes)
      latex = latex.replace(/^\\{1,2}\[|^\\{1,2}\(/, "");
      latex = latex.replace(/\s*\\{1,2}\]$|\s*\\{1,2}\)$/, "").trim();

      // Fix trailing \ if present (common in some admin exports like \[ content \\])
      // Chỉ strip \ lẻ ở cuối, không strip \\ (line break trong matrix/cases)
      latex = latex.replace(/(?<!\\)\\$/, "").trim();

      if (!latex) return match;
      try {
        return katex.renderToString(preprocessLatex(latex), {
          throwOnError: false,
          displayMode: isDisplay,
          strict: false,
        });
      } catch {
        return match;
      }
    },
  );

  // 1. Render display math $$...$$ trước
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
    try {
      const cleanLatex = latex.trim().replace(/\\$/, "").trim();
      if (!cleanLatex) return match;
      return katex.renderToString(preprocessLatex(cleanLatex), {
        throwOnError: false,
        displayMode: true,
        strict: false,
      });
    } catch {
      return match;
    }
  });

  // 2. Render inline math \(...\)
  result = result.replace(/\\\(([\s\S]+?)\\\)/g, (match, latex) => {
    try {
      let cleanLatex = latex.replace(/<[^>]*>/g, "").trim();
      if (!cleanLatex) return match;

      const processed = preprocessLatex(cleanLatex);

      // Debug log
      if (
        process.env.NODE_ENV === "development" &&
        (cleanLatex.includes("mathbb") || /[^\x00-\x7F]/.test(cleanLatex))
      ) {
        console.log("[mathProcessor] \\(...\\) processed:", processed);
      }

      return katex.renderToString(processed, {
        throwOnError: false,
        displayMode: false,
        strict: false,
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[mathProcessor] KaTeX error in \\(...\\):",
          err,
          "LaTeX:",
          latex.substring(0, 100),
        );
      }
      return match;
    }
  });

  // 3. Render display math \[...\]
  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (match, latex) => {
    try {
      // Remove trailing \ if it's there (prevents \[ content \\] issue)
      // Chỉ strip \ lẻ ở cuối, không strip \\ (line break trong matrix/cases)
      const cleanLatex = latex
        .trim()
        .replace(/(?<!\\)\\$/, "")
        .trim();
      if (!cleanLatex) return match;

      const processed = preprocessLatex(cleanLatex);

      // Debug log
      if (
        process.env.NODE_ENV === "development" &&
        (cleanLatex.includes("matrix") || /[^\x00-\x7F]/.test(cleanLatex))
      ) {
        console.log("[mathProcessor] \\[...\\] processed:", processed);
      }

      return katex.renderToString(processed, {
        throwOnError: false,
        displayMode: true,
        strict: false,
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[mathProcessor] KaTeX error in \\[...\\]:",
          err,
          "LaTeX:",
          latex.substring(0, 100),
        );
      }
      return match;
    }
  });

  // 4. Render inline math $...$ - chỉ match ASCII để an toàn, nhưng xử lý preprocess nếu có thể
  result = result.replace(
    /(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/g,
    (match, latex) => {
      try {
        const cleanLatex = latex.trim().replace(/\\$/, "").trim();
        if (!cleanLatex) return match;
        return katex.renderToString(preprocessLatex(cleanLatex), {
          throwOnError: false,
          displayMode: false,
          strict: false,
        });
      } catch {
        return match;
      }
    },
  );

  return result;
};

/**
 *  Hàm để đảm bảo dấu gạch ngang phân số hiển thị sau khi render
 */
export const ensureFractionLines = () => {
  if (typeof window === "undefined") return;

  // Tìm tất cả các phân số KaTeX
  const fractions = document.querySelectorAll(".katex .mfrac");

  fractions.forEach((fraction) => {
    const line = fraction.querySelector(".mfrac-line") as HTMLElement;

    // Chỉ đảm bảo dấu gạch ngang hiển thị nếu không có
    if (!line) {
      const newLine = document.createElement("div");
      newLine.className = "mfrac-line";
      newLine.style.cssText = `
        border-bottom: 0.1em solid currentColor !important;
        display: block !important;
        margin: 0.2em 0 !important;
        width: 100% !important;
        height: 0 !important;
        background: none !important;
        box-shadow: none !important;
        opacity: 1 !important;
        visibility: visible !important;
      `;

      // Chèn vào giữa tử số và mẫu số
      const num = fraction.querySelector(".mfrac-num");
      const den = fraction.querySelector(".mfrac-den");

      if (num && den) {
        num.parentNode?.insertBefore(newLine, den);
      }
    }
  });
};

/**
 *  Xử lý choices để decode HTML entities trong LaTeX
 */
export const processChoicesForMath = (choices: any[]): any[] => {
  if (!Array.isArray(choices)) return choices;

  return choices.map((choice) => ({
    ...choice,
    text: choice.text ? unescapeHtmlEntities(choice.text) : choice.text,
  }));
};
