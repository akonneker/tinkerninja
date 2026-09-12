import { PageLink as Link } from '@/components/page-link';
import { ArrowUpRight } from 'lucide-react';
import { references } from '@/lib/references';
export const metadata = { title: 'The reference shelf · The Curve Atlas' };
export default function ReferencesPage() {
  return (
    <>
      <header className="masthead">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ∿
          </span>
          THE CURVE ATLAS
        </Link>
        <Link href="/">← Back to the curves</Link>
      </header>
      <main className="reference-library">
        <div className="reference-intro">
          <span className="eyebrow">BOOKS, PEOPLE & IDEAS</span>
          <h1>The reference shelf</h1>
          <p>
            Every curve has a story beyond its equation. These catalogs,
            histories, and online companions offer ways into the geometry, the
            original problems, and the people who studied them.
          </p>
          <p>
            Yates and Sagan are the atlas’s starting texts. The additional
            reading is annotated for its coverage; curve pages point to
            particular chapters or broader context. Access labels distinguish
            full text from previews and library records.
          </p>
        </div>
        {(
          [
            'Curve catalogs',
            'Histories & context',
            'Online companions',
          ] as const
        ).map((category) => (
          <section
            key={category}
            className="reference-category"
            aria-label={category}
          >
            <h2>{category}</h2>
            <div className="reference-card-grid">
              {references
                .filter((r) => r.category === category)
                .map((r) => (
                  <article id={r.id} className="reference-card" key={r.id}>
                    <span className="reference-access">{r.access}</span>
                    <h3>
                      <a href={r.url} target="_blank" rel="noreferrer">
                        {r.title} <ArrowUpRight size={17} aria-hidden="true" />
                      </a>
                    </h3>
                    <div className="reference-byline">
                      {r.author} · {r.year}
                    </div>
                    <p>{r.note}</p>
                  </article>
                ))}
            </div>
          </section>
        ))}
        <p className="reference-editorial-note">
          The atlas uses original summaries and computed drawings. Wikipedia
          links on curve pages lead to verified articles and biographies; a
          broader article is shown under its own title. Reading suggestions are
          starting points for exploration, not claims that every listed book
          covers every curve. Bibliography and article links checked September
          2026.
        </p>
      </main>
    </>
  );
}
