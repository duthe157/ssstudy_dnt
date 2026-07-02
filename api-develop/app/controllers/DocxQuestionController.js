const path = require("path");
const multer = require("multer");
const mammoth = require("mammoth");
const cheerio = require("cheerio");
const AdmZip = require("adm-zip");
const omml2mathml = require("omml2mathml");
const { raw } = require("body-parser");
const upload = multer({
    dest: path.join(__dirname, "../../temp/docx"),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// ========= Regex =========
const REGEX = {
    part: /^(PHẦN)/,
    question: /^(Câu|Question)\s*(\d+)[\.:]?\s*/i,
    cluster:
        /^(?:(?:Đọc|Dựa vào|Theo|Read|Based on).*?(?:từ\s+\d+\s+đến\s+\d+|câu hỏi.*?(?:từ|đến).*?\d+|questions?\s+\d+\s*[-–—]\s*\d+)|Questions?\s+(\d+)\s*[-–—]\s*(\d+)|Each of the following.*?(?:questions?|statements?)|Read the following\s+(?:passage|text|statements?)|Choose\s+(?:the\s+best\s+answer|correct)|Decide whether.*?(?:True|False|correct))/iu,
    drag: /^các lựa chọn kéo[:]?/i,
    choice: /^([A-Da-d])[.)]\s*/i,
    explanation: /^giải thích[:]?/i,
    video: /^video[:]?/i,
    correct: /^lời giải[:]?/i,
    subpartTitle: /^(\d+\.\d+)\s+.+$/u,
    groupTitle: /^\[\p{L}(?:[\p{L}\s]*\p{L})?\]$/u,
    subjectTitle: /^##\s*\p{L}(?:[\p{L}\s]*\p{L})?$/u,
};

function detectFillInBlank(text) {
    return /_{3,}/.test(text) ? "fillinblank" : null;
}
function extractPlainMath(ommlXml) {
    if (!ommlXml || typeof ommlXml !== 'string') {
        return '';
    }

    let text = ommlXml;
    function decodeEntities(s) {
        if (!s) return "";

        const entityMap = {
            '&amp;': "&", '&lt;': "<", '&gt;': ">", '&le;': "≤", '&ge;': "≥",
            '&ne;': "≠", '&plusmn;': "±", '&approx;': "≈", '&asymp;': "≈",
            '&rarr;': "→", '&rArr;': "⇒", '&hArr;': "⇔", '&in;': "∈"
        };

        s = s.replace(/&(amp|lt|gt|le|ge|ne|plusmn|approx|asymp|rarr|rArr|hArr|in);/g,
            (match, entity) => entityMap[match] || match);

        s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16)));
        s = s.replace(/&#([0-9]+);/g, (_, dec) =>
            String.fromCharCode(parseInt(dec, 10)));

        const mathSymbolMap = {
            "≤": "\\le ", "≥": "\\ge ", "≠": "\\neq ", "±": "\\pm ",
            "≈": "\\approx ", "∈": "\\in ", "→": "\\to ",
            "⇒": "\\Rightarrow ", "⇔": "\\Leftrightarrow ", "∞": "\\infty ",
            "∂": "\\partial ", "∑": "\\sum ", "∏": "\\prod ", "∫": "\\int "
        };

        return s.replace(/[≤≥≠±≈∈→⇒⇔∞∂∑∏∫]/g, char => mathSymbolMap[char] || char);
    }
    function parseInner(inner) {
        if (!inner) return "";

        return inner
            .replace(/<m:t>([\s\S]*?)<\/m:t>/gi, (_, content) => content)
            .replace(/<\/?[\w:\-]+[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }
    function extractContent(xml, tag) {
        const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`, 'i');
        const match = xml.match(regex);
        return match ? match[1] : '';
    }
    function extractAllContents(xml, tag) {
        const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`, 'gi');
        const matches = [];
        let match;
        while ((match = regex.exec(xml)) !== null) {
            matches.push(match[1]);
        }
        return matches;
    }
    function extractAttribute(xml, tag) {
        const regex = new RegExp(`<${tag}[^>]*?m:val="([^"]*)"`, 'i');
        const match = xml.match(regex);
        return match ? match[1] : '';
    }
    function processVector(full) {
        const accentMatch = full.match(/<m:acc[^>]*>([\s\S]*?)<\/m:acc>/i);
        if (accentMatch) {
            const accentContent = accentMatch[1];
            const accentChar = extractAttribute(accentContent, 'm:chr');

            if (accentChar === '→' || accentChar === '⃗') {
                const baseElement = extractContent(full, 'm:e');
                const base = parseInner(baseElement);
                if (base) {
                    return `\\vec{${base}}`;
                }
            }
        }
        return full;
    }
    function processMatrixForCases(full) {
        // Xử lý các phần tử lồng nhau trước (sSup, f, rad, func, etc.)
        let processedFull = full;

        // Xử lý lũy thừa
        processedFull = processedFull.replace(/<m:sSup>([\s\S]*?)<\/m:sSup>/gi, (match) => {
            const base = parseInner(extractContent(match, 'm:e'));
            const sup = parseInner(extractContent(match, 'm:sup'));
            const result = `${base}^{${sup}}`;
            return `<m:t>__FORMULA__${result}__END__</m:t>`;
        });

        // Xử lý phân số
        processedFull = processedFull.replace(/<m:f>([\s\S]*?)<\/m:f>/gi, (match) => {
            const num = extractContent(match, 'm:num');
            const den = extractContent(match, 'm:den');
            const numerator = parseInner(num);
            const denominator = parseInner(den);
            const result = `\\frac{${numerator}}{${denominator}}`;
            return `<m:t>__FORMULA__${result}__END__</m:t>`;
        });

        // Xử lý căn bậc
        processedFull = processedFull.replace(/<m:rad>([\s\S]*?)<\/m:rad>/gi, (match) => {
            const deg = extractContent(match, 'm:deg');
            const expr = extractContent(match, 'm:e');
            const degree = parseInner(deg);
            const content = parseInner(expr);
            const result = degree ? `\\sqrt[${degree}]{${content}}` : `\\sqrt{${content}}`;
            return `<m:t>__FORMULA__${result}__END__</m:t>`;
        });

        // Xử lý hàm log/ln và lượng giác
        processedFull = processedFull.replace(/<m:func>([\s\S]*?)<\/m:func>/gi, (match) => {
            if (/<m:fName>[\s\S]*?(log|ln)[\s\S]*?<\/m:fName>/i.test(match)) {
                const result = processLogFunction(match);
                return `<m:t>__FORMULA__${result}__END__</m:t>`;
            } else if (/<m:fName>[\s\S]*?(sin|cos|tan|cot|sec|csc)[\s\S]*?<\/m:fName>/i.test(match)) {
                const result = processTrigFunction(match);
                return `<m:t>__FORMULA__${result}__END__</m:t>`;
            } else {
                return match;
            }
        });

        // Xử lý chỉ số dưới
        processedFull = processedFull.replace(/<m:sSub>([\s\S]*?)<\/m:sSub>/gi, (match) => {
            const base = parseInner(extractContent(match, 'm:e'));
            const sub = parseInner(extractContent(match, 'm:sub'));
            const result = `${base}_{${sub}}`;
            return `<m:t>__FORMULA__${result}__END__</m:t>`;
        });

        const rows = [];
        const mRows = extractAllContents(processedFull, 'm:mr');

        mRows.forEach((mRow) => {
            const rowTexts = [];
            const textMatches = mRow.matchAll(/<m:t>([^<]*)<\/m:t>/gi);

            for (const match of textMatches) {
                let text = match[1]
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/\s+/g, ' ')
                    .trim();

                // Giữ nguyên công thức đã xử lý
                if (text.includes('__FORMULA__')) {
                    text = text.replace(/__FORMULA__|__END__/g, '');
                }

                if (text && text !== '&') {
                    rowTexts.push(text);
                }
            }

            const rowContent = rowTexts.join(' ');

            if (rowContent) {
                // Format expression nếu cần
                const formattedRow = formatExpression(rowContent);
                rows.push(formattedRow);
            }
        });

        if (rows.length >= 2) {
            const result = `\\begin{cases} ${rows.join(' \\\\ ')} \\end{cases}`;
            return result;
        }

        return full;
    }
    function processCases(full) {

        // Xử lý các phần tử lồng nhau trước (sSup, f, rad, etc.)
        let processedFull = full;

        // Xử lý lũy thừa
        processedFull = processedFull.replace(/<m:sSup>([\s\S]*?)<\/m:sSup>/gi, (match) => {
            const base = parseInner(extractContent(match, 'm:e'));
            const sup = parseInner(extractContent(match, 'm:sup'));
            const result = `${base}^{${sup}}`;
            return `<m:t>__FORMULA__${result}__END__</m:t>`;
        });

        processedFull = processedFull.replace(/<m:f>([\s\S]*?)<\/m:f>/gi, (match) => {
            const num = extractContent(match, 'm:num');
            const den = extractContent(match, 'm:den');
            const numerator = parseInner(num);
            const denominator = parseInner(den);
            const result = `\\frac{${numerator}}{${denominator}}`;
            return `<m:t>__FORMULA__${result}__END__</m:t>`;
        });

        processedFull = processedFull.replace(/<m:rad>([\s\S]*?)<\/m:rad>/gi, (match) => {
            const deg = extractContent(match, 'm:deg');
            const expr = extractContent(match, 'm:e');
            const degree = parseInner(deg);
            const content = parseInner(expr);
            const result = degree ? `\\sqrt[${degree}]{${content}}` : `\\sqrt{${content}}`;
            return `<m:t>__FORMULA__${result}__END__</m:t>`;
        });

        // Xử lý hàm log/ln
        processedFull = processedFull.replace(/<m:func>([\s\S]*?)<\/m:func>/gi, (match) => {
            if (/<m:fName>[\s\S]*?(log|ln)[\s\S]*?<\/m:fName>/i.test(match)) {
                const result = processLogFunction(match);
                return `<m:t>__FORMULA__${result}__END__</m:t>`;
            } else if (/<m:fName>[\s\S]*?(sin|cos|tan|cot|sec|csc)[\s\S]*?<\/m:fName>/i.test(full)) {
                const result = processTrigFunction(full);
                return `<m:t>__FORMULA__${result}__END__</m:t>`;
            } else {
                return match;
            }
        });

        // Thu thập tất cả text (bao gồm cả công thức đã xử lý)
        const allTexts = [];
        const textMatches = processedFull.matchAll(/<m:t[^>]*>([^<]*)<\/m:t>/gi);
        for (const match of textMatches) {
            let text = match[1]
                .replace(/&amp;/g, '& ')
                .replace(/&lt;/g, '< ')
                .replace(/&gt;/g, '> ')
                .replace(/\s+/g, ' ')
                .trim();

            // Giữ nguyên công thức đã xử lý
            if (text.includes('__FORMULA__')) {
                text = text.replace(/__FORMULA__|__END__/g, '');
            }

            if (text && text !== '&') {
                allTexts.push(text);
            }
        }

        if (allTexts.length < 2) {
            return full;
        }

        const rows = [];
        let currentExpression = '';

        for (let i = 0; i < allTexts.length; i++) {
            const text = allTexts[i];

            if (text === 'khi') {
                let condition = '';
                for (let j = i + 1; j < allTexts.length; j++) {
                    if (allTexts[j].startsWith('&')) break;
                    condition += (condition ? ' ' : '') + allTexts[j];
                    i = j;
                }
                if (currentExpression) {
                    const formattedExpression = formatExpression(currentExpression);
                    rows.push(`${formattedExpression} \\text{ khi } ${condition}`);
                    currentExpression = '';
                }
            }
            else if (text.startsWith('&')) {
                if (currentExpression) {
                    const formattedExpression = formatExpression(currentExpression);
                    rows.push(formattedExpression);
                }
                currentExpression = text.substring(1);
            }
            else {
                currentExpression += (currentExpression ? ' ' : '') + text;
            }
        }

        if (currentExpression) {
            const formattedExpression = formatExpression(currentExpression);
            rows.push(formattedExpression);
        }

        if (rows.length > 0) {
            return `\\begin{cases} ${rows.join(' \\\\ ')} \\end{cases}`;
        }

        return full;
    }
    function formatExpression(expr) {
        if (/\\(frac|sqrt|log|ln|left|right|\^|_)/.test(expr)) {
            return expr.trim();
        }

        return expr
            .replace(/(\d)([a-zA-Z])/g, '$1 $2')
            .replace(/([a-zA-Z])(\d)/g, '$1 $2')
            .replace(/([+\-*/])(?=\S)/g, '$1 ')
            .replace(/(\S)([+\-*/])/g, '$1 $2')
            .trim();
    }
    function processNary(full) {
        const symbolMap = { "1": "∫", "∑": "∑", "∏": "∏", "∫": "∫" };
        let symbol = extractAttribute(full, 'm:val') || "∫";
        symbol = symbolMap[symbol] || "∫";
        const begMatch = full.match(/<m:begChr[^>]*m:val="([^"]*)"/i);
        const endMatch = full.match(/<m:endChr[^>]*m:val="([^"]*)"/i);
        let beg = begMatch ? begMatch[1] : null;
        let end = endMatch ? endMatch[1] : null;
        if (beg === undefined || beg === null) {
            beg = "(";
        }
        if (end === undefined || end === null) {
            end = ")";
        }
        const delimiterMap = {
            "(": "(", ")": ")", "[": "[", "]": "]", "": "",
            "{": "\\{", "}": "\\}", "|": "|", "⟨": "\\langle", "⟩": "\\rangle"
        };
        const leftDelim = delimiterMap[beg] || beg;
        const rightDelim = delimiterMap[end] || end;
        const sub = parseInner(extractContent(full, 'm:sub'));
        const sup = parseInner(extractContent(full, 'm:sup'));

        let exprLatex = "";
        const eElements = extractAllContents(full, 'm:r');
        if (symbol === "∫" && eElements.length >= 2) {
            // === LẤY TEXT TRONG MỖI <m:t> ===
            const texts = eElements
                .map(e => {
                    const match = e.match(/<m:t>([\s\S]*?)<\/m:t>/i);
                    return match ? match[1].trim() : "";
                })
                .filter(Boolean);

            let lower = "", upper = "", func = "";

            // === PHÂN TÍCH CẬN DƯỚI - CẬN TRÊN - BIỂU THỨC ===
            if (texts.length >= 4) {
                [lower, upper, ...func] = texts;
                func = func.join("");
            } else if (texts.length === 3) {
                [lower, upper, func] = texts;
            } else {
                func = texts.join("");
            }
            let effectiveLength = 0;
            if (/dx/.test(func)) {
                func = func.replace(/dx/g, "");
                effectiveLength = eElements.length - 1;
            } else
                effectiveLength = eElements.length;


            if (effectiveLength > 4) {
                exprLatex = `${leftDelim}${func}${rightDelim}`;
            }
            else {
                exprLatex = `${func}`;
            }
        }
        else {
            const latexParts = eElements.map(e => {
                const match = e.match(/<m:t>([\s\S]*?)<\/m:t>/i);
                return match ? match[1].trim() : "";
            }).filter(Boolean);

            exprLatex = latexParts.join(" ");
        }


        const hasOuterDx = /<m:r>[\s\S]*?<m:t>\s*d\s*[a-zA-Z]\s*<\/m:t>[\s\S]*?<\/m:r>/i.test(full);
        if (hasOuterDx && !exprLatex.includes('\\,d')) {
            const dxMatch = full.match(/<m:r>[\s\S]*?<m:t>\s*d\s*([a-zA-Z])\s*<\/m:t>[\s\S]*?<\/m:r>/i);
            const dxVar = dxMatch ? dxMatch[1] : 'x';
            exprLatex += '\\,d' + dxVar;
        }

        let result = `\\${symbol === "∫" ? "int" : symbol}_{${sub}}^{${sup}} ${exprLatex}`;
        return result;
    }
    function processLogFunction(full) {
        const fName = extractContent(full, 'm:fName');

        const logElement = extractContent(fName, 'm:r');
        const logText = parseInner(logElement);

        // Xử lý ln
        if (logText === 'ln') {
            // Xử lý phân số trong argument trước
            let processedFull = full.replace(/<m:f>([\s\S]*?)<\/m:f>/gi, (match) => {
                const num = extractContent(match, 'm:num');
                const den = extractContent(match, 'm:den');
                const numerator = parseInner(num);
                const denominator = parseInner(den);
                const result = `\\frac{${numerator}}{${denominator}}`;
                return `<m:t>__FRAC__${result}__END__</m:t>`;
            });

            const allTexts = [];
            const allTextMatches = processedFull.matchAll(/<m:t>([^<]*)<\/m:t>/gi);
            for (const match of allTextMatches) {
                const text = match[1].trim();
                if (!fName.includes(match[0]) && text && text !== 'ln') {
                    allTexts.push(text);
                }
            }

            if (allTexts.length > 0) {
                let argument = allTexts.join(' ');
                // Khôi phục phân số
                argument = argument.replace(/__FRAC__|__END__/g, '');

                const hasLatexFormula = /\\frac/.test(argument);
                const needsParentheses = hasLatexFormula || argument.length > 1 || /[+\-*/=()]/.test(argument);

                return needsParentheses
                    ? `\\ln\\left(${argument}\\right)`
                    : `\\ln ${argument}`;
            }
            return "\\ln";
        }

        // Xử lý log với cơ số (nếu có)
        const sSubMatch = fName.match(/<m:sSub>([\s\S]*?)<\/m:sSub>/i);
        if (sSubMatch) {
            const sSubContent = sSubMatch[1];
            const logElement = extractContent(sSubContent, 'm:e');
            const baseElement = extractContent(sSubContent, 'm:sub');

            const logText = parseInner(logElement);
            const base = parseInner(baseElement);

            // Xử lý phân số trong argument
            let processedFull = full.replace(/<m:f>([\s\S]*?)<\/m:f>/gi, (match) => {
                const num = extractContent(match, 'm:num');
                const den = extractContent(match, 'm:den');
                const numerator = parseInner(num);
                const denominator = parseInner(den);
                const result = `\\frac{${numerator}}{${denominator}}`;
                return `<m:t>__FRAC__${result}__END__</m:t>`;
            });

            const allTexts = [];
            const allTextMatches = processedFull.matchAll(/<m:t>([^<]*)<\/m:t>/gi);
            for (const match of allTextMatches) {
                const text = match[1].trim();
                if (!fName.includes(match[0]) && text && text !== 'log') {
                    allTexts.push(text);
                }
            }

            if (logText === 'log' && base) {
                if (allTexts.length > 0) {
                    let argument = allTexts.join(' ');
                    // Khôi phục phân số
                    argument = argument.replace(/__FRAC__|__END__/g, '');

                    const hasLatexFormula = /\\frac/.test(argument);
                    const needsParentheses = hasLatexFormula || argument.length > 1 || /[+\-*/=()]/.test(argument);

                    return needsParentheses
                        ? `\\log_{${base}}\\left(${argument}\\right)`
                        : `\\log_{${base}} ${argument}`;
                } else {
                    return `\\log_{${base}}`;
                }
            }
        }

        // Xử lý log cơ số 10
        let processedFull = full.replace(/<m:f>([\s\S]*?)<\/m:f>/gi, (match) => {
            const num = extractContent(match, 'm:num');
            const den = extractContent(match, 'm:den');
            const numerator = parseInner(num);
            const denominator = parseInner(den);
            const result = `\\frac{${numerator}}{${denominator}}`;
            return `<m:t>__FRAC__${result}__END__</m:t>`;
        });

        const allTextMatches = processedFull.matchAll(/<m:t>([^<]*)<\/m:t>/gi);
        const allTexts = [];
        for (const match of allTextMatches) {
            const text = match[1].trim();
            if (text && text !== 'log') {
                allTexts.push(text);
            }
        }

        if (allTexts.length > 0) {
            let argument = allTexts.join(' ');
            // Khôi phục phân số
            argument = argument.replace(/__FRAC__|__END__/g, '');

            const hasLatexFormula = /\\frac/.test(argument);
            const needsParentheses = hasLatexFormula || argument.length > 1 || /[+\-*/=()]/.test(argument);

            return needsParentheses
                ? `\\log\\left(${argument}\\right)`
                : `\\log ${argument}`;
        }

        return "\\log";
    }
    function processTrigFunction(full) {
        const fName = extractContent(full, 'm:fName');
        const funcText = parseInner(fName).trim().toLowerCase();
        // console.log('FUll : ', full)
        const trigFuncs = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arctan', 'arcsin', 'arccos', 'arccot', 'arcsec', 'arccsc'];
        if (!trigFuncs.includes(funcText)) return full;

        let eElement = extractContent(full, 'm:e');

        eElement = eElement.replace(/<m:f>([\s\S]*?)<\/m:f>/gi, (match) => {
            const num = extractContent(match, 'm:num');
            const den = extractContent(match, 'm:den');
            const numerator = parseInner(num);
            const denominator = parseInner(den);
            const result = `\\frac{${numerator}}{${denominator}}`;
            return `<m:t>__FRAC__${result}__END__</m:t>`;
        });

        eElement = eElement.replace(/<m:sSup>([\s\S]*?)<\/m:sSup>/gi, (match) => {
            const base = parseInner(extractContent(match, 'm:e'));
            const sup = parseInner(extractContent(match, 'm:sup'));
            const result = `${base}^{${sup}}`;
            return `<m:t>__SUP__${result}__END__</m:t>`;
        });

        eElement = eElement.replace(/<m:rad>([\s\S]*?)<\/m:rad>/gi, (match) => {
            const deg = extractContent(match, 'm:deg');
            const expr = extractContent(match, 'm:e');
            const degree = parseInner(deg);
            const content = parseInner(expr);
            const result = degree ? `\\sqrt[${degree}]{${content}}` : `\\sqrt{${content}}`;
            return `<m:t>__RAD__${result}__END__</m:t>`;
        });

        let argument = parseInner(eElement).trim();

        argument = argument.replace(/__FRAC__|__SUP__|__RAD__|__END__/g, '');

        if (!argument) return `\\${funcText}`;

        const hasLatexFormula = /\\(frac|sqrt|\^|_)/.test(argument);
        const needsParentheses = hasLatexFormula || argument.length > 1 || /[+\-*/=()]/.test(argument);

        return needsParentheses
            ? `\\${funcText}\\left(${argument}\\right)`
            : `\\${funcText} ${argument}`;
    }
    text = text.replace(/<m:d>[\s\S]*?<m:m>[\s\S]*?<\/m:m>[\s\S]*?<\/m:d>/gi, processMatrixForCases);

    text = text.replace(/<m:eqArr>[\s\S]*?<\/m:eqArr>/gi, processCases);

    text = text.replace(/<m:func>[\s\S]*?<\/m:func>/gi, (full) => {
        if (/<m:fName>[\s\S]*?(sin|cos|tan|cot|sec|csc)[\s\S]*?<\/m:fName>/i.test(full)) {
            return processTrigFunction(full);
        } else {
            return processLogFunction(full);
        }
    });


    text = text.replace(/<m:nary>[\s\S]*?<\/m:nary>/gi, processNary);

    text = text.replace(/<m:acc[^>]*>[\s\S]*?<\/m:acc>/gi, processVector);

    function getText(xml) {
        if (!xml) return "";
        return xml
            .replace(/<m:t[^>]*>([\s\S]*?)<\/m:t>/gi, (_, c) => c)
            .replace(/<\/?[\w:\-]+[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    text = text.replace(/<m:d[^>]*>[\s\S]*?<\/m:d>/gi, (full) => {
        if (/\\begin{cases}/.test(full)) return full;
        if (/<m:m>/.test(full)) return full;

        // Xử lý <m:sSup> bên trong <m:d> trước
        let innerProcessed = full.replace(/<m:sSup>([\s\S]*?)<\/m:sSup>/gi, (match) => {
            const base = parseInner(extractContent(match, 'm:e'));
            const sup = parseInner(extractContent(match, 'm:sup'));
            return `__SSUP_START__${base}^{${sup}}__SSUP_END__`;
        });

        // Xử lý <m:sSub> bên trong <m:d>
        innerProcessed = innerProcessed.replace(/<m:sSub>([\s\S]*?)<\/m:sSub>/gi, (match) => {
            const base = parseInner(extractContent(match, 'm:e'));
            const sub = parseInner(extractContent(match, 'm:sub'));
            return `__SSUB_START__${base}_{${sub}}__SSUB_END__`;
        });

        const begMatch = innerProcessed.match(/<m:begChr[^>]*m:val="([^"]*)"/i);
        const endMatch = innerProcessed.match(/<m:endChr[^>]*m:val="([^"]*)"/i);

        let beg = begMatch ? begMatch[1] : null;
        let end = endMatch ? endMatch[1] : null;
        if (beg === undefined || beg === null) {
            beg = "(";
        }
        if (end === undefined || end === null) {
            end = ")";
        }
        const inner = extractContent(innerProcessed, 'm:e');
        let inside = parseInner(inner);

        inside = inside.replace(/__SSUP_START__|__SSUP_END__|__SSUB_START__|__SSUB_END__/g, '');

        const delimiterMap = {
            "(": "(", ")": ")", "[": "[", "]": "]", "": "",
            "{": "\\{", "}": "\\}", "|": "|", "⟨": "\\langle", "⟩": "\\rangle"
        };

        const leftDelim = delimiterMap[beg] || beg;
        const rightDelim = delimiterMap[end] || end;

        if (beg === "|" && end === "|") {
            return `__MD_START__\\left|${inside}\\right|__MD_END__`;
        }
        if (beg === "" || (typeof beg === 'string' && beg.trim() === "")) {
            return `__MD_START__${inside})__MD_END__`;
        }

        return `__MD_START__\\left${leftDelim}${inside}\\right${rightDelim}__MD_END__`;
    });

    // Sau đó xử lý <m:sSup> còn lại (ngoài <m:d>)
    let processed = text;
    let foundSSup = true;

    while (foundSSup) {
        foundSSup = false;

        const startPos = processed.indexOf('<m:sSup>');
        if (startPos === -1) break;

        let depth = 0;
        let endPos = -1;
        let i = startPos;

        while (i < processed.length) {
            if (processed.substring(i, i + 8) === '<m:sSup>') {
                depth++;
                i += 8;
            } else if (processed.substring(i, i + 9) === '</m:sSup>') {
                depth--;
                if (depth === 0) {
                    endPos = i + 9;
                    break;
                }
                i += 9;
            } else {
                i++;
            }
        }

        if (endPos === -1) {
            break;
        }
        const full = processed.substring(startPos, endPos);
        const countOpenSup = (full.match(/<m:sSup>/g) || []).length;

        if (countOpenSup === 1) {
            const base = parseInner(extractContent(full, 'm:e'));
            const supContent = extractContent(full, 'm:sup');

            const allTexts = [];
            const textMatches = supContent.matchAll(/<m:t[^>]*>([\s\S]*?)<\/m:t>/gi);
            for (const match of textMatches) {
                allTexts.push(match[1]);
            }

            let sup = allTexts.join('');
            sup = sup.replace(/__INNER__/g, '').replace(/__END__/g, '');

            const result = `${base}^{${sup}}`;

            processed = processed.substring(0, startPos) + result + processed.substring(endPos);
            foundSSup = true;
        } else {

            let innerStart = -1;
            const regex = /<m:sSup>/g;
            let match;
            let count = 0;

            while ((match = regex.exec(full)) !== null) {
                count++;
                if (count === 2) {
                    innerStart = startPos + match.index;
                    break;
                }
            }

            if (innerStart === -1) {
                break;
            }

            let innerDepth = 0;
            let innerEnd = -1;
            let j = innerStart;

            while (j < endPos) {
                if (processed.substring(j, j + 8) === '<m:sSup>') {
                    innerDepth++;
                    j += 8;
                } else if (processed.substring(j, j + 9) === '</m:sSup>') {
                    innerDepth--;
                    if (innerDepth === 0) {
                        innerEnd = j + 9;
                        break;
                    }
                    j += 9;
                } else {
                    j++;
                }
            }

            if (innerEnd === -1) {
                break;
            }

            const innerFull = processed.substring(innerStart, innerEnd);
            const base = parseInner(extractContent(innerFull, 'm:e'));
            const sup = parseInner(extractContent(innerFull, 'm:sup'));
            const result = `${base}^{${sup}}`;
            const placeholder = `<m:r><w:rPr></w:rPr><m:t>__INNER__${result}__END__</m:t></m:r>`;
            processed = processed.substring(0, innerStart) + placeholder + processed.substring(innerEnd);

            foundSSup = true;
        }
    }

    text = processed;

    // Xử lý <m:sSub> còn lại (ngoài <m:d>)
    processed = text;
    let foundSSub = true;

    while (foundSSub) {
        foundSSub = false;

        const startPos = processed.indexOf('<m:sSub>');
        if (startPos === -1) break;

        let depth = 0;
        let endPos = -1;
        let i = startPos;

        while (i < processed.length) {
            if (processed.substring(i, i + 8) === '<m:sSub>') {
                depth++;
                i += 8;
            } else if (processed.substring(i, i + 9) === '</m:sSub>') {
                depth--;
                if (depth === 0) {
                    endPos = i + 9;
                    break;
                }
                i += 9;
            } else {
                i++;
            }
        }

        if (endPos === -1) {
            break;
        }
        const full = processed.substring(startPos, endPos);
        const countOpenSub = (full.match(/<m:sSub>/g) || []).length;

        if (countOpenSub === 1) {
            const base = parseInner(extractContent(full, 'm:e'));
            const subContent = extractContent(full, 'm:sub');

            const allTexts = [];
            const textMatches = subContent.matchAll(/<m:t[^>]*>([\s\S]*?)<\/m:t>/gi);
            for (const match of textMatches) {
                allTexts.push(match[1]);
            }

            let sub = allTexts.join('');
            sub = sub.replace(/__INNER__/g, '').replace(/__END__/g, '');

            const result = `${base}_{${sub}}`;

            processed = processed.substring(0, startPos) + result + processed.substring(endPos);
            foundSSub = true;
        } else {
            // Xử lý lồng nhau
            let innerStart = -1;
            const regex = /<m:sSub>/g;
            let match;
            let count = 0;

            while ((match = regex.exec(full)) !== null) {
                count++;
                if (count === 2) {
                    innerStart = startPos + match.index;
                    break;
                }
            }

            if (innerStart === -1) {
                break;
            }

            let innerDepth = 0;
            let innerEnd = -1;
            let j = innerStart;

            while (j < endPos) {
                if (processed.substring(j, j + 8) === '<m:sSub>') {
                    innerDepth++;
                    j += 8;
                } else if (processed.substring(j, j + 9) === '</m:sSub>') {
                    innerDepth--;
                    if (innerDepth === 0) {
                        innerEnd = j + 9;
                        break;
                    }
                    j += 9;
                } else {
                    j++;
                }
            }

            if (innerEnd === -1) {
                break;
            }

            const innerFull = processed.substring(innerStart, innerEnd);
            const base = parseInner(extractContent(innerFull, 'm:e'));
            const sub = parseInner(extractContent(innerFull, 'm:sub'));
            const result = `${base}_{${sub}}`;
            const placeholder = `<m:r><w:rPr></w:rPr><m:t>__INNER__${result}__END__</m:t></m:r>`;
            processed = processed.substring(0, innerStart) + placeholder + processed.substring(innerEnd);

            foundSSub = true;
        }
    }

    text = processed;

    // Khôi phục các <m:d> đã xử lý
    text = text.replace(/__MD_START__|__MD_END__/g, '');
    text = text.replace(/<m:sSubSup>[\s\S]*?<\/m:sSubSup>/gi, (full) => {
        const e = full.match(/<m:e>([\s\S]*?)<\/m:e>/i);
        const sub = full.match(/<m:sub>([\s\S]*?)<\/m:sub>/i);
        const sup = full.match(/<m:sup>([\s\S]*?)<\/m:sup>/i);
        return `${getText(e?.[1])}_{${getText(sub?.[1])}}^{${getText(sup?.[1])}}`;
    });

    text = text.replace(/<m:rad>[\s\S]*?<\/m:rad>/gi, (full) => {
        const deg = full.match(/<m:deg>([\s\S]*?)<\/m:deg>/i);
        const expr = full.match(/<m:e>([\s\S]*?)<\/m:e>/i);
        const degree = getText(deg?.[1]);
        const content = getText(expr?.[1]);
        return degree ? `\\sqrt[${degree}]{${content}}` : `\\sqrt{${content}}`;
    });
    text = text.replace(/<m:bar>[\s\S]*?<\/m:bar>/gi, (full) => {
        const posMatch = full.match(/<m:barPr>[\s\S]*?<m:pos[^>]*m:val="([^"]+)"/i);
        const pos = posMatch ? posMatch[1] : "top";

        const expr = extractContent(full, "m:e");
        const expression = parseInner(expr);

        return pos === "bot"
            ? `\\underline{${expression}}`
            : `\\overline{${expression}}`;
    });

    function safeReplace(pattern, handler) {
        return (full) => {
            if (/<m:d[\s>]/i.test(full)) return full;
            return handler(full);
        };
    }

    text = text.replace(/<m:m>[\s\S]*?<\/m:m>/gi, (full) => {
        if (/\\begin{cases}/.test(full)) return full;

        const rows = extractAllContents(full, 'm:mtr').map(row => {
            const cells = extractAllContents(row, 'm:mtd').map(cell =>
                parseInner(cell)
            ).filter(cell => cell !== '');
            return cells.join(" & ");
        }).filter(row => row !== '');

        return rows.length > 0 ? `\\begin{matrix} ${rows.join(" \\\\ ")} \\end{matrix}` : '';
    });

    text = text.replace(/<m:sSubSup>[\s\S]*?<\/m:sSubSup>/gi, safeReplace(/<m:sSubSup>/, (full) => {
        const base = parseInner(extractContent(full, 'm:e'));
        const sub = parseInner(extractContent(full, 'm:sub'));
        const sup = parseInner(extractContent(full, 'm:sup'));
        return `${base}_{${sub}}^{${sup}}`;
    }));

    text = text.replace(/<m:f>[\s\S]*?<\/m:f>/gi, safeReplace(/<m:f>/, (full) => {
        const num = extractContent(full, 'm:num');
        const den = extractContent(full, 'm:den');
        const noBar = /type="noBar"/i.test(full);

        if (num && den) {
            const numerator = parseInner(num);
            const denominator = parseInner(den);
            return noBar
                ? `\\binom{${numerator}}{${denominator}}`
                : `\\frac{${numerator}}{${denominator}}`;
        }
        return parseInner(full);
    }));
    text = text.replace(/log\s*\(log\)/g, 'log');
    text = text.replace(/\\log\s*\(\\log\)/g, '\\log');

    text = text
        .replace(/→\s*([A-Za-zΑ-Ωα-ω]{1,3})/g, (_, n) => `\\vec{${n}}`)
        .replace(/([A-Za-zΑ-Ωα-ω]{1,3})⃗/g, (_, n) => `\\vec{${n}}`)
        .replace(/\(([A-ZΑ-Ω]{1,2})\)/g, (_, n) => `\\vec{${n}}`)
        .replace(/([fg])\\?x/g, (_, func) => `${func}(x)`);

    text = text.replace(/<\/?[\w:\-]+[^>]*>/g, "");
    text = decodeEntities(text);

    text = text
        .replace(/\s+/g, " ")
        .trim()
        .replace(/R\\\\/g, 'R\\backslash \\')
        .replace(/\\left\(\s*\\left\(([\s\S]*?)\\right\)\s*\\right\)/g, '\\left($1\\right)')
        .replace(/\s*\\\\(\s*)/g, ' \\\\ ')
        .replace(/\s*&\s*/g, ' & ')
        .replace(/\s+/g, ' ');

    return text;
}
function prepareDocxWithMath(filePath) {
    const zip = new AdmZip(filePath);
    const entry = zip.getEntry("word/document.xml");
    if (!entry) return { tempPath: filePath, mathMap: {} };

    let xml = entry.getData().toString("utf8");
    let mathMap = {};
    let counter = 0;

    const regex = /<(m:oMath|m:oMathPara)[\s\S]*?<\/\1>/g;

    xml = xml.replace(regex, (match) => {
        const placeholder = `__MATH_${++counter}__`;

        try {
            let mathML = omml2mathml(match);
            if (mathML && mathML.trim() !== "null") {
                mathMap[placeholder] = `<span class="math">${mathML} </span>`;
            } else {
                const plain = extractPlainMath(match);
                if (plain) {
                    mathMap[placeholder] = `<span class="math">${plain} </span>`;
                } else {
                    mathMap[
                        placeholder
                    ] = `<span class="math-missing">[Công thức không hỗ trợ]</span>`;
                }
            }
            return `<w:r><w:t>${placeholder}</w:t></w:r>`;
        } catch (err) {
            console.error("OMML convert error:", err.message);
            const plain = extractPlainMath(match);
            mathMap[placeholder] = plain
                ? `<span class="math">${plain} </span>`
                : `<span class="math-missing">[Công thức lỗi]</span>`;
            return `<w:r><w:t>${placeholder}</w:t></w:r>`;
        }
    });

    const tempZip = new AdmZip(filePath);
    tempZip.updateFile("word/document.xml", Buffer.from(xml, "utf8"));
    const tempPath = filePath.replace(/\.docx$/, ".math.docx");
    tempZip.writeZip(tempPath);

    return { tempPath, mathMap, xml };
}
function parseQuestionText(htmlContent, text) {
    const regex = REGEX.question;
    console.log('Parsing question text:', text);
    const match = text.match(regex);
    if (match) {
        return {
            number: parseInt(match[2], 10),
            rawHtml: htmlContent.replace(regex, "").trim(),
            plainText: text.replace(regex, "").trim(),
        };
    }
    console.log('No question number found in text:', parseInt(match[2], 10));
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
function parseCorrectAnswer(text) {
    let raw = (text || "").trim();
    let parts = raw
        .split(/\s*\|\s*|\s*;\s*|\/|\s*-\s*/g)
        .map((ans) => ans.trim())
        .filter(Boolean);

    let results = [];
    for (let ans of parts) {
        let clean = ans.replace(/^(chọn|đáp án|answer)[:\s]*/i, "").trim();

        // A. Đúng / A) Sai
        let match = clean.match(/^([a-dA-D])[\)]\s*(đúng|sai|true|false)$/i);
        if (match) {
            results.push({
                label: match[1].toUpperCase(),
                value:
                    match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase(),
                rawHtml: ans,
            });
            continue;
        }

        // A. / B) / C
        match = clean.match(/^([a-dA-D])\)\s*(.*)$/);
        if (match) {
            results.push({
                label: match[1].toUpperCase(),
                value: match[2]?.trim() || match[1].toUpperCase(),
                rawHtml: ans,
            });
            continue;
        }

        // Đúng / Sai
        if (/^(đúng|sai|true|false)$/i.test(clean)) {
            results.push({
                label: "",
                value: clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase(),
                rawHtml: ans,
            });
        } else {
            results.push({ label: "", value: clean, rawHtml: ans });
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
    const tempHtml = innerHtml.replace(/<span[^>]*class=(["'])math\1[^>]*>[\s\S]*?<\/span>/gi, (m) => {
        mathPlaceholders.push(m);
        return `__MATH_PLACEHOLDER_${mathPlaceholders.length - 1}__`;
    });

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
        let lines = innerHtml.split(/<br\s*\/?>|\n/).map(l => l.trim()).filter(Boolean);
        lines = lines.map(l => l.replace(/<\/?p>/gi, "").trim()).filter(Boolean);
        lines.forEach(line => {
            const m = line.match(/^([A-Da-d])[\)]\s*(.+)$/i);
            if (m) {
                const label = m[1].toUpperCase();
                const choiceText = m[2].trim();
                if (/^(đúng|sai|true|false)/i.test(choiceText)) {
                    question.explanation = (question.explanation || "") + `${label}) ${choiceText}\n`;
                } else {
                    question.choices.push({
                        label,
                        text: choiceText,
                        rawHtml: `<p>${removePrefix(line)}</p>`
                    });
                }
            }
        });
        return;
    }
    for (let i = 0; i < candidates.length; i++) {
        const start = candidates[i].index;
        const end = (i + 1 < candidates.length) ? candidates[i + 1].index : tempHtml.length;
        let seg = tempHtml.slice(start, end);

        seg = seg.replace(/__MATH_PLACEHOLDER_(\d+)__/g, (_, n) => mathPlaceholders[Number(n)] || "");

        const seg$ = cheerio.load('<div>' + seg + '</div>');
        const segText = seg$('div').text().trim();

        const labelMatch = segText.match(/^\s*([A-Da-d])[\)]\s*/i);
        if (!labelMatch) continue;
        const label = labelMatch[1].toUpperCase();
        const choiceText = segText.replace(/^\s*[A-Da-d][\)]\s*/i, "").trim();

        let cleanedRawHtml = seg.replace(/^\s*[A-Da-d][\)]\s*/i, "").trim();
        cleanedRawHtml = cleanedRawHtml
            .replace(/^\s*<[^>]{1,40}>\s*[A-Da-d][\)]\s*<\/[^>]{1,40}>/i, "")
            .replace(/<\/?p[^>]*>/gi, "")
            .trim();

        if (/^(đúng|sai|true|false)/i.test(choiceText)) {
            question.explanation = (question.explanation || "") + `${label}) ${choiceText}\n`;
        } else {
            question.choices.push({
                label,
                text: cleanedRawHtml,
                rawHtml: cleanedRawHtml
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
    // if (answer.length === 0 && correctAnswers.length === 0 && question.type !== "cluster") {
    //     return response(res, null, 'File lỗi, vui lòng kiểm tra lại thông tin các lỗi thường gặp trong tài liệu', statusCode.ERROR);
    // }
    if (correctAnswers.some((v) => ["Đúng", "Sai", "True", "False", "Đ", "S", "T", "F"].includes(v))) {
        return correctAnswers.length > 1 ? "truefalsemulti" : "truefalse";
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

                const name = item.plainText?.trim() || '';
                parts.push({
                    name,
                    time: 0,
                    score: 0,
                    type: "MAC_DINH",
                    totalquestions: 0,
                    subpart: [],
                });
            }
            else if (item.__partType === "subpart_mac_dinh" || item.__partType === "subpart_nhom_chu_de") {
                let currentPart = parts[parts.length - 1];
                if (!currentPart) continue;

                if (!currentPart.subpart) currentPart.subpart = [];

                if (item.__partType === "subpart_nhom_chu_de") {
                    currentPart.type = "NHOM_CHU_DE";
                }

                const name = removeBracketAndHash(item.plainText)?.trim() || '';
                const isFirstPart = (partIndex === 1);
                const isFirstSubpart = (currentPart.subpart.length === 0);

                currentPart.subpart.push({
                    name,
                    children: [],
                    isMain: isFirstPart && isFirstSubpart && !name,
                });
            }
            else if (item.__partType === "children") {
                subjectIndex++;
                let currentPart = parts[parts.length - 1];
                if (!currentPart) continue;

                if (!currentPart.subpart) currentPart.subpart = [];

                let lastSubpart = currentPart.subpart[currentPart.subpart.length - 1];
                if (!lastSubpart) {
                    const isFirstPart = (partIndex === 1);
                    lastSubpart = {
                        name: "Subpart " + subjectIndex,
                        children: [],
                        isMain: isFirstPart && currentPart.subpart.length === 0,
                    };
                    currentPart.subpart.push(lastSubpart);
                }

                let subjectID = "";
                if (!lastSubpart.children) lastSubpart.children = [];

                if (currentPart.type === "NHOM_CHU_DE") {
                    lastSubpart.children.push({
                        name: removeBracketAndHash(item.plainText),
                        subject_id: subjectID,
                        questions: []
                    });
                }
            }
        } else {
            let currentPart = parts[parts.length - 1];
            if (!currentPart) {
                parts.push({
                    name: 'Phần ' + (partIndex + 1),
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
                const isFirstPart = (partIndex === 0 || partIndex === 1);
                lastSubpart = {
                    name: 'SubPart 1',
                    children: [],
                    isMain: isFirstPart && currentPart.subpart.length === 0,
                };
                currentPart.subpart.push(lastSubpart);
            }

            let lastChild;
            if (!lastSubpart.children || lastSubpart.children.length === 0) {
                lastChild = {
                    name: 'Children 1',
                    questions: []
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

    return parts;
}
function mergeFollowingParagraphs($, $li, rawHtml) {
    let htmlContent = rawHtml;
    let $next = $li.next();
    if (!$next || !$next.length) {
        $next = $li.parent().next();
    }

    while ($next && ($next.is("p") || $next.is("img"))) {
        const nextText = $next.text().trim();
        if (
            /^lời giải/i.test(nextText) ||
            /^[A-Da-d][\)]/.test(nextText) ||
            /các lựa chọn kéo/i.test(nextText)
        ) {
            break;
        }
        htmlContent = htmlContent.replace(
            /<\/li>$/,
            "<br/>" + $next.html() + "</li>"
        );
        const temp = $next.next();
        $next.remove();
        $next = temp;
    }

    return htmlContent;
}
class DocxQuestionController {
    uploadMiddleware() {
        return upload.single("docxFile");
    }

    async uploadDocx(req, res) {
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: "Không có file được upload" });

        try {
            const { tempPath, mathMap, xml } = await prepareDocxWithMath(file.path);

            const result = await mammoth.convertToHtml({
                path: tempPath,
                convertImage: mammoth.images.inline(async (element) => {
                    const buffer = await element.read();
                    return {
                        src: `data:${element.contentType};base64,${buffer.toString(
                            "base64"
                        )}`,
                    };
                }),
            });

            let rawHtml = result?.value || "";

            for (let key in mathMap) {
                rawHtml = rawHtml.replace(new RegExp(key, "g"), mathMap[key]);
            }

            const $ = cheerio.load(rawHtml);
            const exam = [];
            let currentPart = null;
            let currentQuestion = null;
            let currentCluster = null;
            let mode = null;
            let qCounter = 0;

            $("p, h1, h2, h3, h4, h5, h6, li, img, a").each((_, el) => {
                const tag = el.tagName.toLowerCase();
                const text = $(el).text().trim();
                let rawHtml = $.html(el).replace(/<\/?strong[^>]*>/g, "") || "";
                rawHtml = rawHtml
                    .replace(/([0-9A-Za-z\.\,\\\)\]\}\(\[\-]+)\s*<sup>([\s\S]*?)<\/sup>/gi, (_, base, sup) =>
                        `<span class="math">${base}^{${sup.trim().replace(/\./g, '')}} </span>`
                    )
                    .replace(/([0-9A-Za-z\.\,\\\)\]\}\(\[\{\-]+)\s*<sub>([\s\S]*?)<\/sub>/gi, (_, base, sub) =>
                        `<span class="math">${base}_{${sub.trim().replace(/\./g, '')}} </span>`
                    );
                // Bỏ qua phần tử đã được xử lý
                if ($(el).data('processed')) return;

                if (!text && tag !== "img" && tag !== "a") return;
                let href = "";
                if (tag === "a") {
                    href = $(el).attr("href") || "";
                }

                // ----- Video -----
                if (REGEX.video.test(text)) {
                    mode = "video";
                    if (tag === "p") {
                        const $el = $(el);
                        const linkEl = $el.find("a");
                        let linkHref = "";
                        if (linkEl && linkEl.length) {
                            linkHref = linkEl.attr("href");
                        } else {
                            linkHref = text.replace(REGEX.video, "").trim();
                        }
                        if (currentQuestion) {
                            currentQuestion.video = linkHref
                        }
                    }
                }
                // ----- Part -----

                if (REGEX.part.test(text) || $(el).is("h2")) {
                    currentPart = { plainText: text, __isPart: true, __partType: "part" };
                    exam.push(currentPart);
                    currentCluster = null;
                    currentQuestion = null;
                    return;
                }
                if (REGEX.subpartTitle.test(text)) {
                    currentPart = { plainText: text, __isPart: true, __partType: "subpart_mac_dinh" };
                    exam.push(currentPart);
                    currentCluster = null;
                    currentQuestion = null;
                    return;
                }
                if (REGEX.groupTitle.test(text)) {
                    currentPart = { plainText: text, __isPart: true, __partType: "subpart_nhom_chu_de" };
                    exam.push(currentPart);
                    currentCluster = null;
                    currentQuestion = null;
                    return;
                }
                if (REGEX.subjectTitle.test(text)) {
                    currentPart = { plainText: text, __isPart: true, __partType: "children" };
                    exam.push(currentPart);
                    currentCluster = null;
                    currentQuestion = null;
                    return;
                }
                // --- Cluster ---

                if (REGEX.cluster.test(text)) {
                    qCounter++;

                    let htmlContent = rawHtml;
                    let $next = $(el).next();

                    while ($next && $next.length) {
                        const nextText = $next.text().trim();
                        const nextTag = $next.prop("tagName")?.toLowerCase();

                        // Dừng lại khi gặp câu hỏi
                        if (
                            nextTag === "li" ||
                            nextTag === "ol" ||
                            nextTag === "ul" ||
                            REGEX.question.test(nextText) ||
                            REGEX.cluster.test(nextText)
                        ) {
                            // Đánh dấu phần tử dừng để không xử lý lại
                            if (REGEX.cluster.test(nextText) && (nextTag === "p" || nextTag === "em")) {
                                $next.data('processed', true);
                            }
                            break;
                        }

                        // Ghép thẻ <p> hoặc <em> vào nội dung
                        if (nextTag === "p" || nextTag === "em") {
                            htmlContent += "<br/>" + $next.html();
                            $next.data('processed', true); // Đánh dấu đã xử lý
                        }

                        // Tiếp tục đọc nếu là thẻ <br>
                        if (nextTag === "br") {
                            htmlContent += "<br/>";
                            $next.data('processed', true); // Đánh dấu đã xử lý
                        }

                        const temp = $next.next();
                        $next = temp;
                    }

                    // Đánh dấu phần tử cluster gốc đã xử lý
                    $(el).data('processed', true);

                    currentCluster = {
                        questionId: qCounter.toString(),
                        rawHtml: htmlContent,
                        plainText: text,
                        type: "cluster",
                        choices: [],
                        dragDropOptions: [],
                        correctAnswers: [],
                        explanation: "",
                        leadText: "",
                        leadHtml: "",
                        subject: "",
                        cluster: [],
                        deleted_at: null,
                        level: "THONG_THUONG",
                        parentId: null,
                    };
                    exam.push(currentCluster);
                    mode = "question";
                    return;
                }

                // --- Question ---

                if (tag === "li") {
                    qCounter++;
                    let htmlContent = rawHtml;
                    let plainContent = text;
                    const $li = $(el);
                    htmlContent = mergeFollowingParagraphs($, $li, htmlContent);

                    currentQuestion = {
                        questionId: qCounter.toString(),
                        rawHtml: htmlContent,
                        plainText: plainContent,
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
                        parentId: currentCluster ? currentCluster.questionId : null,
                    };

                    const diff = detectDifficulty(text);
                    if (diff) {
                        currentQuestion.level = diff.code;
                        currentQuestion.plainText = diff.text;
                        currentQuestion.rawHtml = htmlContent
                            .replace(/\((NB|TH|VD|VDC)\)/i, "")
                            .trim();
                    }

                    exam.push(currentQuestion);
                    mode = "question";
                    return;
                }

                if (REGEX.question.test(text)) {
                    qCounter++;

                    const $li = $(el);
                    let htmlContent = mergeFollowingParagraphs($, $li, rawHtml);
                    console.log('Question HTML content:', htmlContent);
                    const parsed = parseQuestionText(htmlContent, text);

                    currentQuestion = {
                        questionId: qCounter.toString(),
                        rawHtml: parsed.rawHtml,
                        plainText: parsed.plainText,
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
                        parentId: currentCluster ? currentCluster.questionId : null,
                    };

                    const diff = detectDifficulty(text);
                    if (diff) {
                        currentQuestion.level = diff.code;
                        currentQuestion.plainText = diff.text;
                        currentQuestion.rawHtml = parsed.rawHtml.replace(/\((NB|TH|VD|VDC)\)/i, "").trim();
                    }

                    exam.push(currentQuestion);
                    mode = "question";
                    return;
                }

                if (REGEX.drag.test(text) && currentQuestion) {
                    const dragText = text.split(":")[1]?.trim() || "";
                    if (dragText) {
                        currentQuestion.dragDropOptions = dragText
                            .split(/[-]/)
                            .map((i) => i.trim())
                            .filter(Boolean);
                    }
                    mode = "choice";
                    return;
                }

                if (REGEX.choice.test(text) && currentQuestion) {
                    addChoice(currentQuestion, text, rawHtml);
                    mode = "choice";
                    return;
                }

                if (REGEX.explanation.test(text)) {
                    mode = "explanation";

                    const cleaned = rawHtml.replace(REGEX.explanation, "").trim();
                    // currentQuestion.explanation += cleaned + "\n";

                    let next = $(el).next();
                    while (next.length) {
                        const tag = next.prop("tagName")?.toLowerCase();
                        if (
                            tag === "video" ||
                            next.find("video").length > 0 ||
                            next.text().includes("youtube.com") ||
                            next.text().includes("Video:") ||
                            next.text().includes("video:") || REGEX.question.test(text) || REGEX.part.test(text) || tag === "li" || tag === "ol"
                        ) {
                            break;
                        }

                        if (tag === "p") {
                            currentQuestion.explanation += next.html().trim() + "\n";
                        }

                        next = next.next();
                    }

                    return;
                }



                if (REGEX.video.test(text)) {
                    mode = "video";
                    return;
                }
                if (REGEX.correct.test(text) && currentQuestion) {
                    const rawAnswer = text.split(":")[1]?.trim() || "";
                    currentQuestion.correctAnswers = parseCorrectAnswer(rawAnswer);
                    currentQuestion.type = detectQuestionType(currentQuestion);
                    return;
                }

                if (!currentQuestion) return;

            });

            exam.forEach((item) => {
                if (!item.__isPart && item.type === "unknown") {
                    item.type = detectQuestionType(item);
                }
            });

            const parts = transformToExamWord(exam);

            return res.json({
                xml : xml,
                rawHtml: rawHtml,
                parts: parts,
            });
        } catch (err) {
            console.log(err)
            return response(res, null, 'File lỗi, vui lòng kiểm tra lại thông tin các lỗi thường gặp trong tài liệu', statusCode.ERROR);
        }
    }
}
module.exports = new DocxQuestionController();