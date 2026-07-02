const path = require("path");
const multer = require("multer");
const cheerio = require("cheerio");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const fs = require("fs");

const upload = multer({
  dest: path.join(__dirname, "../../temp/docx"),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});


// ========= Unicode Math Normalization =========
const UNICODE_MATH_MAP = {
  // Greek letters
  'α': 'alpha', 'β': 'beta', 'γ': 'gamma', 'δ': 'delta', 'ε': 'epsilon', 'ζ': 'zeta',
  'η': 'eta', 'θ': 'theta', 'ι': 'iota', 'κ': 'kappa', 'λ': 'lambda', 'μ': 'mu',
  'ν': 'nu', 'ξ': 'xi', 'ο': 'omicron', 'π': 'pi', 'ρ': 'rho', 'σ': 'sigma',
  'τ': 'tau', 'υ': 'upsilon', 'φ': 'phi', 'χ': 'chi', 'ψ': 'psi', 'ω': 'omega',
  'Α': 'Alpha', 'Β': 'Beta', 'Γ': 'Gamma', 'Δ': 'Delta', 'Ε': 'Epsilon', 'Ζ': 'Zeta',
  'Η': 'Eta', 'Θ': 'Theta', 'Ι': 'Iota', 'Κ': 'Kappa', 'Λ': 'Lambda', 'Μ': 'Mu',
  'Ν': 'Nu', 'Ξ': 'Xi', 'Ο': 'Omicron', 'Π': 'Pi', 'Ρ': 'Rho', 'Σ': 'Sigma',
  'Τ': 'Tau', 'Υ': 'Upsilon', 'Φ': 'Phi', 'Χ': 'Chi', 'Ψ': 'Psi', 'Ω': 'Omega',
  
  // Mathematical symbols
  '∞': 'infinity', '∑': 'sum', '∏': 'product', '∫': 'integral', '∂': 'partial',
  '∆': 'delta', '∇': 'nabla', '√': 'sqrt', '∛': 'cbrt', '∜': 'fourthrt',
  '±': '±', '∓': '∓', '×': '×', '÷': '÷', '∙': '·', '∘': '°',
  '≤': '≤', '≥': '≥', '≠': '≠', '≈': '≈', '≡': '≡', '∝': '∝',
  '∈': '∈', '∉': '∉', '⊂': '⊂', '⊃': '⊃', '⊆': '⊆', '⊇': '⊇',
  '∪': '∪', '∩': '∩', '∅': '∅', 'ℝ': 'R', 'ℕ': 'N', 'ℤ': 'Z', 'ℚ': 'Q',
  
  // Superscripts and subscripts
  '¹': '^1', '²': '^2', '³': '^3', '⁴': '^4', '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9', '⁰': '^0',
  '₁': '_1', '₂': '_2', '₃': '_3', '₄': '_4', '₅': '_5', '₆': '_6', '₇': '_7', '₈': '_8', '₉': '_9', '₀': '_0',
  
  // Fractions
  '½': '1/2', '⅓': '1/3', '¼': '1/4', '¾': '3/4', '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5',
  '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8',
  
  // Korean mathematical variables (Hangul) - Complete alphabet
  '푎': 'a', '푏': 'b', '푐': 'c', '푑': 'd', '푒': 'e', '푓': 'f',
  '푔': 'g', '푕': 'h', '푖': 'i', '푗': 'j', '푘': 'k', '푙': 'l', '푚': 'm',
  '푛': 'n', '표': 'o', '푝': 'p', '푞': 'q', '푟': 'r', '푠': 's', '푡': 't',
  '푢': 'u', '푣': 'v', '푤': 'w', '푥': 'x', '푦': 'y', '푧': 'z',
  
  // Korean mathematical italic capitals (Hangul) - Complete alphabet
  '퐴': 'A', '퐵': 'B', '퐶': 'C', '퐷': 'D', '퐸': 'E', '퐹': 'F', '퐺': 'G',
  '퐻': 'H', '퐼': 'I', '퐽': 'J', '퐾': 'K', '퐿': 'L', '푀': 'M', '푁': 'N',
  '푂': 'O', '푃': 'P', '푄': 'Q', '푅': 'R', '푆': 'S', '푇': 'T', '푈': 'U',
  '푉': 'V', '푊': 'W', '푋': 'X', '푌': 'Y', '푍': 'Z',
  
  // Korean mathematical bold variables (Hangul)
  '𝐚': 'a', '𝐛': 'b', '𝐜': 'c', '𝐝': 'd', '𝐞': 'e', '𝐟': 'f', '𝐠': 'g', '𝐡': 'h',
  '𝐢': 'i', '𝐣': 'j', '𝐤': 'k', '𝐥': 'l', '𝐦': 'm', '𝐧': 'n', '𝐨': 'o', '𝐩': 'p',
  '𝐪': 'q', '𝐫': 'r', '𝐬': 's', '𝐭': 't', '𝐮': 'u', '𝐯': 'v', '𝐰': 'w', '𝐱': 'x',
  '𝐲': 'y', '𝐳': 'z',
  
  // Korean mathematical bold capitals (Hangul)
  '𝐀': 'A', '𝐁': 'B', '𝐂': 'C', '𝐃': 'D', '𝐄': 'E', '𝐅': 'F', '𝐆': 'G', '𝐇': 'H',
  '𝐈': 'I', '𝐉': 'J', '𝐊': 'K', '𝐋': 'L', '𝐌': 'M', '𝐍': 'N', '𝐎': 'O', '𝐏': 'P',
  '𝐐': 'Q', '𝐑': 'R', '𝐒': 'S', '𝐓': 'T', '𝐔': 'U', '𝐕': 'V', '𝐖': 'W', '𝐗': 'X',
  '𝐘': 'Y', '𝐙': 'Z',
  
  // Mathematical script/calligraphy (often used in Korean texts)
  '𝒶': 'a', '𝒷': 'b', '𝒸': 'c', '𝒹': 'd', '𝑒': 'e', '𝒻': 'f', '𝑔': 'g', '𝒽': 'h',
  '𝒾': 'i', '𝒿': 'j', '𝓀': 'k', '𝓁': 'l', '𝓂': 'm', '𝓃': 'n', '𝑜': 'o', '𝓅': 'p',
  '𝓆': 'q', '𝓇': 'r', '𝓈': 's', '𝓉': 't', '𝓊': 'u', '𝓋': 'v', '𝓌': 'w', '𝓍': 'x',
  '𝓎': 'y', '𝓏': 'z',
  
  '𝒜': 'A', '𝐵': 'B', '𝒞': 'C', '𝒟': 'D', '𝐸': 'E', '𝐹': 'F', '𝒢': 'G', '𝐻': 'H',
  '𝐼': 'I', '𝒥': 'J', '𝒦': 'K', '𝐿': 'L', '𝑀': 'M', '𝒩': 'N', '𝒪': 'O', '𝒫': 'P',
  '𝒬': 'Q', '𝑅': 'R', '𝒮': 'S', '𝒯': 'T', '𝒰': 'U', '𝒱': 'V', '𝒲': 'W', '𝒳': 'X',
  '𝒴': 'Y', '𝒵': 'Z',
  
  // Korean mathematical constants and special symbols
  '휋': 'pi', '휆': 'lambda', '휇': 'mu', '휈': 'nu', '휌': 'rho', '휎': 'sigma', '휏': 'tau',
  '휙': 'phi', '휒': 'chi', '휓': 'psi', '휔': 'omega',
  '훥′': "𝛥′", '훥': "𝛥", '훺': "𝛺",
  
  // Korean mathematical numbers
  '𝟎': '0', '𝟏': '1', '𝟐': '2', '𝟑': '3', '𝟒': '4', '𝟓': '5', '𝟔': '6', '𝟕': '7', '𝟖': '8', '𝟗': '9',
  '𝟘': '0', '𝟙': '1', '𝟚': '2', '𝟛': '3', '𝟜': '4', '𝟝': '5', '𝟞': '6', '𝟟': '7', '𝟠': '8', '𝟡': '9'
};

