import { Fragment } from 'react';
import { splitMathText } from '@/lib/prose-math';
import { MathEquation } from '@/components/math-equation';

export function MathText({ children }: { children: string }) {
  return (
    <>
      {splitMathText(children).map((part, i) =>
        typeof part === 'string' ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <MathEquation key={i} inline tex={part.tex} fallback={part.text} />
        ),
      )}
    </>
  );
}
