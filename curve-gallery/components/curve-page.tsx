import { PageLink as Link } from '@/components/page-link';
import { Explorer } from '@/components/curve-explorer';
import type { Curve } from '@/lib/curves';

export function CurvePage({ curve }: { curve: Curve }) {
  return (
    <>
      <a href="#curve" className="skip-link">
        Skip to curve explorer
      </a>
      <header className="masthead">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ∿
          </span>
          THE CURVE ATLAS
        </Link>
        <Link href="/#collection">← Back to collection</Link>
      </header>
      <main className="curve-page">
        <article
          id="curve"
          className="explorer curve-page-explorer"
          aria-label={curve.name}
        >
          <Explorer curve={curve} pageMode />
        </article>
      </main>
    </>
  );
}