// ========= Math Formula Patterns =========
const MATH_PATTERNS = {
  // Phương trình và biểu thức
  equation: /([a-zA-Z₀-₉⁰-⁹]+\s*[=≠≈≡]\s*[^\s]+)|([^\s]+\s*[=≠≈≡]\s*[a-zA-Z₀-₉⁰-⁹]+)/g,
  formula: /(\w+\s*\([^)]+\))|([a-zA-Z]+[₀-₉⁰-⁹]*\s*[+\-×÷∙]\s*[a-zA-Z₀-₉⁰-⁹]+)/g,
  fraction: /(\d+\/\d+)|(\w+\/\w+)/g,
  power: /([a-zA-Z]+[₀-₉⁰-⁹]*\^[₀-₉⁰-⁹]+)|([a-zA-Z]+[⁰-⁹]+)/g,
  sqrt: /(√\s*\w+)|(√\s*\([^)]+\))/g,
  integral: /(∫[^\s]*)|([∫∑∏]\s*[^\s]+)/g,
  vector: /([a-zA-Z]+\s*→)|([a-zA-Z]+\s*⃗)/g,
  matrix: /(\[\s*[^\]]+\s*\])|(\|\s*[^\|]+\s*\|)/g,
  trigFunc: /(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan)\s*\(?[^\)]*\)?/gi,
  logFunc: /(log|ln|lg)\s*\(?[^\)]*\)?/gi,
  mathSymbols: /[α-ωΑ-Ω∞∑∏∫∂∆∇√∛∜±∓×÷∙∘≤≥≠≈≡∝∈∉⊂⊃⊆⊇∪∩∅ℝℕℤℚ¹²³⁴⁵⁶⁷⁸⁹⁰₁₂₃₄₅₆₇₈₉₀½⅓¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g
};

// ========= Regex (copy từ DocxPandocController) =========
const REGEX = {
  part: /^(PHẦN)/,
  question:
    /^(?!câu\s*\d+\s*[-–—]\s*\d+\s*[:.]?)(Câu|Question)\s*(\d+)[\.:.]?\s*/im,
  cluster:
    /(?:(?:questions?|q\.?)\s*(\d+)\s*(?:[-–—]|đến)\s*(\d+)|[Cc]âu\s*(\d+)\s*[-–—]\s*(\d+))/iu,
  drag: /^các lựa chọn kéo[:]?/i,
  choice: /^([A-Da-d])[.)]\s*/i,
  explanation: /^giải thích[:]?/i,
  video: /^video[:]?/i,
  explainSection: /^lời giải[:]?/i,
  correct: /^Đáp án[:]?/i,
  subpartTitle: /^(\d+\.\d+)\s+.+$/u,
  groupTitle: /^\[\p{L}(?:[\p{L}\s]*\p{L})?\]$/u,
  subjectTitle: /^##\s*\p{L}(?:[\p{L}\s]*\p{L})?$/u,
  mathLine: /^\s*[α-ωΑ-Ω∞∑∏∫∂∆∇√∛∜±∓×÷∙∘≤≥≠≈≡∝∈∉⊂⊃⊆⊇∪∩∅ℝℕℤℚ¹²³⁴⁵⁶⁷⁸⁹⁰₁₂₃₄₅₆₇₈₉₀½⅓¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞=+\-*/()\[\]{}.,\d\s]+$/,
};

