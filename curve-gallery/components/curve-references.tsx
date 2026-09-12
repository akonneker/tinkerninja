import { PageLink as Link } from '@/components/page-link';
import { ArrowUpRight } from 'lucide-react';
import {
  people,
  peopleForCurve,
  wikipediaArticles,
} from '@/lib/reference-links';
import { readingForCurve, referenceById } from '@/lib/references';

export function CurveReferences({ id }: { id: string }) {
  const article = wikipediaArticles[id];
  const biographies = (peopleForCurve[id] ?? []).map((name) => people[name]);
  const reading = readingForCurve(id);
  return (
    <section
      className="curve-references"
      aria-label="Encyclopedia and further reading"
    >
      {article && (
        <div className="reference-group">
          <h3>On Wikipedia</h3>
          <a
            className="wiki-curve-link"
            href={article.url}
            target="_blank"
            rel="noreferrer"
          >
            {article.related ? 'Related: ' : ''}
            {article.title} <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      )}
      {biographies.length > 0 && (
        <div className="reference-group">
          <h3>People & history</h3>
          <p className="reference-caption">Biographies on Wikipedia</p>
          <div className="biography-links">
            {biographies.map((person) => (
              <a
                key={person.url}
                href={person.url}
                target="_blank"
                rel="noreferrer"
              >
                {person.name} <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      )}
      {reading.length > 0 && (
        <div className="reference-group">
          <h3>Read a little further</h3>
          <ul className="curve-reading-list">
            {reading.map(({ id: sourceId, note }) => {
              const source = referenceById[sourceId];
              return (
                <li key={sourceId}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                  <span>
                    {source.author} · {source.access}
                  </span>
                  <p>{note}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <Link className="reference-shelf-link" href="/references">
        Explore the full reference shelf →
      </Link>
    </section>
  );
}
