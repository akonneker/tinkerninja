import { renderToString } from 'katex';
import 'katex/dist/katex.min.css';

export function renderMath(tex: string): string {
  return renderToString(tex, {
    displayMode: true,
    output: 'htmlAndMathml',
    throwOnError: true,
    strict: 'error',
    trust: false,
  });
}