// ========= Math Processing Functions ==========
function normalizeUnicodeMath(text) {
  if (!text) return text;
  
  let normalized = text;
  
  // Normalize Unicode math symbols
  Object.entries(UNICODE_MATH_MAP).forEach(([unicode, replacement]) => {
    const regex = new RegExp(unicode, 'g');
    normalized = normalized.replace(regex, replacement);
  });
  
  // Remove unwanted math symbols and diacritics
  normalized = normalized
    .replace(/′/g, '')          // Remove prime symbol
    .replace(/⃗/g, '')          // Remove vector arrow
    .replace(/⃑/g, '')          // Remove vector arrow (variant)
    .replace(/⃖/g, '')          // Remove leftwards arrow
    .replace(/⃘/g, '')          // Remove ring overlay
    .replace(/⃛/g, '')          // Remove triple dot above
    .replace(/⃜/g, '')          // Remove four dots above
    .replace(/⃝/g, '')          // Remove enclosing circle
    .replace(/⃞/g, '')          // Remove enclosing square
    .replace(/⃟/g, '')          // Remove enclosing diamond
    .replace(/⃠/g, '')          // Remove enclosing circle backslash
    .replace(/⃡/g, '')          // Remove leftwards two-headed arrow
    .replace(/⃢/g, '')          // Remove leftwards arrow from bar
    .replace(/⃣/g, '')          // Remove enclosing keycap
    .replace(/⃤/g, '')          // Remove enclosing upward pointing triangle
    .replace(/⃥/g, '')          // Remove reverse solidus
    .replace(/⃦/g, '')          // Remove double vertical stroke
    .replace(/⃧/g, '')          // Remove three dots above
    .replace(/⃨/g, '')          // Remove quadruple dot above
    .replace(/⃩/g, '')          // Remove wide bridge above
    .replace(/⃪/g, '')          // Remove leftwards arrow above
    .replace(/⃫/g, '')          // Remove long double solidus overlay
    .replace(/⃬/g, '')          // Remove rightwards arrow below
    .replace(/⃭/g, '')          // Remove leftwards arrow below
    .replace(/⃮/g, '')          // Remove left right arrow below
    .replace(/⃯/g, '')          // Remove upwards arrow below
    .replace(/⃰/g, '')          // Remove asterisk below
    .replace(/□/g, '')          // Remove white square
    .replace(/■/g, '')          // Remove black square
    .replace(/▢/g, '')          // Remove white square with rounded corners
    .replace(/▣/g, '')          // Remove white square containing black small square
    .replace(/▤/g, '')          // Remove square with horizontal fill
    .replace(/▥/g, '')          // Remove square with vertical fill
    .replace(/▦/g, '')          // Remove square with orthogonal crosshatch fill
    .replace(/▧/g, '')          // Remove square with upper left to lower right fill
    .replace(/▨/g, '')          // Remove square with upper right to lower left fill
    .replace(/▩/g, '')          // Remove square with diagonal crosshatch fill
    .replace(/◼/g, '')          // Remove black medium square
    .replace(/◽/g, '')          // Remove white medium small square
    .replace(/◾/g, '')          // Remove black medium small square
    .replace(/⬜/g, '')          // Remove white large square
    .replace(/⬛/g, '')          // Remove black large square
    .replace(/◻/g, '')          // Remove white medium square
    .replace(/▪/g, '')          // Remove black small square
    .replace(/▫/g, '')          // Remove white small square
    .replace(/▭/g, '')          // Remove white rectangle
    .replace(/▬/g, '')          // Remove black rectangle
    .replace(/▮/g, '')          // Remove black vertical rectangle
    .replace(/▯/g, '')          // Remove white vertical rectangle
    .replace(/⬆/g, '')          // Remove upward arrow
    .replace(/⬇/g, '')          // Remove downward arrow
    .replace(/⬅/g, '')          // Remove leftward arrow  
    .replace(/➡/g, '')          // Remove rightward arrow
    .replace(/◆/g, '')          // Remove black diamond
    .replace(/◇/g, '');         // Remove white diamond
  
  // Fix common spacing issues in math
  normalized = normalized
    .replace(/([a-zA-Z])\s*\^\s*([0-9])/g, '$1^$2')  // x ^ 2 → x^2
    .replace(/([a-zA-Z])\s*_\s*([0-9])/g, '$1_$2')  // x _ 1 → x_1
    .replace(/\s*([+\-×÷])\s*/g, ' $1 ')              // Spacing around operators
    .replace(/\s*([=≠≈≡])\s*/g, ' $1 ')              // Spacing around equals
    .replace(/\s+/g, ' ')                            // Multiple spaces → single space
    .trim();
  
  return normalized;
}

function mergeMathLines(lines) {
  if (!Array.isArray(lines)) return lines;
  
  const merged = [];
  let mathBuffer = [];
  let inMathBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line contains math
    const hasMath = MATH_PATTERNS.mathSymbols.test(line) || 
                   MATH_PATTERNS.equation.test(line) ||
                   MATH_PATTERNS.formula.test(line) ||
                   REGEX.mathLine.test(line);
    
    // Check if line is incomplete math (ends with operator or open bracket)
    const isIncomplete = /[+\-×÷=≠≈≡∫∑∏√∂∇\(\[{,]\s*$/.test(line);
    
    // Check if line continues math (starts with operator or close bracket)
    const continuesMath = /^\s*[+\-×÷=≠≈≡\)\]}.,]/.test(line);
    
    if (hasMath || inMathBlock) {
      mathBuffer.push(line);
      inMathBlock = isIncomplete || (inMathBlock && continuesMath);
      
      // If math block is complete, merge and add to result
      if (!inMathBlock) {
        merged.push(mathBuffer.join(' '));
        mathBuffer = [];
      }
    } else {
      // Not a math line, add directly
      if (mathBuffer.length > 0) {
        merged.push(mathBuffer.join(' '));
        mathBuffer = [];
        inMathBlock = false;
      }
      merged.push(line);
    }
  }
  
  // Handle remaining math buffer
  if (mathBuffer.length > 0) {
    merged.push(mathBuffer.join(' '));
  }
  
  return merged;
}

function detectMathFormulas(text) {
  if (!text) return { hasMath: false, formulas: [], processed: text };
  
  const formulas = [];
  let processed = text;
  
  // Extract and mark math formulas
  Object.entries(MATH_PATTERNS).forEach(([type, pattern]) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const formula = {
        type: type,
        content: match[0],
        position: match.index,
        length: match[0].length,
        latex: convertToLatex(match[0])  // Convert to LaTeX
      };
      formulas.push(formula);
    }
  });
  
  // Sort by position
  formulas.sort((a, b) => a.position - b.position);
  
  // Mark formulas in text with special tags including LaTeX
  if (formulas.length > 0) {
    let offset = 0;
    formulas.forEach((formula, index) => {
      const tag = `<math-formula type="${formula.type}" id="${index}" latex="${formula.latex}">${formula.content}</math-formula>`;
      const start = formula.position + offset;
      const end = start + formula.length;
      processed = processed.slice(0, start) + tag + processed.slice(end);
      offset += tag.length - formula.length;
    });
  }
  
  return {
    hasMath: formulas.length > 0,
    formulas: formulas,
    processed: processed
  };
}

