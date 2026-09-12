export type Reference = {
  id: string;
  title: string;
  author: string;
  year: string;
  url: string;
  access: string;
  category: 'Curve catalogs' | 'Histories & context' | 'Online companions';
  note: string;
};
export const references: Reference[] = [
  {
    id: 'yates',
    title: 'A Handbook on Curves and Their Properties',
    author: 'Robert C. Yates',
    year: '1947',
    url: 'https://archive.org/details/YatesHandbookCurves1947',
    access: 'Digitized text & OCR',
    category: 'Curve catalogs',
    note: 'The atlas’s starting handbook: named plane curves, constructions, equations, and short historical notes. Individual entries retain their Yates page references.',
  },
  {
    id: 'sagan',
    title: 'Space-Filling Curves',
    author: 'Hans Sagan',
    year: '1994',
    url: 'https://doi.org/10.1007/978-1-4612-0871-6',
    access: 'Publisher / institutional access',
    category: 'Curve catalogs',
    note: 'A detailed mathematical companion to the recursive gallery, including Peano, Hilbert, Moore, Sierpiński–Knopp, Lebesgue, and the Cantor function.',
  },
  {
    id: 'lockwood',
    title: 'A Book of Curves',
    author: 'E. H. Lockwood',
    year: '1961',
    url: 'https://www.cambridge.org/core/books/book-of-curves/F08B52C8FB0563B2F9866DA186FC87F1',
    access: 'Contents / publisher access',
    category: 'Curve catalogs',
    note: 'Geometric constructions and envelopes bring the drawings to life. Dedicated chapters cover conics, cardioids, limaçons, astroids, nephroids, deltoids, cycloids, strophoids, logarithmic spirals, lemniscates, tractrices, and catenaries.',
  },
  {
    id: 'lawrence',
    title: 'A Catalog of Special Plane Curves',
    author: 'J. Dennis Lawrence',
    year: '1972',
    url: 'https://books.google.com/books?id=4rtEAgAAQBAJ',
    access: 'Google Books preview',
    category: 'Curve catalogs',
    note: 'A second curve-by-curve reference for equations, tangents, curvature, and related constructions. Useful alongside Yates when comparing algebraic curves, roulettes, and spirals.',
  },
  {
    id: 'coolidge',
    title: 'A History of the Conic Sections and Quadric Surfaces',
    author: 'Julian Lowell Coolidge',
    year: '1945 · Dover reprint 1968',
    url: 'https://openlibrary.org/books/OL5604851M/A_history_of_the_conic_sections_and_quadric_surfaces.',
    access: 'Library record / locate a copy',
    category: 'Histories & context',
    note: 'A specialist history for the conic family, following the study of conic sections and its extension to surfaces. A useful next step beyond the short stories attached to the ellipse, parabola, and hyperbola.',
  },
  {
    id: 'stillwell',
    title: 'Mathematics and Its History',
    author: 'John Stillwell',
    year: '2010 · third edition',
    url: 'https://link.springer.com/book/10.1007/978-1-4419-6053-5',
    access: 'Contents / chapter previews',
    category: 'Histories & context',
    note: 'Connects curves to larger mathematical ideas. Start with Greek Geometry, Analytic Geometry, Calculus, Elliptic Functions, or Mechanics; Sets, Logic, and Computation supplies broader context for infinity.',
  },
  {
    id: 'hairer-wanner',
    title: 'Analysis by Its History',
    author: 'Ernst Hairer & Gerhard Wanner',
    year: '1996',
    url: 'https://archive-ouverte.unige.ch/unige:12341',
    access: 'University record / extract',
    category: 'Histories & context',
    note: 'Explains how practical calculations developed into series, calculus, and differential equations. Read it for the methods behind areas, tangents, lengths, and motion, rather than as a dictionary of named curves.',
  },
  {
    id: 'cajori',
    title: 'A History of Mathematics',
    author: 'Florian Cajori',
    year: '1893 · digitized 1909 printing',
    url: 'https://www.gutenberg.org/ebooks/31061',
    access: 'Free full text · PDF & TeX',
    category: 'Histories & context',
    note: 'A freely readable historical account of Greek constructions and early calculus, including the cycloid, catenary, and brachistochrone. Its nineteenth-century perspective is best compared with modern historical scholarship.',
  },
  {
    id: 'mactutor',
    title: 'Famous Curves & mathematical biographies',
    author: 'MacTutor · University of St Andrews',
    year: 'Online collection',
    url: 'https://mathshistory.st-andrews.ac.uk/Curves/',
    access: 'Free online reference',
    category: 'Online companions',
    note: 'Short curve histories, equations, and links to biographies. A convenient route from an unfamiliar curve name to the people, problems, and publications behind it.',
  },
];
export const referenceById = Object.fromEntries(
  references.map((r) => [r.id, r]),
);
export type Reading = { id: string; note: string };
const readings: Record<string, Reading[]> = {};
function attach(ids: string, reading: Reading) {
  for (const id of ids.split(' ')) (readings[id] ??= []).push(reading);
}
const lockwoodChapters: Record<string, string> = {
  parabola: '1 · The Parabola',
  ellipse: '2 · The Ellipse',
  hyperbola: '3 · The Hyperbola',
  'rectangular-hyperbola': '3 · The Hyperbola',
  cardioid: '4 · The Cardioid',
  limacon: '5 · The Limacon',
  astroid: '6 · The Astroid',
  nephroid: '7 · The Nephroid',
  deltoid: '8 · The Deltoid',
  cycloid: '9 · The Cycloid',
  strophoid: '10 · The Right Strophoid',
  'log-spiral': '11 · The Equiangular Spiral',
  lemniscate: '12 · The Lemniscate of Bernoulli',
  tractrix: '13 · The Tractrix and Catenary',
  catenary: '13 · The Tractrix and Catenary',
};
for (const [id, chapter] of Object.entries(lockwoodChapters))
  attach(id, {
    id: 'lockwood',
    note: `Chapter ${chapter}. Geometric constructions and relationships.`,
  });
