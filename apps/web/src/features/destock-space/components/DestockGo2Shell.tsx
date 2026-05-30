'use client';

import '@/components/game/go2/go2-planet.css';
import '@/components/game/go2/go2-screens.css';
import '@/components/game/go2/go2-visual.css';
import { ActionToast } from '@/components/game/dashboard/ActionToast';
import { Go2ResourceHud } from '@/components/game/go2/Go2ResourceHud';
import { Go2DestockBottomNav } from './Go2DestockBottomNav';
import { Go2DestockHeader } from './Go2DestockHeader';
import { useDestockShared } from '../useDestockShared';

export function DestockGo2Shell({
  title,
  children,
  showResources = true,
}: {
  title: string;
  children: React.ReactNode;
  showResources?: boolean;
}) {
  const { player, resources, toast } = useDestockShared();

  return (
    <div className="go2-screen-root">
      <ActionToast message={toast} />
      <Go2DestockHeader
        player={player}
        onCollect={() => {}}
        onReset={() => {
          localStorage.removeItem('destock-go2-identical-v1');
          localStorage.removeItem('destock-go2-shipyard-v1');
          localStorage.removeItem('destock-go2-research-v1');
          window.location.href = '/destock';
        }}
        collecting={false}
      />
      {showResources ? <Go2ResourceHud resources={resources} /> : null}
      <div className="go2-screen-title">{title}</div>
      <div className="go2-screen-main">{children}</div>
      <Go2DestockBottomNav />
    </div>
  );
}