function convertToLatex(text) {
  if (!text) return text;
  
  let latex = text;
  
  // Mathematical operators and symbols
  latex = latex
    .replace(/\bintegral\b/gi, '\\int')
    .replace(/\bsum\b/gi, '\\sum')
    .replace(/\bproduct\b/gi, '\\prod')
    .replace(/\bsqrt\b/gi, '\\sqrt')
    .replace(/\binfinity\b/gi, '\\infty')
    .replace(/\bpartial\b/gi, '\\partial')
    .replace(/\bnabla\b/gi, '\\nabla')
    .replace(/\bdelta\b/gi, '\\Delta')
    
    // Greek letters (lowercase)
    .replace(/\balpha\b/gi, '\\alpha')
    .replace(/\bbeta\b/gi, '\\beta')
    .replace(/\bgamma\b/gi, '\\gamma')
    .replace(/\bdelta\b/gi, '\\delta')
    .replace(/\bepsilon\b/gi, '\\epsilon')
    .replace(/\bzeta\b/gi, '\\zeta')
    .replace(/\beta\b/gi, '\\eta')
    .replace(/\btheta\b/gi, '\\theta')
    .replace(/\biota\b/gi, '\\iota')
    .replace(/\bkappa\b/gi, '\\kappa')
    .replace(/\blambda\b/gi, '\\lambda')
    .replace(/\bmu\b/gi, '\\mu')
    .replace(/\bnu\b/gi, '\\nu')
    .replace(/\bxi\b/gi, '\\xi')
    .replace(/\bomicron\b/gi, '\\omicron')
    .replace(/\bpi\b/gi, '\\pi')
    .replace(/\brho\b/gi, '\\rho')
    .replace(/\bsigma\b/gi, '\\sigma')
    .replace(/\btau\b/gi, '\\tau')
    .replace(/\bupsilon\b/gi, '\\upsilon')
    .replace(/\bphi\b/gi, '\\phi')
    .replace(/\bchi\b/gi, '\\chi')
    .replace(/\bpsi\b/gi, '\\psi')
    .replace(/\bomega\b/gi, '\\omega')
    
    // Greek letters (uppercase)
    .replace(/\bAlpha\b/gi, '\\Alpha')
    .replace(/\bBeta\b/gi, '\\Beta')
    .replace(/\bGamma\b/gi, '\\Gamma')
    .replace(/\bDelta\b/gi, '\\Delta')
    .replace(/\bEpsilon\b/gi, '\\Epsilon')
    .replace(/\bZeta\b/gi, '\\Zeta')
    .replace(/\bEta\b/gi, '\\Eta')
    .replace(/\bTheta\b/gi, '\\Theta')
    .replace(/\bIota\b/gi, '\\Iota')
    .replace(/\bKappa\b/gi, '\\Kappa')
    .replace(/\bLambda\b/gi, '\\Lambda')
    .replace(/\bMu\b/gi, '\\Mu')
    .replace(/\bNu\b/gi, '\\Nu')
    .replace(/\bXi\b/gi, '\\Xi')
    .replace(/\bOmicron\b/gi, '\\Omicron')
    .replace(/\bPi\b/gi, '\\Pi')
    .replace(/\bRho\b/gi, '\\Rho')
    .replace(/\bSigma\b/gi, '\\Sigma')
    .replace(/\bTau\b/gi, '\\Tau')
    .replace(/\bUpsilon\b/gi, '\\Upsilon')
    .replace(/\bPhi\b/gi, '\\Phi')
    .replace(/\bChi\b/gi, '\\Chi')
    .replace(/\bPsi\b/gi, '\\Psi')
    .replace(/\bOmega\b/gi, '\\Omega')
    
    // Trigonometric and logarithmic functions
    .replace(/\bsin\b/gi, '\\sin')
    .replace(/\bcos\b/gi, '\\cos')
    .replace(/\btan\b/gi, '\\tan')
    .replace(/\bcot\b/gi, '\\cot')
    .replace(/\bsec\b/gi, '\\sec')
    .replace(/\bcsc\b/gi, '\\csc')
    .replace(/\barcsin\b/gi, '\\arcsin')
    .replace(/\barccos\b/gi, '\\arccos')
    .replace(/\barctan\b/gi, '\\arctan')
    .replace(/\blog\b/gi, '\\log')
    .replace(/\bln\b/gi, '\\ln')
    .replace(/\blg\b/gi, '\\lg')
    
    // Mathematical relations
    .replace(/≤/g, '\\leq')
    .replace(/≥/g, '\\geq')
    .replace(/≠/g, '\\neq')
    .replace(/≈/g, '\\approx')
    .replace(/≡/g, '\\equiv')
    .replace(/∝/g, '\\propto')
    .replace(/∈/g, '\\in')
    .replace(/∉/g, '\\notin')
    .replace(/⊂/g, '\\subset')
    .replace(/⊃/g, '\\supset')
    .replace(/⊆/g, '\\subseteq')
    .replace(/⊇/g, '\\supseteq')
    .replace(/∪/g, '\\cup')
    .replace(/∩/g, '\\cap')
    .replace(/∅/g, '\\emptyset')
    
    // Mathematical operators
    .replace(/±/g, '\\pm')
    .replace(/∓/g, '\\mp')
    .replace(/×/g, '\\times')
    .replace(/÷/g, '\\div')
    .replace(/∙/g, '\\cdot')
    .replace(/∘/g, '\\circ')
    
    // Number sets
    .replace(/\bℝ\b/g, '\\mathbb{R}')
    .replace(/\bℕ\b/g, '\\mathbb{N}')
    .replace(/\bℤ\b/g, '\\mathbb{Z}')
    .replace(/\bℚ\b/g, '\\mathbb{Q}')
    .replace(/\bR\b(?=\s|$)/g, '\\mathbb{R}')
    .replace(/\bN\b(?=\s|$)/g, '\\mathbb{N}')
    .replace(/\bZ\b(?=\s|$)/g, '\\mathbb{Z}')
    .replace(/\bQ\b(?=\s|$)/g, '\\mathbb{Q}');
  
  // Convert simple fractions (like "3 4" or "3/4")
  latex = latex.replace(/(\d+)\s+(\d+)/g, '\\frac{$1}{$2}');
  latex = latex.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
  
  // Convert superscripts and subscripts
  latex = latex.replace(/\^(\d+)/g, '^{$1}');
  latex = latex.replace(/_(\d+)/g, '_{$1}');
  
  // Convert power notation
  latex = latex.replace(/([a-zA-Z])\^([0-9]+)/g, '$1^{$2}');
  latex = latex.replace(/([a-zA-Z])_([0-9]+)/g, '$1_{$2}');
  
  // Handle square roots
  latex = latex.replace(/sqrt\s*\(([^)]+)\)/gi, '\\sqrt{$1}');
  latex = latex.replace(/sqrt\s+([a-zA-Z0-9]+)/gi, '\\sqrt{$1}');
  
  // Handle integrals with limits
  latex = latex.replace(/\\int\s*([a-zA-Z0-9\\\{\}]+)\s*([a-zA-Z]+)\s*d([a-zA-Z])/g, '\\int $1 \\, d$3');
  latex = latex.replace(/\\int\s+([a-zA-Z\\\(\)]+)\s+d([a-zA-Z])/g, '\\int $1 \\, d$2');
  
  // Clean up extra spaces
  latex = latex.replace(/\s+/g, ' ').trim();
  
  return latex;
}

