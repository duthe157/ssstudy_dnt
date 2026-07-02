declare module "katex/contrib/auto-render" {
  export interface RenderMathInElementOptions {
    delimiters?: Array<{ left: string; right: string; display: boolean }>;
    ignoredTags?: string[];
    ignoredClasses?: string[];
    preProcess?: (math: string) => string;
    errorCallback?: (msg: string, err: Error) => void;
    throwOnError?: boolean;
    strict?: boolean | string | Function;
    trust?: boolean | Function;
    macros?: any;
    displayMode?: boolean;
    colorIsTextColor?: boolean;
    errorColor?: string;
    maxSize?: number;
    maxExpand?: number;
  }

  export default function renderMathInElement(
    element: HTMLElement,
    options?: RenderMathInElementOptions
  ): void;
}
