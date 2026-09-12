import { PhysicsFrame } from '@/components/physics-frame';
import { PhysicsShelf } from '@/components/physics-shelf';
export const metadata = {
  title: 'Curves from physics — The Curve Atlas',
  description: 'Explore the curves drawn by gravity, tension, and motion.',
};
export default function PhysicsPage() {
  return (
    <PhysicsFrame>
      <div className="family-page-heading">
        <span className="eyebrow">PHYSICS EXPLORERS</span>
        <h1>Forces make shapes.</h1>
        <p>Change the physical assumptions and watch the curve respond.</p>
      </div>
      <PhysicsShelf />
    </PhysicsFrame>
  );
}