// ========= Helper Functions ==========
function detectFillInBlank(text) {
  return /_{3,}/.test(text) ? "fillinblank" : null;
}

function parseQuestionText(htmlContent, text) {
  const regex = REGEX.question;
  const match = text.match(regex);
  if (match) {
    return {
      number: parseInt(match[2], 10),
      rawHtml: htmlContent.replace(match[0], "").trim(),
      plainText: text.replace(match[0], "").trim(),
    };
  }
  return {
    number: null,
    rawHtml: htmlContent.trim(),
    plainText: text.trim(),
  };
}

function detectDifficulty(text) {
  const match = text.match(/\((NB|TH|VD|VDC)\)/i);
  if (!match) return { code: null, label: null, text };
  const cleanText = text.replace(/\((NB|TH|VD|VDC)\)/i, "").trim();
  switch (match[1].toUpperCase()) {
    case "NB":
      return { code: "NHAN_BIET", label: "Nhận biết", text: cleanText };
    case "TH":
      return { code: "THONG_HIEU", label: "Thông hiểu", text: cleanText };
    case "VD":
      return { code: "VAN_DUNG", label: "Vận dụng", text: cleanText };
    case "VDC":
      return { code: "VAN_DUNG_CAO", label: "Vận dụng cao", text: cleanText };
    default:
      return { code: "THONG_THUONG", label: "", text: cleanText };
  }
}

function splitIgnoreParen(str) {
  const result = [];
  let current = "";
  let depth = 0;

  for (const ch of str) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);

    if (ch === ";" && depth === 0) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  if (current) result.push(current);
  return result;
}

function parseCorrectAnswer(text) {
  let raw = (text || "").trim();

  let parts = splitIgnoreParen(raw)
    .map(ans => ans.trim())
    .filter(Boolean);

  let results = [];
  for (let ans of parts) {
    let clean = ans
      .replace(/^(chọn|đáp án|answer)[:\s]*/i, "")
      .trim();

    let match = clean.match(
      /^([a-dA-D])[\)]\s*(đúng|sai|true|false|đ|s|T|F)$/i
    );
    if (match) {
      results.push({
        label: match[1].toUpperCase(),
        value:
          match[2].charAt(0).toUpperCase() +
          match[2].slice(1).toLowerCase(),
        rawHtml: ans,
      });
      continue;
    }

    match = clean.match(/^([a-dA-D])\)\s*(.*)$/);
    if (match) {
      results.push({
        label: match[1].toUpperCase(),
        value: match[2]?.trim() || match[1].toUpperCase(),
        rawHtml: ans,
      });
      continue;
    }

    if (/^(đúng|sai|true|false)$/i.test(clean)) {
      results.push({
        label: "",
        value:
          clean.charAt(0).toUpperCase() +
          clean.slice(1).toLowerCase(),
        rawHtml: ans,
      });
    } else {
      results.push({
        label: "",
        value: clean,
        rawHtml: ans,
      });
    }
  }

  return results;
}

function removePrefix(rawHtml) {
  if (!rawHtml) return "";
  return rawHtml
    .replace(/^\s*([A-Da-d][\)])\s*/, "")
    .replace(/<\/?p>/gi, "")
    .trim();
}

function removeBracketAndHash(rawHtml) {
  if (!rawHtml) return "";
  return rawHtml
    .replace(/^\s*\[([^\]]+)\]\s*/, "$1 ")
    .replace(/^\s*##\s*(.+)$/, "$1")
    .replace(/<\/?p>/gi, "")
    .trim();
}

