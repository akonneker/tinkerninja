import { PageLink as Link } from '@/components/page-link';
import { ArrowUpRight } from 'lucide-react';
import { curveFamilies, namedCurve } from '@/lib/curve-families';
import { sampleCurve, svgPath } from '@/lib/curves';
export function FamilyShelf() {
  return (
    <section className="family-shelf" aria-labelledby="family-shelf-title">
      <div className="family-section-heading">
        <div>
          <span className="eyebrow">EXPLORE THE RELATIONSHIPS</span>
          <h2 id="family-shelf-title">Start with a family</h2>
        </div>
        <a href="#collection">Browse all named curves ↓</a>
      </div>
      <div className="family-shelf-grid">
        {curveFamilies.map((f) => (
          <Link
            className="family-shelf-card"
            key={f.id}
            href={`/families/${f.id}`}
          >
            <svg viewBox="0 0 300 300" aria-hidden="true">
              <path
                d={svgPath(sampleCurve(namedCurve(f.thumbnail), 1, 250, 3))}
              />
            </svg>
            <div>
              <h3>
                {f.title} <ArrowUpRight size={15} />
              </h3>
              <p>{f.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
