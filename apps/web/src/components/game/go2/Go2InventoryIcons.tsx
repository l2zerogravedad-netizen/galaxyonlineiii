// ============================================================
// GO2 COMMANDER INVENTORY ICONS
// ============================================================
// Small 64x64 icon components for displaying commanders as
// inventory items. Includes:
//   - Commander portrait image
//   - Rarity-colored border (green/blue/purple/gold)
//   - Level badge (bottom-left)
//   - Star count (top-right)
//   - Stack count overlay (bottom-right, if > 1)
//   - Selection highlight state
//   - Hover tooltip with full commander info
// ============================================================

import React, { useState } from 'react';
import { Commander, Rarity, RARITY_COLORS } from './go2-commander-data';
import { ScrollRarity, SCROLL_COLORS } from './go2-scroll-system';

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

export interface InventoryIconProps {
  /** Commander data to display */
  commander: Commander;
  /** How many copies of this commander the player owns */
  count?: number;
  /** Whether this icon is currently selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Optional size override (default: 64) */
  size?: number;
  /** Whether the icon is disabled (dimmed) */
  disabled?: boolean;
}

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

/** Build the portrait image URL from commander ID */
function getPortraitUrl(commanderId: string): string {
  // Try .webp first, fallback path structure
  return `/assets/cmd_${commanderId}.webp`;
}

/** Generate initials fallback when portrait is missing */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Get rarity label for display */
function getRarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'common': return 'Skill';
    case 'super': return 'Super';
    case 'legendary': return 'Legendary';
    case 'divine': return 'Divine';
    default: return rarity;
  }
}

/** Get border color based on rarity */
function getBorderColor(rarity: Rarity): string {
  return RARITY_COLORS[rarity] ?? '#999';
}

/** Get background gradient based on rarity */
function getRarityBg(rarity: Rarity): string {
  switch (rarity) {
    case 'common':
      return 'linear-gradient(135deg, #0a1f0a 0%, #1a3a1a 100%)';
    case 'super':
      return 'linear-gradient(135deg, #0a1a2f 0%, #1a3050 100%)';
    case 'legendary':
      return 'linear-gradient(135deg, #1f0a2f 0%, #3a1a50 100%)';
    case 'divine':
      return 'linear-gradient(135deg, #2f1f0a 0%, #503a1a 100%)';
    default:
      return '#1a1a1a';
  }
}

// ------------------------------------------------------------------
// COMMANDER INVENTORY ICON (64x64)
// ------------------------------------------------------------------

export function CommanderInventoryIcon({
  commander,
  count = 1,
  isSelected = false,
  onClick,
  size = 64,
  disabled = false,
}: InventoryIconProps) {
  const [imgError, setImgError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const borderColor = getBorderColor(commander.rarity);
  const scale = size / 64;

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Icon Container */}
      <div
        onClick={onClick}
        style={{
          width: size,
          height: size,
          border: `${Math.max(2 * scale, 1)}px solid ${isSelected ? '#ffd54f' : borderColor}`,
          borderRadius: 8 * scale,
          background: getRarityBg(commander.rarity),
          position: 'relative',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          opacity: disabled ? 0.4 : 1,
          transition: 'border-color 0.15s, transform 0.1s',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isSelected
            ? `0 0 8px ${borderColor}, inset 0 0 4px rgba(255,213,79,0.3)`
            : `0 2px 4px rgba(0,0,0,0.4)`,
          boxSizing: 'border-box',
        }}
        onMouseDown={e => {
          if (onClick) e.currentTarget.style.transform = `scale(${0.92 * scale / 64 * 64})`;
        }}
        onMouseUp={e => {
          if (onClick) e.currentTarget.style.transform = isSelected ? 'scale(1.05)' : 'scale(1)';
        }}
        onMouseLeave={e => {
          if (onClick) e.currentTarget.style.transform = isSelected ? 'scale(1.05)' : 'scale(1)';
        }}
      >
        {/* Portrait Image */}
        {!imgError ? (
          <img
            src={getPortraitUrl(commander.id)}
            alt={commander.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            draggable={false}
          />
        ) : (
          /* Fallback: initials + rarity color background */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: RARITY_COLORS[commander.rarity] + '33',
              color: RARITY_COLORS[commander.rarity],
              fontSize: 16 * scale,
              fontWeight: 900,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            {getInitials(commander.name)}
          </div>
        )}

        {/* Star Count (top-right) */}
        <div
          style={{
            position: 'absolute',
            top: 2 * scale,
            right: 2 * scale,
            fontSize: Math.max(7 * scale, 5),
            color: '#ffd54f',
            textShadow: '0 1px 2px rgba(0,0,0,0.9)',
            lineHeight: 1,
            pointerEvents: 'none',
            letterSpacing: '-0.5px',
          }}
        >
          {'★'.repeat(Math.min(commander.stars, 9))}
          {'☆'.repeat(Math.max(0, 9 - commander.stars))}
        </div>

        {/* Level Badge (bottom-left) */}
        <div
          style={{
            position: 'absolute',
            bottom: 2 * scale,
            left: 2 * scale,
            fontSize: Math.max(8 * scale, 6),
            color: '#ffd54f',
            fontWeight: 900,
            textShadow: '0 1px 2px rgba(0,0,0,0.9)',
            lineHeight: 1,
            pointerEvents: 'none',
            background: 'rgba(0,0,0,0.5)',
            padding: '1px 3px',
            borderRadius: 3,
          }}
        >
          LV.{commander.level}
        </div>

        {/* Stack Count (bottom-right) */}
        {count > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 2 * scale,
              right: 2 * scale,
              fontSize: Math.max(10 * scale, 7),
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,1)',
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >
            x{count}
          </div>
        )}

        {/* Selected indicator overlay */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: `${Math.max(2 * scale, 1)}px solid #ffd54f`,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 8px rgba(255,213,79,0.4)',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 6,
            background: 'rgba(0, 0, 68, 0.95)',
            border: `1px solid ${borderColor}`,
            borderRadius: 6,
            padding: '8px 12px',
            zIndex: 100,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 13, color: borderColor }}>
            {commander.name}
          </div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
            {getRarityLabel(commander.rarity)} · LV.{commander.level} · {commander.stars}★
          </div>
          <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
            {commander.skill}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// COMPACT VARIANT (32x32 for tight layouts)
