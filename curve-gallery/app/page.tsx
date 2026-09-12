'use client';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { PageLink as Link } from '@/components/page-link';
import {
  ArrowUpRight,
  BookOpen,
  MoveUpRight,
  Search,
  ArrowRight,
  X,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Explorer } from '@/components/curve-explorer';
import { PhysicsShelf } from '@/components/physics-shelf';
import { FamilyShelf } from '@/components/family-shelf';
import { curves, sampleCurve, svgPath } from '@/lib/curves';
import type { Curve } from '@/lib/curves';
const families = [
  'All curves',
  'Conics',
  'Algebraic',
  'Rolling curves',
  'Spirals',
  'Transcendental',
  'Fractals',
];
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
const thumbnails = new Map(
  curves.map((c) => [c.id, svgPath(sampleCurve(c, 1, 400, 3))]),
);
export default function Home() {
  const [selected, setSelected] = useState(curves[0]),
    [query, setQuery] = useState(''),
    [family, setFamily] = useState('All curves'),
    [mobileOpen, setMobileOpen] = useState(false),
    [about, setAbout] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const pop = () => {
      const c = curves.find(
        (c) =>
          c.id === new URLSearchParams(window.location.search).get('curve'),
      );
      setSelected(c ?? curves[0]);
      if (c && window.matchMedia('(max-width:780px)').matches)
        setMobileOpen(true);
    };
    const frame = requestAnimationFrame(pop);
    window.addEventListener('popstate', pop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('popstate', pop);
    };
  }, []);
  const shown = useMemo(
    () =>
      curves
        .filter(
          (c) =>
            (family === 'All curves' || c.family === family) &&
            normalize(`${c.name} ${c.aliases ?? ''} ${c.family}`).includes(
              normalize(query.trim()),
            ),
        )
        .sort(
          (a, b) => families.indexOf(a.family) - families.indexOf(b.family),
        ),
    [family, query],
  );
  function select(c: Curve) {
    setSelected(c);
    window.history.replaceState(null, '', `?curve=${c.id}`);
    panelRef.current?.scrollTo({ top: 0 });
    if (window.matchMedia('(max-width:780px)').matches) setMobileOpen(true);
  }
  return (
    <>
      <a href="#collection" className="skip-link">
        Skip to curve collection
      </a>
      <header className="masthead">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            ∿
          </span>
          THE CURVE ATLAS
        </Link>
        <span className="mast-note">A field guide to mathematical form</span>
        <a href="#references">
          The reference shelf <ArrowUpRight size={16} />
        </a>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <div className="eyebrow">MATHEMATICS, DRAWN OUT</div>
            <h1>
              Explore the collection<span>.</span>
            </h1>
            <p>
              From familiar forms to beautiful curiosities. Pick a curve and
              follow its path.
            </p>
          </div>
          <button className="edition" onClick={() => setAbout(true)}>
            {curves.length} CURVES · 7 EXPLORERS
            <br />
            <span>
              About this atlas <ArrowUpRight size={12} />
            </span>
          </button>
        </div>
        <FamilyShelf />
        <PhysicsShelf />
        <div className="atlas-layout">
          <section
            className="collection"
            id="collection"
            aria-label="Curve collection"
          >
            <div className="collection-tools">
              <label className="search">
                <Search size={18} />
                <input
                  type="search"
                  aria-label="Search curves by name or family"
                  placeholder="Find a curve by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <span aria-live="polite">
                {shown.length} of {curves.length}
              </span>
            </div>
            <Tabs
              value={family}
              onValueChange={(v) => setFamily(String(v))}
              className="family-filter"
            >
              <TabsList aria-label="Curve families" className="family-tabs">
                {families.map((f) => (
                  <TabsTrigger key={f} value={f}>
                    {f}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="collection-label">
              <span>
                {family === 'All curves'
                  ? 'THE COMPLETE COLLECTION'
                  : family.toUpperCase()}
              </span>
              <span>
                SELECT TO EXPLORE <ArrowRight size={12} />
              </span>
            </div>
            <div className="curve-grid">
              {shown.map((c, i) => (
                <Fragment key={c.id}>
                  {(i === 0 || c.family !== shown[i - 1].family) && (
                    <h2 className="curve-group-heading">{c.family}</h2>
                  )}
                  <button
                    key={c.id}
                    aria-pressed={selected.id === c.id}
                    aria-label={`Explore ${c.name}`}
                    className={`curve-card ${selected.id === c.id ? 'selected' : ''} family-${c.family.split(' ')[0].toLowerCase()}`}
                    onClick={() => select(c)}
                  >
                    <div className="card-top">
                      <span>
                        {String(curves.indexOf(c) + 1).padStart(2, '0')}
                      </span>
                      {selected.id === c.id ? (
                        <span className="selected-indicator">
                          VIEWING <span />
                        </span>
                      ) : (
                        <MoveUpRight size={16} />
                      )}
                    </div>
                    <svg viewBox="0 0 300 300" aria-hidden="true">
                      <path d={thumbnails.get(c.id)} />
                    </svg>
                    <div className="card-label">
                      <h2>{c.name}</h2>
                      <span>
                        {c.family}
                        {c.fractal ? ' · approximation' : ''}
                      </span>
                    </div>
                  </button>
                </Fragment>
              ))}
            </div>
            {shown.length === 0 && (
              <div className="no-results">
                <Search size={28} />
                <h2>No curves found</h2>
                <p>Try a different name or explore another family.</p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setQuery('');
                    setFamily('All curves');
                  }}
                >
                  Show all curves
                </button>
              </div>
            )}
            <p className="collection-footnote">
              64 starting points for exploration. Family labels are browsing
              categories; a curve can belong to more than one mathematical
              family.
            </p>
          </section>
          <aside
            ref={panelRef}
            className="explorer desktop-explorer"
            aria-label={`${selected.name} explorer`}
          >
            <Explorer key={selected.id} curve={selected} />
          </aside>
        </div>
        <footer id="references">
          <BookOpen size={25} />
          <div className="references-content">
            <h2>The reference shelf</h2>
            <div className="reference-books">
              <a
                href="https://archive.org/details/YatesHandbookCurves1947"
                target="_blank"
                rel="noreferrer"
              >
                <strong>A Handbook on Curves and Their Properties</strong>
                <span>
                  Robert C. Yates · 1947 <ArrowUpRight size={14} />
                </span>
              </a>
              <a
                href="https://doi.org/10.1007/978-1-4612-0871-6"
                target="_blank"
                rel="noreferrer"
              >
                <strong>Space-Filling Curves</strong>
                <span>
                  Hans Sagan · 1994 <ArrowUpRight size={14} />
                </span>
              </a>
            </div>
            <p>
              Start with Yates and Sagan, then explore curve catalogs by
              Lockwood and Lawrence, histories of geometry and calculus, and
              mathematical biographies.
            </p>
            <Link href="/references" className="reference-shelf-link">
              Browse all 9 references & reading notes <ArrowRight size={15} />
            </Link>
          </div>
          <button
            className="text-button about-link"
            onClick={() => setAbout(true)}
          >
            About the atlas <ArrowRight size={15} />
          </button>
        </footer>
      </main>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent className="mobile-sheet" showCloseButton={false}>
          <SheetTitle className="sr-only">{selected.name} explorer</SheetTitle>
          <SheetDescription className="sr-only">
            Trace the curve, read coordinates, and explore its history and
            equation.
          </SheetDescription>
          <div className="explorer sheet-explorer">
            <button
              className="secondary-button sheet-back"
              onClick={() => setMobileOpen(false)}
            >
              <X size={17} />
              Back to collection
            </button>
            <Explorer key={selected.id} curve={selected} />
          </div>
        </SheetContent>
      </Sheet>
      <Dialog open={about} onOpenChange={setAbout}>
        <DialogContent className="about-dialog">
          <DialogTitle className="about-title">
            A growing atlas of curves
          </DialogTitle>
          <DialogDescription>
            64 interactive entries across six browsing families.
          </DialogDescription>
          <p>
            This edition brings together the principal named plane curves in
            Yates’s handbook, selected related curves, and finite constructions
            inspired by Sagan’s treatment of space-filling curves. It is a
            substantial starting collection, not an exhaustive list of every
            named curve.
          </p>
          <p>
            Each drawing is computed from a formula or recursive construction.
            Families with free parameters are represented by a stated example.
            Infinite curves are shown over finite ranges; fractals are shown at
            finite order. The x and y axes always use the same scale.
          </p>
          <p>
            Historical notes are concise paraphrases with references for further
            reading. “Uses & connections” includes both practical applications
            and mathematical examples. The supplied books are reference material
            and are not redistributed here.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
