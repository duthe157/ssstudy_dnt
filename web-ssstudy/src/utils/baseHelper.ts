// Base helper functions for exam components

/**
 * Strip outer <li> tags from HTML content
 * @param html - HTML string to process
 * @returns HTML string with outer <li> tags removed
 */
export const stripOuterLi = (html: string): string => {
  if (!html || typeof html !== "string") return html;

  // Remove outer <li> tags if they exist
  let result = html.trim();

  // Check if content is wrapped in <li> tags
  if (result.startsWith("<li>") && result.endsWith("</li>")) {
    result = result.slice(4, -5); // Remove <li> and </li>
  }

  return result;
};

/**
 * Safely convert any value to string
 * @param value - Value to convert
 * @param fallback - Fallback value if conversion fails
 * @returns String representation of the value
 */
export const safeString = (value: any, fallback: string = ""): string => {
  if (value == null) return fallback;
  return String(value);
};

/**
 * Safely get substring of text
 * @param text - Text to substring
 * @param start - Start position
 * @param length - Length of substring
 * @returns Substring or fallback text
 */
export const safeSubstring = (
  text: any,
  start: number = 0,
  length: number = 50
): string => {
  if (text == null) return "Missing";
  const str = String(text);
  return str.length > length ? str.substring(start, length) + "..." : str;
};

/**
 * Check if text contains Vietnamese diacritics
 * @param text - Text to check
 * @returns True if text contains Vietnamese diacritics
 */
export const hasVietnameseDiacritics = (text: string): boolean => {
  if (!text || typeof text !== "string") return false;

  const vietnamesePattern =
    /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
  return vietnamesePattern.test(text);
};

/**
 * Detect if content is in Vietnamese based on language field or content analysis
 * @param question - Question object
 * @returns True if content appears to be in Vietnamese
 */
export const isVietnamese = (question: any): boolean => {
  if (!question) return false;

  // Check language field first
  if (typeof question?.language === "string") {
    const lang = String(question.language).toLowerCase();
    if (lang.includes("vi") || lang.includes("vietnam")) return true;
    if (lang.includes("en") || lang.includes("eng") || lang.includes("english"))
      return false;
  }

  // Analyze content for Vietnamese diacritics
  // Include choices text as well for true/false questions
  let choicesText = "";
  if (Array.isArray(question?.choices)) {
    choicesText = question.choices
      .map((c: any) => c?.text || c?.rawHtml || c?.label || "")
      .join(" ");
  }

  const text = `${question?.plainText || ""} ${question?.question || ""} ${
    question?.content || ""
  } ${question?.rawHtml || ""} ${choicesText}`;
  return hasVietnameseDiacritics(text);
};

/**
 * Clean HTML content by removing unnecessary tags and attributes
 * @param html - HTML string to clean
 * @returns Cleaned HTML string
 */
export const cleanHtml = (html: string): string => {
  if (!html || typeof html !== "string") return html;

  // Remove script tags and their content
  let cleaned = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // Remove style tags and their content
  cleaned = cleaned.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ""
  );

  // Remove dangerous attributes
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");

  return cleaned;
};

/**
 * Format time in HH:MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Debounce function to limit function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit function calls
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate unique ID
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export const generateId = (prefix: string = "id"): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;
  if (typeof obj === "object") {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Check if two objects are deeply equal
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if objects are deeply equal
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return obj1 === obj2;

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== "object") return obj1 === obj2;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

/**
 * Decode common HTML entities (e.g., &nbsp;, &lt;, &gt;, &amp;)
 * Works in browser; on server falls back to simple replacements
 */
export const decodeHtmlEntities = (input: any): string => {
  if (input == null) return "";
  const s = String(input);
  try {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = s;
      return textarea.value;
    }
  } catch {}
  // Fallback minimal decoding for non-DOM environments
  return s
    .replace(/&nbsp;/g, " \u00A0".slice(1))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

/**
 * Normalize decimal strings so both comma and dot are treated as decimal separators.
 * Keeps only one separator (dot) and strips spaces.
 */
export const normalizeDecimal = (input: any): string => {
  if (input == null) return "";
  let s = String(input).trim();
  if (!s) return s;
  // replace comma with dot, but avoid thousands separators by removing spaces
  s = s.replace(/\s+/g, "");
  s = s.replace(/,/g, ".");
  return s;
};

export default {
  stripOuterLi,
  safeString,
  safeSubstring,
  hasVietnameseDiacritics,
  isVietnamese,
  cleanHtml,
  formatTime,
  debounce,
  throttle,
  generateId,
  deepClone,
  deepEqual,
  normalizeDecimal,
  decodeHtmlEntities,
};