attach(
  'folium cissoid conchoid cubic semicubical trisectrix tschirnhausen rose quadrifolium epicycloid hypocycloid epitrochoid hypotrochoid trochoid involute cayley',
  {
    id: 'lawrence',
    note: 'Companion catalog: equations and the geometry of related plane curves.',
  },
);
attach(
  'circle ellipse parabola hyperbola rectangular-hyperbola family-conics',
  {
    id: 'coolidge',
    note: 'Historical context for conic sections and their development.',
  },
);
attach('spiral cissoid conchoid kampyle', {
  id: 'cajori',
  note: 'Greek geometry: constructions beyond straightedge and compass.',
});
attach('cycloid catenary physics-brachistochrone physics-catenary-parabola', {
  id: 'cajori',
  note: '“Newton to Euler”: the Bernoullis and the curve problems of early calculus.',
});
attach('lemniscate', {
  id: 'stillwell',
  note: 'Broader context: the chapter on Elliptic Functions.',
});
attach('folium cubic family-conics', {
  id: 'stillwell',
  note: 'Broader context: Analytic Geometry connects algebra and geometric loci.',
});
attach('cycloid involute physics-brachistochrone physics-ballistics', {
  id: 'stillwell',
  note: 'Broader context: the Mechanics chapter connects geometry and motion.',
});
attach(
  'sine cosine tangent exponential logarithm pursuit clothoid physics-ballistics physics-catenary-parabola',
  {
    id: 'hairer-wanner',
    note: 'Background methods: calculus, series, and differential equations.',
  },
);
attach('family-rolling family-limacons family-spirals', {
  id: 'lockwood',
  note: 'Constructions of cycloidal curves, spirals, and related families.',
});
attach('family-roses family-lissajous', {
  id: 'mactutor',
  note: 'Browse the curve histories and their linked biographies.',
});
attach(
  'hilbert peano moore sierpinski-knopp koch koch-snowflake cantor lebesgue family-fractals',
  {
    id: 'stillwell',
    note: 'Broader context: Sets, Logic, and Computation traces the mathematics of infinity.',
  },
);
export function readingForCurve(id: string): Reading[] {
  return readings[id] ?? [];
}