// ------------------------------------------------------------------

export function CommanderInventoryIconSmall({
  commander,
  count = 1,
  isSelected = false,
  onClick,
  disabled = false,
}: InventoryIconProps) {
  return (
    <CommanderInventoryIcon
      commander={commander}
      count={count}
      isSelected={isSelected}
      onClick={onClick}
      size={32}
      disabled={disabled}
    />
  );
}

// ------------------------------------------------------------------
// LARGE VARIANT (96x96 for detail views)
// ------------------------------------------------------------------

export function CommanderInventoryIconLarge({
  commander,
  count = 1,
  isSelected = false,
  onClick,
  disabled = false,
}: InventoryIconProps) {
  return (
    <CommanderInventoryIcon
      commander={commander}
      count={count}
      isSelected={isSelected}
      onClick={onClick}
      size={96}
      disabled={disabled}
    />
  );
}

// ------------------------------------------------------------------
// PLACEHOLDER ICON (for empty slots)
// ------------------------------------------------------------------

export function CommanderIconPlaceholder({ size = 64 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '2px dashed #333366',
        borderRadius: 8,
        background: 'rgba(0, 0, 68, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333366',
        fontSize: size * 0.35,
        opacity: 0.5,
      }}
    >
      ?
    </div>
  );
}

// ------------------------------------------------------------------
// SCROLL INVENTORY ICON
// ------------------------------------------------------------------
// For displaying merge scroll items in inventory

export interface ScrollIconProps {
  rarity: ScrollRarity;
  name: string;
  count: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ScrollInventoryIcon({
  rarity,
  name,
  count,
  onClick,
  isSelected = false,
}: ScrollIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = SCROLL_COLORS[rarity];

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        onClick={onClick}
        style={{
          width: 64,
          height: 64,
          border: `2px solid ${isSelected ? '#ffd54f' : color}`,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
          position: 'relative',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          boxShadow: isSelected
            ? `0 0 8px ${color}`
            : '0 2px 4px rgba(0,0,0,0.3)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {/* Scroll symbol */}
        <span style={{ fontSize: 28 }}>📜</span>

        {/* Scroll name label */}
        <div
          style={{
            fontSize: 8,
            color: color,
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1,
            padding: '0 4px',
          }}
        >
          {name.replace(' Merge Scroll', '')}
        </div>

        {/* Stack count */}
        {count > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              fontSize: 10,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,1)',
            }}
          >
            x{count}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 6,
            background: 'rgba(0, 0, 68, 0.95)',
            border: `1px solid ${color}`,
            borderRadius: 6,
            padding: '8px 12px',
            zIndex: 100,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 12, color }}>{name}</div>
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Quantity: {count}</div>
        </div>
      )}
    </div>
  );
}
