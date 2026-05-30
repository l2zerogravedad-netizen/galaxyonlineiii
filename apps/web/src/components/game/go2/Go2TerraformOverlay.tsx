'use client';

import type { TerraformVisualState } from '@/lib/game/terraformVisual';
import { Go2Icon } from './Go2Icons';

/** Capa visual: el planeta “sana” según datos (video Project Tomorrow t≈311s). */
export function Go2TerraformOverlay({ state }: { state: TerraformVisualState }) {
  return (
    <div className="go2-terraform-overlay" aria-hidden>
      <div className="go2-terraform-sky" />
      <div className="go2-terraform-veg" />
      <div className="go2-terraform-water" />
      <div className="go2-terraform-hud">
        <Go2Icon name="energy" size={18} />
        <span className="go2-terraform-label">{state.label}</span>
        <div className="go2-terraform-bar">
          <div className="go2-terraform-bar-fill" style={{ width: `${state.level}%` }} />
        </div>
        <span className="go2-terraform-pct">{state.level}%</span>
      </div>
    </div>
  );
}
