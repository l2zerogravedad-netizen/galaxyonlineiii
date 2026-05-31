import { Go3Frame } from '../Go3Frame';

export const metadata = { title: 'Batalla — Galaxy Online 3' };

// Batalla en tiempo real (naves, proyectiles, beams, FX y audio reales del APK).
export default function Go3BattlePage() {
  return <Go3Frame section="battle" />;
}