function addChoice(question, text, rawHtml) {
  const $ = cheerio.load(rawHtml);
  let innerHtml = $("body").length ? $("body").html() : $.root().html();
  if (!innerHtml) innerHtml = rawHtml;

  const mathPlaceholders = [];
  const tempHtml = innerHtml.replace(
    /<span[^>]*class=(["'])math\1[^>]*>[\s\S]*?<\/span>/gi,
    (m) => {
      mathPlaceholders.push(m);
      return `__MATH_PLACEHOLDER_${mathPlaceholders.length - 1}__`;
    }
  );

  const labelRegex = /([A-Da-d])[\)]\s*/g;
  const candidates = [];
  let mm;
  while ((mm = labelRegex.exec(tempHtml)) !== null) {
    const idx = mm.index;
    const before = idx > 0 ? tempHtml[idx - 1] : "";
    if (idx === 0 || /[\s>]/.test(before)) {
      candidates.push({ index: idx, len: mm[0].length });
    }
  }

  if (candidates.length === 0) {
    let lines = innerHtml
      .split(/<br\s*\/?>|\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    lines = lines.map((l) => l.replace(/<\/?p>/gi, "").trim()).filter(Boolean);
    lines.forEach((line) => {
      const m = line.match(/^([A-Da-d])[\)]\s*(.+)$/i);
      if (m) {
        const label = m[1].toUpperCase();
        const choiceText = m[2].trim();
        if (/^(đúng|sai|true|false)$/i.test(choiceText)) {
          question.explanation =
            (question.explanation || "") + `${label}) ${choiceText}\n`;
        } else {
          question.choices.push({
            label,
            text: choiceText,
            rawHtml: `<p>${removePrefix(line)}</p>`,
          });
        }
      }
    });
    return;
  }

  for (let i = 0; i < candidates.length; i++) {
    const start = candidates[i].index;
    const end =
      i + 1 < candidates.length ? candidates[i + 1].index : tempHtml.length;
    let seg = tempHtml.slice(start, end);

    seg = seg.replace(
      /__MATH_PLACEHOLDER_(\d+)__/g,
      (_, n) => mathPlaceholders[Number(n)] || ""
    );

    const seg$ = cheerio.load("<div>" + seg + "</div>");
    const segText = seg$("div").text().trim();

    const labelMatch = segText.match(/^\s*([A-Da-d])[\)]\s*/i);
    if (!labelMatch) continue;
    const label = labelMatch[1].toUpperCase();
    const choiceText = segText.replace(/^\s*[A-Da-d][\)]\s*/i, "").trim();

    let cleanedRawHtml = seg.replace(/^\s*[A-Da-d][\)]\s*/i, "").trim();
    cleanedRawHtml = cleanedRawHtml
      .replace(/^\s*<[^>]{1,40}>\s*[A-Da-d][\)]\s*<\/[^>]{1,40}>/i, "")
      .replace(/<\/?p[^>]*>/gi, "")
      .trim();

    if (/^(đúng|sai|true|false)$/i.test(choiceText)) {
      question.explanation =
        (question.explanation || "") + `${label}) ${choiceText}\n`;
    } else {
      question.choices.push({
        label,
        text: cleanedRawHtml,
        rawHtml: cleanedRawHtml,
      });
    }
  }
}

function detectQuestionType(question) {
  if (question.type === "cluster") return "cluster";
  if (question.dragDropOptions?.length > 0) return "dragdrop";

  const correctAnswers = (question.correctAnswers || []).map((c) =>
    typeof c === "object" ? c.value : c
  );
  const answer = (question.choices || []).map((c) =>
    typeof c === "object" ? c.value || c.label : c
  );

  if (
    correctAnswers.some((v) =>
      ["Đúng", "Sai", "True", "False", "Đ", "S", "T", "F"].includes(v)
    )
  ) {
    return correctAnswers.length > 1 ? "truefalsemulti" : "truefalse";
  }

  if (question.rawHtml && /tính đúng sai/i.test(question.rawHtml)) {
    return "truefalsemulti";
  }

  if (detectFillInBlank(question.rawHtml) && answer.length === 0) {
    return "fillinblank";
  }

  if (correctAnswers.length > 1) return "multiplechoice";
  return "singlechoice";
}

function transformToExamWord(exam) {
  let parts = [];
  let partIndex = 0;
  let subjectIndex = 0;
  let numberQuestion = 1;

  for (const item of exam) {
    if (item.__isPart) {
      if (item.__partType === "part") {
        partIndex++;
        subjectIndex = 0;
        numberQuestion = 1;

        const name = item.plainText?.trim() || "";
        parts.push({
          name,
          time: 0,
          score: 0,
          type: "MAC_DINH",
          totalquestions: 0,
          subpart: [],
        });
      } else if (
        item.__partType === "subpart_mac_dinh" ||
        item.__partType === "subpart_nhom_chu_de"
      ) {
        let currentPart = parts[parts.length - 1];
        if (!currentPart) continue;

        if (!currentPart.subpart) currentPart.subpart = [];

        if (item.__partType === "subpart_nhom_chu_de") {
          currentPart.type = "NHOM_CHU_DE";
        }

        const name = removeBracketAndHash(item.plainText)?.trim() || "";
        const isFirstSubpart = currentPart.subpart.length === 0;
        const hasNumberPrefix = /^\d+\.\d+\s+/.test(name);
        currentPart.subpart.push({
          name,
          children: [],
          isMain: isFirstSubpart && !hasNumberPrefix,
        });
      } else if (item.__partType === "children") {
        subjectIndex++;
        let currentPart = parts[parts.length - 1];
        if (!currentPart) continue;

        if (!currentPart.subpart) currentPart.subpart = [];
        let lastSubpart = currentPart.subpart[currentPart.subpart.length - 1];
        if (!lastSubpart) {
          const hasNumberPrefix = /^\d+\.\d+\s+/.test(
            "Subpart " + subjectIndex
          );
          lastSubpart = {
            name: "Subpart " + subjectIndex,
            children: [],
            isMain: currentPart.subpart.length === 0 && !hasNumberPrefix,
          };
          currentPart.subpart.push(lastSubpart);
        }

        let subjectID = "";
        if (!lastSubpart.children) lastSubpart.children = [];

        if (currentPart.type === "NHOM_CHU_DE") {
          lastSubpart.children.push({
            name: removeBracketAndHash(item.plainText),
            subject_id: subjectID,
            questions: [],
          });
        }
      }
    } else {
      let currentPart = parts[parts.length - 1];
      if (!currentPart) {
        parts.push({
          name: "Phần " + (partIndex + 1),
          time: 0,
          score: 0,
          type: "MAC_DINH",
          totalquestions: 0,
          subpart: [],
        });
        currentPart = parts[parts.length - 1];
      }

      let lastSubpart = currentPart.subpart[currentPart.subpart.length - 1];
      if (!lastSubpart) {
        lastSubpart = {
          name: "SubPart 1",
          children: [],
          isMain: currentPart.subpart.length === 0 ? true : false,
        };
        currentPart.subpart.push(lastSubpart);
      }

      let lastChild;
      if (!lastSubpart.children || lastSubpart.children.length === 0) {
        lastChild = {
          name: "Children 1",
          questions: [],
        };
        if (!lastSubpart.children) lastSubpart.children = [];
        lastSubpart.children.push(lastChild);
      } else {
        lastChild = lastSubpart.children[lastSubpart.children.length - 1];
      }

      if (!lastChild.questions) lastChild.questions = [];
      lastChild.questions.push({
        question: item,
        number: item.number ?? (item.type === "cluster" ? 0 : numberQuestion++),
      });

      currentPart.totalquestions++;
    }
  }

  exam.forEach((clusterItem, clusterIndex) => {
    if (
      !clusterItem.__isPart &&
      clusterItem.type === "cluster" &&
      clusterItem.cluster &&
      Array.isArray(clusterItem.cluster)
    ) {
      const childQuestionIds = [];

      let clusterPartIndex = -1;
      let clusterSubpartIndex = -1;

      for (let i = clusterIndex - 1; i >= 0; i--) {
        if (exam[i].__isPart) {
          if (exam[i].__partType === "part") {
            clusterPartIndex++;
            clusterSubpartIndex = -1;
          } else if (
            exam[i].__partType === "subpart_mac_dinh" ||
            exam[i].__partType === "subpart_nhom_chu_de"
          ) {
            clusterSubpartIndex++;
          }
        }
      }

      if (clusterPartIndex === -1) {
        clusterPartIndex = 0;
      }

      if (clusterSubpartIndex === -1) {
        clusterSubpartIndex = 0;
      }

      if (clusterPartIndex >= 0 && clusterPartIndex < parts.length) {
        const targetPart = parts[clusterPartIndex];

        if (targetPart.subpart && targetPart.subpart.length > 0) {
          targetPart.subpart.forEach((subpart, subpartIndex) => {
            if (subpart.children) {
              subpart.children.forEach((child) => {
                if (child.questions) {
                  child.questions.forEach((questionItem) => {
                    if (
                      clusterItem.cluster.includes(questionItem.number) &&
                      questionItem.question.type !== "cluster"
                    ) {
                      questionItem.question.parentId = clusterItem.questionId;
                      childQuestionIds.push(questionItem.question.questionId);
                    }
                  });
                }
              });
            }
          });
        }
      }

      clusterItem.cluster = childQuestionIds;
    }
  });

  return parts;
}

