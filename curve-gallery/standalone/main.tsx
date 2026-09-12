import { createRoot } from 'react-dom/client';
import Home from '@/app/page';
import References from '@/app/references/page';
import PhysicsIndex from '@/app/physics/page';
import { FamilyLab } from '@/components/family-lab';
import { CableLab } from '@/components/cable-lab';
import { BallisticsLab } from '@/components/ballistics-lab';
import { BrachistochroneLab } from '@/components/brachistochrone-lab';
import { PageLink } from '@/components/page-link';
import { curveFamilies } from '@/lib/curve-families';
import { curves } from '@/lib/curves';
import { atlasBasePath } from '@/lib/site-path';
import './styles.css';

const search = new URLSearchParams(window.location.search);
const embed = search.get('embed') === '1';
document.body.classList.toggle('atlas-embed', embed);
const fullPath = window.location.pathname;
const path =
  (atlasBasePath &&
  (fullPath === atlasBasePath || fullPath.startsWith(atlasBasePath + '/'))
    ? fullPath.slice(atlasBasePath.length)
    : fullPath
  )
    .replace(/\/index\.html$/, '')
    .replace(/\/$/, '') || '/';

function resolvePage() {
  if (path === '/') {
    const curve = curves.find((c) => c.id === search.get('curve'));
    document.title = curve
      ? `${curve.name} · The Curve Atlas`
      : 'The Curve Atlas';
    return <Home />;
  }
  if (path.startsWith('/families/')) {
    const family = curveFamilies.find((f) => path === `/families/${f.id}`);
    if (family) {
      document.title = `${family.title} · The Curve Atlas`;
      return (
        <FamilyLab
          familyId={family.id}
          initialCurve={search.get('curve') ?? undefined}
        />
      );
    }
  }
  if (path === '/references') {
    document.title = 'The reference shelf · The Curve Atlas';
    return <References />;
  }
  if (path === '/physics') {
    document.title = 'Curves from physics · The Curve Atlas';
    return <PhysicsIndex />;
  }
  if (path === '/physics/catenary-parabola') {
    document.title = 'Catenary to parabola · The Curve Atlas';
    return <CableLab />;
  }
  if (path === '/physics/ballistics') {
    document.title = 'Ballistics · The Curve Atlas';
    return <BallisticsLab />;
  }
  if (path === '/physics/brachistochrone') {
    document.title = 'Brachistochrone · The Curve Atlas';
    return <BrachistochroneLab />;
  }
  return (
    <main>
      <h1>Curve page not found</h1>
      <PageLink href="/">Open the collection</PageLink>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(resolvePage());
