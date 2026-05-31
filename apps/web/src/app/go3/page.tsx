import { Go3Frame } from './Go3Frame';

export const metadata = {
  title: 'Galaxy Online 3',
  description: 'Cliente GO3 — base espacial, galaxia, batalla en tiempo real y asalto a base con FX reales.',
};

// Juego completo (todas las secciones vía su propio dock).
export default function Go3Page() {
  return <Go3Frame />;
}