// ========= PDF Extraction & Text Processing ==========
async function extractTextFromPdf(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (err) {
    console.error("PDF extraction error:", err.message);
    throw new Error("Lỗi khi trích xuất text từ PDF");
  }
}

async function performOcr(imagePath) {
  try {
    const result = await Tesseract.recognize(
      imagePath,
      "vie",
      {
        logger: (m) => console.log("OCR Progress:", m),
      }
    );
    return result.data.text;
  } catch (err) {
    console.error("OCR error:", err.message);
    throw new Error("Lỗi khi nhận dạng ký tự từ ảnh");
  }
}

function textToHtml(plainText) {
  // Chuyển đổi text thành HTML format
  const lines = plainText.split("\n").map((line) => line.trim()).filter(Boolean);
  const html = lines.map((line) => `<p>${line}</p>`).join("\n");
  return html;
}

function parseTextContent(rawText) {
  // Normalize Unicode math and merge math lines
  const normalizedText = normalizeUnicodeMath(rawText);
  const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);
  const mergedLines = mergeMathLines(lines);
  const processedText = mergedLines.join('\n');
  
  // Parse text content theo cấu trúc của file Word
  const $ = cheerio.load(textToHtml(processedText));
  const exam = [];
  let currentPart = null;
  let currentQuestion = null;
  let currentCluster = null;
  let mode = null;
  let qCounter = 0;

  $("p").each((_, el) => {
    const text = $(el).text().trim();
    let rawHtml = $.html(el) || "";
    rawHtml = rawHtml.replace(/[\r\n]+/g, " ").replace(/\\n/g, " ");

    if (!text) return;

    // ----- Part -----
    if (REGEX.part.test(text)) {
      currentPart = { plainText: text, __isPart: true, __partType: "part" };
      exam.push(currentPart);
      currentCluster = null;
      currentQuestion = null;
      return;
    }

    if (REGEX.subpartTitle.test(text)) {
      currentPart = {
        plainText: text,
        __isPart: true,
        __partType: "subpart_mac_dinh",
      };
      exam.push(currentPart);
      currentCluster = null;
      currentQuestion = null;
      return;
    }

    if (REGEX.groupTitle.test(text)) {
      currentPart = {
        plainText: text,
        __isPart: true,
        __partType: "subpart_nhom_chu_de",
      };
      exam.push(currentPart);
      currentCluster = null;
      currentQuestion = null;
      return;
    }

    if (REGEX.subjectTitle.test(text)) {
      currentPart = {
        plainText: text,
        __isPart: true,
        __partType: "children",
      };
      exam.push(currentPart);
      currentCluster = null;
      currentQuestion = null;
      return;
    }

    // --- Cluster ---
    if (REGEX.cluster.test(text)) {
      qCounter++;

      const match = text.match(REGEX.cluster);
      let clusterNumbers = [];
      if (match) {
        const startNum = parseInt(match[1] || match[3] || match[5], 10);
        const endNum = parseInt(match[2] || match[4] || match[6], 10);
        if (!isNaN(startNum) && !isNaN(endNum) && endNum >= startNum) {
          for (let n = startNum; n <= endNum; n++) {
            clusterNumbers.push(n);
          }
        }
      }

      currentCluster = {
        questionId: qCounter.toString(),
        rawHtml: rawHtml,
        plainText: text,
        type: "cluster",
        choices: [],
        dragDropOptions: [],
        correctAnswers: [],
        explanation: "",
        leadText: "",
        leadHtml: "",
        subject: "",
        cluster: clusterNumbers,
        deleted_at: null,
        level: "THONG_THUONG",
        parentId: null,
      };
      exam.push(currentCluster);
      mode = "question";
      return;
    }

    // --- Question ---
    if (REGEX.question.test(text)) {
      qCounter++;
      const parsed = parseQuestionText(rawHtml, text);
      
      // Detect math formulas in question
      const mathAnalysis = detectMathFormulas(parsed.plainText);
      
      currentQuestion = {
        questionId: qCounter.toString(),
        number: parsed.number,
        rawHtml: mathAnalysis.processed,
        plainText: mathAnalysis.processed,
        type: "unknown",
        choices: [],
        dragDropOptions: [],
        correctAnswers: [],
        explanation: "",
        leadText: "",
        leadHtml: "",
        subject: "",
        cluster: [],
        deleted_at: null,
        video: "",
        level: "THONG_THUONG",
        parentId: null,
        hasMath: mathAnalysis.hasMath,
        mathFormulas: mathAnalysis.formulas
      };

      const diff = detectDifficulty(text);
      if (diff) {
        currentQuestion.level = diff.code;
        currentQuestion.plainText = diff.text;
        currentQuestion.rawHtml = parsed.rawHtml
          .replace(/\((NB|TH|VD|VDC)\)/i, "")
          .trim();
      }

      exam.push(currentQuestion);
      mode = "question";
      return;
    }

    // --- Drag drop options ---
    if (REGEX.drag.test(text) && currentQuestion) {
      const dragText = text.split(":")[1]?.trim() || "";
      if (dragText) {
        currentQuestion.dragDropOptions = splitIgnoreParen(dragText)
          .map((i) => i.trim())
          .filter(Boolean);
      }
      mode = "choice";
      return;
    }

    // --- Choice ---
    if (
      REGEX.choice.test(text) &&
      currentQuestion &&
      (mode === "choice" || mode === "question")
    ) {
      addChoice(currentQuestion, text, rawHtml);
      mode = "choice";
      return;
    }

    // --- Explanation ---
    if (REGEX.explanation.test(text)) {
      mode = "explanation";
      const cleaned = text.replace(REGEX.explanation, "").trim();
      if (currentQuestion) {
        currentQuestion.explanation += cleaned + "<br/>";
      }
      return;
    }

    // --- Explain section ---
    if (REGEX.explainSection.test(text) && currentQuestion) {
      mode = "correct";
      const rawAnswer = text.split(":")[1]?.trim() || "";
      currentQuestion.correctAnswers = parseCorrectAnswer(rawAnswer);
      currentQuestion.type = detectQuestionType(currentQuestion);
      return;
    }
  });

  exam.forEach((item) => {
    if (!item.__isPart && item.type === "unknown") {
      item.type = detectQuestionType(item);
    }
  });

  return exam;
}

