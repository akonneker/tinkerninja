import { renderToString } from 'katex';
import 'katex/dist/katex.min.css';

export function renderMath(tex: string, displayMode = true): string {
  return renderToString(tex, {
    displayMode,
    output: 'htmlAndMathml',
    throwOnError: true,
    strict: 'error',
    trust: false,
  });
}
