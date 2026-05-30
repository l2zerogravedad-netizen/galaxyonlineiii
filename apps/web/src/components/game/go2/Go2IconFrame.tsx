'use client';

import type { ReactNode } from 'react';
import { Go2Icon, type Go2IconName } from './Go2Icons';

export type Go2FrameRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

const RARITY_CLASS: Record<Go2FrameRarity, string> = {
  common: 'go2-frame--common',
  uncommon: 'go2-frame--uncommon',
  rare: 'go2-frame--rare',
  epic: 'go2-frame--epic',
  legendary: 'go2-frame--legendary',
};

export function Go2IconFrame({
  icon,
  size = 'md',
  rarity = 'common',
  label,
  className = '',
  children,
}: {
  icon: Go2IconName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rarity?: Go2FrameRarity;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const px = size === 'sm' ? 32 : size === 'md' ? 44 : size === 'lg' ? 56 : 72;
  const iconPx = size === 'sm' ? 22 : size === 'md' ? 30 : size === 'lg' ? 38 : 48;

  return (
    <div
      className={['go2-icon-frame', RARITY_CLASS[rarity], `go2-icon-frame--${size}`, className]
        .filter(Boolean)
        .join(' ')}
      style={{ width: px, height: px }}
      title={label}
    >
      <div className="go2-icon-frame__shine" />
      <div className="go2-icon-frame__inner">
        {children ?? <Go2Icon name={icon} size={iconPx} />}
      </div>
    </div>
  );
}