// ========= Controller Class ==========
class DocPdfTextController {
  uploadMiddleware() {
    return upload.single("PdfFile");
  }

  async uploadPdf(req, res) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Không có file được upload" });
    }

    try {
      let rawText = "";

      // Extract text từ PDF
      rawText = await extractTextFromPdf(file.path);

      // Cleanup
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }

      // Parse và xử lý text như file Word với math processing
      const exam = parseTextContent(rawText);
      const parts = transformToExamWord(exam);
      
      // Count math formulas and LaTeX conversion
      const mathStats = {
        totalQuestions: exam.filter(item => !item.__isPart).length,
        questionsWithMath: exam.filter(item => !item.__isPart && item.hasMath).length,
        totalFormulas: exam.reduce((sum, item) => {
          return sum + (item.mathFormulas ? item.mathFormulas.length : 0);
        }, 0),
        latexConversionEnabled: true
      };

      return res.json({
        // rawText: rawText,
        parts: parts,
        mathProcessing: {
          enabled: true,
          statistics: mathStats,
          unicodeMathNormalized: true,
          mathLinesMerged: true,
          latexConversion: true
        }
      });
    } catch (err) {
      console.log(err);
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (e) {
        console.error("Cleanup error:", e.message);
      }

      return res.status(500).json({
        error:
          "File lỗi, vui lòng kiểm tra lại thông tin các lỗi thường gặp trong tài liệu",
      });
    }
  }

  async uploadText(req, res) {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Không có text được nhập" });
    }

    try {
      // Parse và xử lý text như file Word với math processing
      const exam = parseTextContent(text);
      const parts = transformToExamWord(exam);
      
      // Count math formulas and LaTeX conversion
      const mathStats = {
        totalQuestions: exam.filter(item => !item.__isPart).length,
        questionsWithMath: exam.filter(item => !item.__isPart && item.hasMath).length,
        totalFormulas: exam.reduce((sum, item) => {
          return sum + (item.mathFormulas ? item.mathFormulas.length : 0);
        }, 0),
        latexConversionEnabled: true
      };

      return res.json({
        parts: parts,
        mathProcessing: {
          enabled: true,
          statistics: mathStats,
          unicodeMathNormalized: true,
          mathLinesMerged: true,
          latexConversion: true
        }
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error:
          "Lỗi xử lý text, vui lòng kiểm tra lại định dạng dữ liệu nhập",
      });
    }
  }

  async uploadImage(req, res) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Không có hình ảnh được upload" });
    }

    try {
      // Perform OCR trên ảnh
      const extractedText = await performOcr(file.path);

      // Cleanup
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }

      // Parse và xử lý text như file Word với math processing
      const exam = parseTextContent(extractedText);
      const parts = transformToExamWord(exam);
      
      // Count math formulas and LaTeX conversion
      const mathStats = {
        totalQuestions: exam.filter(item => !item.__isPart).length,
        questionsWithMath: exam.filter(item => !item.__isPart && item.hasMath).length,
        totalFormulas: exam.reduce((sum, item) => {
          return sum + (item.mathFormulas ? item.mathFormulas.length : 0);
        }, 0),
        latexConversionEnabled: true
      };

      return res.json({
        parts: parts,
        ocrText: extractedText,
        mathProcessing: {
          enabled: true,
          statistics: mathStats,
          unicodeMathNormalized: true,
          mathLinesMerged: true,
          latexConversion: true
        }
      });
    } catch (err) {
      console.log(err);
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      } catch (e) {
        console.error("Cleanup error:", e.message);
      }

      return res.status(500).json({
        error: "Lỗi nhận dạng ảnh hoặc xử lý dữ liệu",
      });
    }
  }
}

module.exports = new DocPdfTextController();
