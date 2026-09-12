import { PageLink as Link } from '@/components/page-link';
import { ArrowUpRight } from 'lucide-react';
import { physicsPages } from '@/lib/physics';
export function PhysicsShelf() {
  return (
    <section className="physics-shelf" aria-labelledby="physics-title">
      <div className="family-section-heading">
        <div>
          <span className="eyebrow">LET PHYSICS DRAW THE CURVE</span>
          <h2 id="physics-title">Curves from forces & motion</h2>
        </div>
        <Link href="/physics">
          Explore physics <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="physics-shelf-grid">
        {physicsPages.map((p) => (
          <Link
            key={p.id}
            className="family-shelf-card"
            href={`/physics/${p.id}`}
          >
            <svg viewBox="0 0 100 65" aria-hidden="true">
              {p.id === 'catenary-parabola' ? (
                <>
                  <path d="M8 8 Q50 95 92 8" />
                  <path d="M8 8 C30 72 70 72 92 8" strokeDasharray="4 4" />
                </>
              ) : p.id === 'brachistochrone' ? (
                <>
                  <path d="M8 8 L92 50" strokeDasharray="4 4" />
                  <path d="M8 8 C8 58 50 70 92 50" />
                  <circle cx="31" cy="52" r="4" fill="#e87051" stroke="none" />
                </>
              ) : (
                <>
                  <path d="M8 55 Q45 -35 92 55" strokeDasharray="4 4" />
                  <path d="M8 55 Q35 -5 66 55" />
                  <path d="M6 58 L17 43 M3 55 L14 40" />
                </>
              )}
            </svg>
            <div>
              <h3>
                {p.title}
                <ArrowUpRight size={15} />
              </h3>
              <p>{p.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
