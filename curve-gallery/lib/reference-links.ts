// Article existence and redirects checked against English Wikipedia, September 2026.
// Broader articles are labeled with their own titles; related constructions are explicit.
export type WikiArticle = { title: string; url: string; related?: boolean };
export const wikipediaArticles: Record<string, WikiArticle> = {
  lemniscate: {
    title: 'Lemniscate of Bernoulli',
    url: 'https://en.wikipedia.org/wiki/Lemniscate_of_Bernoulli',
  },
  astroid: {
    title: 'Astroid',
    url: 'https://en.wikipedia.org/wiki/Astroid',
  },
  cardioid: {
    title: 'Cardioid',
    url: 'https://en.wikipedia.org/wiki/Cardioid',
  },
  spiral: {
    title: 'Archimedean spiral',
    url: 'https://en.wikipedia.org/wiki/Archimedean_spiral',
  },
  cycloid: {
    title: 'Cycloid',
    url: 'https://en.wikipedia.org/wiki/Cycloid',
  },
  catenary: {
    title: 'Catenary',
    url: 'https://en.wikipedia.org/wiki/Catenary',
  },
  circle: {
    title: 'Circle',
    url: 'https://en.wikipedia.org/wiki/Circle',
  },
  ellipse: {
    title: 'Ellipse',
    url: 'https://en.wikipedia.org/wiki/Ellipse',
  },
  parabola: {
    title: 'Parabola',
    url: 'https://en.wikipedia.org/wiki/Parabola',
  },
  hyperbola: {
    title: 'Hyperbola',
    url: 'https://en.wikipedia.org/wiki/Hyperbola',
  },
  'rectangular-hyperbola': {
    title: 'Hyperbola',
    url: 'https://en.wikipedia.org/wiki/Hyperbola',
  },
  deltoid: {
    title: 'Deltoid curve',
    url: 'https://en.wikipedia.org/wiki/Deltoid_curve',
  },
  nephroid: {
    title: 'Nephroid',
    url: 'https://en.wikipedia.org/wiki/Nephroid',
  },
  epicycloid: {
    title: 'Epicycloid',
    url: 'https://en.wikipedia.org/wiki/Epicycloid',
  },
  hypocycloid: {
    title: 'Hypocycloid',
    url: 'https://en.wikipedia.org/wiki/Hypocycloid',
  },
  epitrochoid: {
    title: 'Epitrochoid',
    url: 'https://en.wikipedia.org/wiki/Epitrochoid',
  },
  hypotrochoid: {
    title: 'Hypotrochoid',
    url: 'https://en.wikipedia.org/wiki/Hypotrochoid',
  },
  trochoid: {
    title: 'Trochoid',
    url: 'https://en.wikipedia.org/wiki/Trochoid',
  },
  limacon: {
    title: 'Limaçon',
    url: 'https://en.wikipedia.org/wiki/Lima%C3%A7on',
  },
  rose: {
    title: 'Rose (mathematics)',
    url: 'https://en.wikipedia.org/wiki/Rose_(mathematics)',
  },
  quadrifolium: {
    title: 'Quadrifolium',
    url: 'https://en.wikipedia.org/wiki/Quadrifolium',
  },
  lissajous: {
    title: 'Lissajous curve',
    url: 'https://en.wikipedia.org/wiki/Lissajous_curve',
  },
  folium: {
    title: 'Folium of Descartes',
    url: 'https://en.wikipedia.org/wiki/Folium_of_Descartes',
  },
  cissoid: {
    title: 'Cissoid of Diocles',
    url: 'https://en.wikipedia.org/wiki/Cissoid_of_Diocles',
  },
  conchoid: {
    title: 'Conchoid (mathematics)',
    url: 'https://en.wikipedia.org/wiki/Conchoid_(mathematics)',
  },
  strophoid: {
    title: 'Strophoid',
    url: 'https://en.wikipedia.org/wiki/Strophoid',
  },
  witch: {
    title: 'Witch of Agnesi',
    url: 'https://en.wikipedia.org/wiki/Witch_of_Agnesi',
  },
  cassini: {
    title: 'Cassini oval',
    url: 'https://en.wikipedia.org/wiki/Cassini_oval',
  },
  cubic: {
    title: 'Cubic function',
    url: 'https://en.wikipedia.org/wiki/Cubic_function',
  },
  semicubical: {
    title: 'Semicubical parabola',
    url: 'https://en.wikipedia.org/wiki/Semicubical_parabola',
  },
  serpentine: {
    title: 'Serpentine curve',
    url: 'https://en.wikipedia.org/wiki/Serpentine_curve',
  },
  trisectrix: {
    title: 'Trisectrix of Maclaurin',
    url: 'https://en.wikipedia.org/wiki/Trisectrix_of_Maclaurin',
  },
  tschirnhausen: {
    title: 'Tschirnhausen cubic',
    url: 'https://en.wikipedia.org/wiki/Tschirnhausen_cubic',
  },
  kampyle: {
    title: 'Kampyle of Eudoxus',
    url: 'https://en.wikipedia.org/wiki/Kampyle_of_Eudoxus',
  },
  kappa: {
    title: 'Kappa curve',
    url: 'https://en.wikipedia.org/wiki/Kappa_curve',
  },
  lame: {
    title: 'Superellipse',
    url: 'https://en.wikipedia.org/wiki/Superellipse',
  },
  'log-spiral': {
    title: 'Logarithmic spiral',
    url: 'https://en.wikipedia.org/wiki/Logarithmic_spiral',
  },
  fermat: {
    title: "Fermat's spiral",
    url: 'https://en.wikipedia.org/wiki/Fermat%27s_spiral',
  },
  'hyperbolic-spiral': {
    title: 'Hyperbolic spiral',
    url: 'https://en.wikipedia.org/wiki/Hyperbolic_spiral',
  },
  lituus: {
    title: 'Lituus (mathematics)',
    url: 'https://en.wikipedia.org/wiki/Lituus_(mathematics)',
  },
  involute: {
    title: 'Involute',
    url: 'https://en.wikipedia.org/wiki/Involute',
  },
  tractrix: {
    title: 'Tractrix',
    url: 'https://en.wikipedia.org/wiki/Tractrix',
  },
  sine: {
    title: 'Sine and cosine',
    url: 'https://en.wikipedia.org/wiki/Sine_and_cosine',
  },
  exponential: {
    title: 'Exponential function',
    url: 'https://en.wikipedia.org/wiki/Exponential_function',
  },
  logarithm: {
    title: 'Logarithm',
    url: 'https://en.wikipedia.org/wiki/Logarithm',
  },
  cayley: {
    title: "Cayley's sextic",
    url: 'https://en.wikipedia.org/wiki/Cayley%27s_sextic',
  },
  bicorn: {
    title: 'Bicorn',
    url: 'https://en.wikipedia.org/wiki/Bicorn',
  },
  pursuit: {
    title: 'Pursuit curve',
    url: 'https://en.wikipedia.org/wiki/Pursuit_curve',
  },
  clothoid: {
    title: 'Euler spiral',
    url: 'https://en.wikipedia.org/wiki/Euler_spiral',
  },
  cochleoid: {
    title: 'Cochleoid',
    url: 'https://en.wikipedia.org/wiki/Cochleoid',
  },
  bezier: {
    title: 'Bézier curve',
    url: 'https://en.wikipedia.org/wiki/B%C3%A9zier_curve',
  },
  tangent: {
    title: 'Trigonometric functions',
    url: 'https://en.wikipedia.org/wiki/Trigonometric_functions',
  },
  cosine: {
    title: 'Sine and cosine',
    url: 'https://en.wikipedia.org/wiki/Sine_and_cosine',
  },
  hilbert: {
    title: 'Hilbert curve',
    url: 'https://en.wikipedia.org/wiki/Hilbert_curve',
  },
  peano: {
    title: 'Peano curve',
    url: 'https://en.wikipedia.org/wiki/Peano_curve',
  },
  moore: {
    title: 'Moore curve',
    url: 'https://en.wikipedia.org/wiki/Moore_curve',
  },
  'sierpinski-knopp': {
    title: 'Sierpiński curve',
    url: 'https://en.wikipedia.org/wiki/Sierpi%C5%84ski_curve',
    related: true,
  },
  koch: {
    title: 'Koch snowflake',
    url: 'https://en.wikipedia.org/wiki/Koch_snowflake',
  },
  'koch-snowflake': {
    title: 'Koch snowflake',
    url: 'https://en.wikipedia.org/wiki/Koch_snowflake',
  },
  cantor: {
    title: 'Cantor function',
    url: 'https://en.wikipedia.org/wiki/Cantor_function',
  },
  lebesgue: {
    title: 'Space-filling curve',
    url: 'https://en.wikipedia.org/wiki/Space-filling_curve',
    related: true,
  },
  'family-rolling': {
    title: 'Roulette (curve)',
    url: 'https://en.wikipedia.org/wiki/Roulette_(curve)',
  },
  'family-conics': {
    title: 'Conic section',
    url: 'https://en.wikipedia.org/wiki/Conic_section',
  },
  'family-lissajous': {
    title: 'Lissajous curve',
    url: 'https://en.wikipedia.org/wiki/Lissajous_curve',
  },
  'family-roses': {
    title: 'Rose (mathematics)',
    url: 'https://en.wikipedia.org/wiki/Rose_(mathematics)',
  },
  'family-limacons': {
    title: 'Limaçon',
    url: 'https://en.wikipedia.org/wiki/Lima%C3%A7on',
  },
  'family-spirals': {
    title: 'Spiral',
    url: 'https://en.wikipedia.org/wiki/Spiral',
  },
  'family-fractals': {
    title: 'Space-filling curve',
    url: 'https://en.wikipedia.org/wiki/Space-filling_curve',
  },
  'physics-brachistochrone': {
    title: 'Brachistochrone curve',
    url: 'https://en.wikipedia.org/wiki/Brachistochrone_curve',
  },
  'physics-ballistics': {
    title: 'Projectile motion',
    url: 'https://en.wikipedia.org/wiki/Projectile_motion',
  },
  'physics-catenary-parabola': {
    title: 'Catenary',
    url: 'https://en.wikipedia.org/wiki/Catenary',
  },
};
export const people: Record<string, { name: string; url: string }> = {
  'Jacob Bernoulli': {
    name: 'Jacob Bernoulli',
    url: 'https://en.wikipedia.org/wiki/Jacob_Bernoulli',
  },
  'Johann Bernoulli': {
    name: 'Johann Bernoulli',
    url: 'https://en.wikipedia.org/wiki/Johann_Bernoulli',
  },
  Archimedes: {
    name: 'Archimedes',
    url: 'https://en.wikipedia.org/wiki/Archimedes',
  },
  'Galileo Galilei': {
    name: 'Galileo Galilei',
    url: 'https://en.wikipedia.org/wiki/Galileo_Galilei',
  },
  'Christiaan Huygens': {
    name: 'Christiaan Huygens',
    url: 'https://en.wikipedia.org/wiki/Christiaan_Huygens',
  },
  'Gottfried Wilhelm Leibniz': {
    name: 'Gottfried Wilhelm Leibniz',
    url: 'https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz',
  },
  'Isaac Newton': {
    name: 'Isaac Newton',
    url: 'https://en.wikipedia.org/wiki/Isaac_Newton',
  },
  Euclid: {
    name: 'Euclid',
    url: 'https://en.wikipedia.org/wiki/Euclid',
  },
  'Apollonius of Perga': {
    name: 'Apollonius of Perga',
    url: 'https://en.wikipedia.org/wiki/Apollonius_of_Perga',
  },
  'Johannes Kepler': {
    name: 'Johannes Kepler',
    url: 'https://en.wikipedia.org/wiki/Johannes_Kepler',
  },
  'Leonhard Euler': {
    name: 'Leonhard Euler',
    url: 'https://en.wikipedia.org/wiki/Leonhard_Euler',
  },
  'Étienne Pascal': {
    name: 'Étienne Pascal',
    url: 'https://en.wikipedia.org/wiki/%C3%89tienne_Pascal',
  },
  'Blaise Pascal': {
    name: 'Blaise Pascal',
    url: 'https://en.wikipedia.org/wiki/Blaise_Pascal',
  },
  'Guido Grandi': {
    name: 'Guido Grandi',
    url: 'https://en.wikipedia.org/wiki/Luigi_Guido_Grandi',
  },
  'Maria Gaetana Agnesi': {
    name: 'Maria Gaetana Agnesi',
    url: 'https://en.wikipedia.org/wiki/Maria_Gaetana_Agnesi',
  },
  'Pierre de Fermat': {
    name: 'Pierre de Fermat',
    url: 'https://en.wikipedia.org/wiki/Pierre_de_Fermat',
  },
  'René Descartes': {
    name: 'René Descartes',
    url: 'https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes',
  },
  'Diocles (mathematician)': {
    name: 'Diocles',
    url: 'https://en.wikipedia.org/wiki/Diocles_(mathematician)',
  },
  'Nicomedes (mathematician)': {
    name: 'Nicomedes',
    url: 'https://en.wikipedia.org/wiki/Nicomedes_(mathematician)',
  },
  'Eudoxus of Cnidus': {
    name: 'Eudoxus of Cnidus',
    url: 'https://en.wikipedia.org/wiki/Eudoxus_of_Cnidus',
  },
  'Isaac Barrow': {
    name: 'Isaac Barrow',
    url: 'https://en.wikipedia.org/wiki/Isaac_Barrow',
  },
  'William Neile': {
    name: 'William Neile',
    url: 'https://en.wikipedia.org/wiki/William_Neile',
  },
  'Colin Maclaurin': {
    name: 'Colin Maclaurin',
    url: 'https://en.wikipedia.org/wiki/Colin_Maclaurin',
  },
  'Ehrenfried Walther von Tschirnhaus': {
    name: 'Ehrenfried Walther von Tschirnhaus',
    url: 'https://en.wikipedia.org/wiki/Ehrenfried_Walther_von_Tschirnhaus',
  },
  'Eugène Charles Catalan': {
    name: 'Eugène Charles Catalan',
    url: 'https://en.wikipedia.org/wiki/Eug%C3%A8ne_Charles_Catalan',
  },
  "Guillaume de l'Hôpital": {
    name: "Guillaume de l'Hôpital",
    url: 'https://en.wikipedia.org/wiki/Guillaume_de_l%27H%C3%B4pital',
  },
  'Gabriel Lamé': {
    name: 'Gabriel Lamé',
    url: 'https://en.wikipedia.org/wiki/Gabriel_Lam%C3%A9',
  },
  'Pierre Varignon': {
    name: 'Pierre Varignon',
    url: 'https://en.wikipedia.org/wiki/Pierre_Varignon',
  },
  'Roger Cotes': {
    name: 'Roger Cotes',
    url: 'https://en.wikipedia.org/wiki/Roger_Cotes',
  },
  'Arthur Cayley': {
    name: 'Arthur Cayley',
    url: 'https://en.wikipedia.org/wiki/Arthur_Cayley',
  },
  'James Joseph Sylvester': {
    name: 'James Joseph Sylvester',
    url: 'https://en.wikipedia.org/wiki/James_Joseph_Sylvester',
  },
  'Jules Antoine Lissajous': {
    name: 'Jules Antoine Lissajous',
    url: 'https://en.wikipedia.org/wiki/Jules_Antoine_Lissajous',
  },
  'Nathaniel Bowditch': {
    name: 'Nathaniel Bowditch',
    url: 'https://en.wikipedia.org/wiki/Nathaniel_Bowditch',
  },
  'Giovanni Domenico Cassini': {
    name: 'Giovanni Domenico Cassini',
    url: 'https://en.wikipedia.org/wiki/Giovanni_Domenico_Cassini',
  },
  'Joseph Neuberg': {
    name: 'Joseph Neuberg',
    url: 'https://en.wikipedia.org/wiki/Joseph_Jean_Baptiste_Neuberg',
  },
  'Pierre Bézier': {
    name: 'Pierre Bézier',
    url: 'https://en.wikipedia.org/wiki/Pierre_B%C3%A9zier',
  },
  'Paul de Casteljau': {
    name: 'Paul de Casteljau',
    url: 'https://en.wikipedia.org/wiki/Paul_de_Casteljau',
  },
  'David Hilbert': {
    name: 'David Hilbert',
    url: 'https://en.wikipedia.org/wiki/David_Hilbert',
  },
  'Giuseppe Peano': {
    name: 'Giuseppe Peano',
    url: 'https://en.wikipedia.org/wiki/Giuseppe_Peano',
  },
  'E. H. Moore': {
    name: 'E. H. Moore',
    url: 'https://en.wikipedia.org/wiki/E._H._Moore',
  },
  'Wacław Sierpiński': {
    name: 'Wacław Sierpiński',
    url: 'https://en.wikipedia.org/wiki/Wac%C5%82aw_Sierpi%C5%84ski',
  },
  'Konrad Knopp': {
    name: 'Konrad Knopp',
    url: 'https://en.wikipedia.org/wiki/Konrad_Knopp',
  },
  'Helge von Koch': {
    name: 'Helge von Koch',
    url: 'https://en.wikipedia.org/wiki/Helge_von_Koch',
  },
  'Georg Cantor': {
    name: 'Georg Cantor',
    url: 'https://en.wikipedia.org/wiki/Georg_Cantor',
  },
  'Henri Lebesgue': {
    name: 'Henri Lebesgue',
    url: 'https://en.wikipedia.org/wiki/Henri_Lebesgue',
  },
  'John Napier': {
    name: 'John Napier',
    url: 'https://en.wikipedia.org/wiki/John_Napier',
  },
  'Albrecht Dürer': {
    name: 'Albrecht Dürer',
    url: 'https://en.wikipedia.org/wiki/Albrecht_D%C3%BCrer',
  },
  'Evangelista Torricelli': {
    name: 'Evangelista Torricelli',
    url: 'https://en.wikipedia.org/wiki/Evangelista_Torricelli',
  },
  'Frances Spence': {
    name: 'Frances Spence',
    url: 'https://en.wikipedia.org/wiki/Frances_Spence',
  },
  'Gilles de Roberval': {
    name: 'Gilles de Roberval',
    url: 'https://en.wikipedia.org/wiki/Gilles_de_Roberval',
  },
  'J. Presper Eckert': {
    name: 'J. Presper Eckert',
    url: 'https://en.wikipedia.org/wiki/J._Presper_Eckert',
  },
  'Jean Bartik': {
    name: 'Jean Bartik',
    url: 'https://en.wikipedia.org/wiki/Jean_Bartik',
  },
  'John Mauchly': {
    name: 'John Mauchly',
    url: 'https://en.wikipedia.org/wiki/John_Mauchly',
  },
};
export const peopleForCurve: Record<string, string[]> = {
  lemniscate: ['Jacob Bernoulli'],
  spiral: ['Archimedes'],
  cycloid: [
    'Galileo Galilei',
    'Christiaan Huygens',
    'Jacob Bernoulli',
    'Johann Bernoulli',
  ],
  catenary: [
    'Gottfried Wilhelm Leibniz',
    'Christiaan Huygens',
    'Johann Bernoulli',
  ],
  circle: ['Euclid'],
  ellipse: ['Apollonius of Perga', 'Johannes Kepler'],
  hyperbola: ['Apollonius of Perga'],
  deltoid: ['Leonhard Euler'],
  nephroid: ['Christiaan Huygens'],
  limacon: ['Étienne Pascal'],
  lissajous: ['Jules Antoine Lissajous', 'Nathaniel Bowditch'],
  folium: ['René Descartes'],
  cissoid: ['Diocles (mathematician)'],
  conchoid: ['Nicomedes (mathematician)'],
  strophoid: ['Isaac Barrow'],
  witch: ['Maria Gaetana Agnesi', 'Pierre de Fermat', 'Guido Grandi'],
  cassini: ['Giovanni Domenico Cassini'],
  cubic: ['Isaac Newton', 'Gottfried Wilhelm Leibniz'],
  semicubical: ['William Neile'],
  trisectrix: ['Colin Maclaurin'],
  tschirnhausen: [
    'Ehrenfried Walther von Tschirnhaus',
    'Eugène Charles Catalan',
    "Guillaume de l'Hôpital",
  ],
  kampyle: ['Eudoxus of Cnidus'],
  lame: ['Gabriel Lamé'],
  'log-spiral': ['René Descartes', 'Jacob Bernoulli'],
  fermat: ['Pierre de Fermat'],
  'hyperbolic-spiral': ['Pierre Varignon'],
  lituus: ['Roger Cotes'],
  tractrix: ['Christiaan Huygens', 'Gottfried Wilhelm Leibniz'],
  cayley: ['Arthur Cayley'],
  bicorn: ['James Joseph Sylvester', 'Arthur Cayley'],
  clothoid: ['Leonhard Euler'],
  cochleoid: ['Joseph Neuberg'],
  bezier: ['Pierre Bézier', 'Paul de Casteljau'],
  hilbert: ['David Hilbert', 'Giuseppe Peano'],
  peano: ['Giuseppe Peano'],
  moore: ['E. H. Moore'],
  'sierpinski-knopp': ['Wacław Sierpiński', 'Konrad Knopp'],
  koch: ['Helge von Koch'],
  'koch-snowflake': ['Helge von Koch'],
  cantor: ['Georg Cantor'],
  lebesgue: ['Henri Lebesgue'],
  'family-rolling': ['Christiaan Huygens', 'Leonhard Euler'],
  'family-conics': ['Apollonius of Perga', 'Johannes Kepler'],
  'family-lissajous': ['Jules Antoine Lissajous', 'Nathaniel Bowditch'],
  'family-roses': ['Guido Grandi'],
  'family-limacons': ['Étienne Pascal', 'Gilles de Roberval', 'Albrecht Dürer'],
  'family-spirals': [
    'Archimedes',
    'René Descartes',
    'Evangelista Torricelli',
    'Jacob Bernoulli',
  ],
  'family-fractals': ['Giuseppe Peano', 'David Hilbert', 'Helge von Koch'],
  'physics-brachistochrone': [
    'Johann Bernoulli',
    'Jacob Bernoulli',
    'Isaac Newton',
    'Gottfried Wilhelm Leibniz',
    "Guillaume de l'Hôpital",
  ],
  'physics-catenary-parabola': [
    'Christiaan Huygens',
    'Gottfried Wilhelm Leibniz',
    'Johann Bernoulli',
  ],
  'physics-ballistics': [
    'Galileo Galilei',
    'J. Presper Eckert',
    'John Mauchly',
    'Jean Bartik',
    'Frances Spence',
  ],
};
