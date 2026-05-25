import { ConstructionDemoPage } from '@/features/construction-demo/ConstructionDemoPage';

export const metadata = {
  title: 'Demo construcción — Galaxy',
  description: 'Arrastra edificios sobre la grilla del planeta (demo local)',
};

export default function ConstructionDemoRoute() {
  return <ConstructionDemoPage />;
}
