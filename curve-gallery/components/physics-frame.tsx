import type { ReactNode } from 'react';
import { PageLink as Link } from '@/components/page-link';
import { CurveReferences } from '@/components/curve-references';
import { physicsPages } from '@/lib/physics';
export function PhysicsFrame({
  active,
  children,
}: {
  active?: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="masthead">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ∿
          </span>
          THE CURVE ATLAS
        </Link>
        <Link href="/">← Named collection</Link>
      </header>
      <main>
        <nav className="family-navigation" aria-label="Physics explorers">
          <Link href="/physics" aria-current={!active ? 'page' : undefined}>
            Physics
          </Link>
          {physicsPages.map((p) => (
            <Link
              key={p.id}
              href={`/physics/${p.id}`}
              aria-current={active === p.id ? 'page' : undefined}
            >
              {p.title}
            </Link>
          ))}
        </nav>
        {children}
        {active && <CurveReferences id={`physics-${active}`} />}
      </main>
    </>
  );
}
