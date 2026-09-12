import { useEffect, useMemo, useRef, useState } from 'react';

type Renderer = typeof import('@/lib/math-renderer');
let rendererPromise: Promise<Renderer> | undefined;

export function MathEquation({
  tex,
  fallback,
  className = 'equation',
}: {
  tex: string;
  fallback: string;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [renderer, setRenderer] = useState<Renderer | null>(null);
  useEffect(() => {
    let active = true;
    const load = () => {
      rendererPromise ??= import('@/lib/math-renderer');
      void rendererPromise.then(
        (module) => {
          if (active) setRenderer(module);
        },
        () => {
          rendererPromise = undefined;
        },
      );
    };
    if (!('IntersectionObserver' in window)) {
      load();
      return () => {
        active = false;
      };
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    });
    if (container.current) observer.observe(container.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);
  const html = useMemo(() => {
    if (!renderer) return null;
    try {
      return renderer.renderMath(tex);
    } catch {
      return null;
    }
  }, [renderer, tex]);
  return (
    <div ref={container} className={`${className} math-equation`}>
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : fallback}
    </div>
  );
}
