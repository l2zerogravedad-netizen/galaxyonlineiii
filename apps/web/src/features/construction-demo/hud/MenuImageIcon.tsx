import React from 'react';

/**
 * Renders an AAA PNG menu icon (from /public/icons/menu, 256px source) at the same
 * footprint as the SVG it replaces. Drop-in: pass the same `className` (e.g. "w-8 h-8")
 * the old SVG used so button layout/size is untouched — only the visual is upgraded.
 *
 * Uses a plain <img> (not next/image) because these live in /public and are tiny;
 * `image-rendering` + object-contain keeps them crisp when scaled down from 256px.
 */
type Props = { src: string; alt?: string; className?: string };

export function MenuImageIcon({ src, alt = '', className }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`${className ?? ''} object-contain select-none pointer-events-none`}
      style={{ imageRendering: 'auto' }}
    />
  );
}

// Path constants for the 6 provided AAA icons (256px).
export const MENU_ICONS = {
  science: '/icons/menu/01_icono_superior_256.png',   // átomo + matraz (Investigación)
  reactor: '/icons/menu/02_icono_reactor_256.png',    // reactor nuclear (Energía)
  ship: '/icons/menu/03_icono_nave_256.png',          // llave + jet (Construir naves)
  base: '/icons/menu/04_icono_base_256.png',          // edificios isométricos (Base)
  alliance: '/icons/menu/05_icono_personas_256.png',  // personas + red (Alianza)
  main: '/icons/menu/06_icono_principal_256.png',     // globo + red (Menú principal)
} as const;
