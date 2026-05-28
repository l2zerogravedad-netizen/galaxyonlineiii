import React, { useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
//  Galaxy Online 2 - Battle Header (Top Bar)
//  Recreación pixel-perfect de la barra superior de batalla
// ═══════════════════════════════════════════════════════════════

export interface Ability {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
}

export interface BattleHeaderV2Props {
  attacker: {
    name: string;
    level: number;
    stars: number;
    portrait?: string;
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    abilities: Ability[];
    buffs?: Ability[];
  };
  defender: {
    name: string;
    level: number;
    stars: number;
    portrait?: string;
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    abilities: Ability[];
    buffs?: Ability[];
  };
  round: number;
  phase: number;
}

// ── Estrellas SVG doradas ──
const StarIcon: React.FC<{
  filled: boolean;
  color?: string;
  delay?: number;
}> = ({ filled, color = "#ffd54f", delay = 0 }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={filled ? color : "none"}
    stroke={color}
    strokeWidth="1"
    className="star-pulse"
    style={{
      animationDelay: `${delay}ms`,
      filter: filled
        ? `drop-shadow(0 0 3px ${color}) drop-shadow(0 0 6px ${color}80)`
        : "none",
    }}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ── Icono de habilidad triangular (estilo GO2) ──
const AbilityIcon: React.FC<{ ability: Ability; side: "left" | "right" }> = ({
  ability,
  side,
}) => (
  <div className="ability-wrapper group">
    <div
      className={`ability-hex ${side === "left" ? "ability-hex-attacker" : "ability-hex-defender"}`}
    >
      <span className="ability-triangle">▲</span>
      <span className="ability-name">{ability.name}</span>
    </div>
    {ability.cooldown > 0 && (
      <span className="ability-cooldown">{ability.cooldown}</span>
    )}
    {/* Tooltip */}
    <div className="ability-tooltip">
      <div className="tooltip-name">{ability.name}</div>
      <div className="tooltip-cooldown">
        CD: {ability.cooldown} turnos
      </div>
    </div>
  </div>
);

// ── Icono de buff/debuff ──
const BuffIcon: React.FC<{ buff: Ability }> = ({ buff }) => (
  <div className="buff-wrapper group">
    <div className="buff-square">
      <span className="buff-icon">⚔</span>
    </div>
    {buff.cooldown > 0 && <span className="buff-cooldown">{buff.cooldown}</span>}
    <div className="buff-tooltip">
      <div className="tooltip-name">{buff.name}</div>
    </div>
  </div>
);

// ── Portrait circular con glow de facción ──
const CommanderPortrait: React.FC<{
  portrait?: string;
  faction: "attacker" | "defender";
  name: string;
}> = ({ portrait, faction, name }) => {
  const borderColor = faction === "attacker" ? "#4488ff" : "#ffd54f";
  const glowColor = faction === "attacker" ? "#4488ff60" : "#ffd54f60";
  const shadowColor = faction === "attacker" ? "#4488ff" : "#ffd54f";

  return (
    <div
      className="portrait-container"
      style={{
        boxShadow: `
          0 0 8px ${glowColor},
          0 0 20px ${glowColor}40,
          0 0 40px ${glowColor}20,
          inset 0 0 12px ${glowColor}30
        `,
      }}
    >
      <div
        className="portrait-ring"
        style={{
          borderColor: borderColor,
          boxShadow: `
            0 0 6px ${shadowColor},
            0 0 12px ${shadowColor}60,
            inset 0 0 8px ${shadowColor}40
          `,
        }}
      >
        {portrait ? (
          <img
            src={portrait}
            alt={name}
            className="portrait-img"
            draggable={false}
          />
        ) : (
          <div className="portrait-placeholder">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={borderColor}
              strokeWidth="1.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>
      {/* Ornamental ring effect */}
      <div
        className="portrait-ornament-ring"
        style={{
          borderColor: `${borderColor}40`,
        }}
      />
    </div>
  );
};

// ── Barra de HP/Shield combinada ──
const HpShieldBar: React.FC<{
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  side: "left" | "right";
}> = ({ hp, maxHp, shield, maxShield, side }) => {
  const hpPercent = Math.min(100, Math.max(0, (hp / maxHp) * 100));
  const shieldPercent = Math.min(100, Math.max(0, (shield / maxShield) * 100));
  const totalMax = maxHp + maxShield;
  const totalCurrent = hp + shield;
  const isLowHp = hpPercent <= 25;
  const isAttacker = side === "left";

  // Shield takes the first portion (left for attacker, right for defender)
  const shieldWidth = (shield / totalMax) * 100;
  const hpWidth = (hp / totalMax) * 100;

  return (
    <div className="hp-bar-outer">
      <div className="hp-bar-track">
        {/* Shield portion */}
        <div
          className={`hp-bar-fill hp-bar-shield ${isAttacker ? "shield-attacker" : "shield-defender"}`}
          style={{
            width: `${shieldWidth}%`,
            transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="hp-bar-shine" />
        </div>
        {/* HP portion */}
        <div
          className={`hp-bar-fill hp-bar-hp ${isLowHp ? "hp-low-pulse" : ""} ${isAttacker ? "hp-attacker" : "hp-defender"}`}
          style={{
            width: `${hpWidth}%`,
            transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="hp-bar-shine" />
        </div>
        {/* HP Text overlay */}
        <span className="hp-bar-text">
          {totalCurrent.toLocaleString()}/{totalMax.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// ── Centro de la barra: Ronda ──
const RoundDisplay: React.FC<{ round: number; phase: number }> = ({
  round,
  phase,
}) => (
  <div className="round-display">
    {/* Decorative top flourish */}
    <div className="round-flourish-top">
      <div className="flourish-line-left" />
      <div className="flourish-diamond">◆</div>
      <div className="flourish-line-right" />
    </div>

    <div className="round-number">{round}</div>
    <div className="round-label">RONDA</div>

    {/* Phase indicator */}
    <div className="phase-indicator">
      <span className="phase-number">{phase}</span>
    </div>

    {/* Decorative bottom flourish */}
    <div className="round-flourish-bottom">
      <div className="flourish-line-full" />
    </div>
  </div>
);

// ── Lado del Comandante (izquierdo o derecho) ──
const CommanderSide: React.FC<{
  commander: BattleHeaderV2Props["attacker"];
  side: "left" | "right";
}> = ({ commander, side }) => {
  const isAttacker = side === "left";
  const levelColor = isAttacker ? "#4488ff" : "#ffd54f";
  const starColor = isAttacker ? "#4488ff" : "#ffd54f";
  const nameColor = isAttacker ? "#ffffff" : "#ffffff";

  return (
    <div className={`commander-side ${side}`}>
      {/* Portrait */}
      <div className="portrait-wrap">
        <CommanderPortrait
          portrait={commander.portrait}
          faction={isAttacker ? "attacker" : "defender"}
          name={commander.name}
        />
      </div>

      {/* Info block */}
      <div className="info-block">
        {/* Name + Level row */}
        <div className="name-level-row">
          {isAttacker && (
            <div className="stars-row">
              {Array.from({ length: 9 }, (_, i) => (
                <StarIcon
                  key={i}
                  filled={i < commander.stars}
                  color={starColor}
                  delay={i * 120}
                />
              ))}
            </div>
          )}

          <span className="commander-name" style={{ color: nameColor }}>
            {commander.name}
          </span>

          {!isAttacker && (
            <div className="stars-row">
              {Array.from({ length: 9 }, (_, i) => (
                <StarIcon
                  key={i}
                  filled={i < commander.stars}
                  color={starColor}
                  delay={i * 120}
                />
              ))}
            </div>
          )}
        </div>

        {/* Level */}
        <div className="level-row">
          <span className="level-badge" style={{ color: levelColor }}>
            <span className="level-prefix">Lv.</span>
            <span className="level-number">{commander.level}</span>
          </span>
        </div>

        {/* HP/Shield Bar */}
        <HpShieldBar
          hp={commander.hp}
          maxHp={commander.maxHp}
          shield={commander.shield}
          maxShield={commander.maxShield}
          side={side}
        />
      </div>

      {/* Abilities row */}
      <div className="abilities-row">
        {commander.abilities.map((ability) => (
          <AbilityIcon key={ability.id} ability={ability} side={side} />
        ))}
        {commander.buffs?.map((buff) => (
          <BuffIcon key={buff.id} buff={buff} />
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export const BattleHeaderV2: React.FC<BattleHeaderV2Props> = ({
  attacker,
  defender,
  round,
  phase,
}) => {
  // Memoize para evitar re-renders innecesarios
  const headerStyle = useMemo(
    () => ({
      background: `
        linear-gradient(180deg,
          rgba(10, 20, 35, 0.95) 0%,
          rgba(10, 14, 26, 0.92) 50%,
          rgba(8, 12, 22, 0.95) 100%
        )
      `,
    }),
    []
  );

  return (
    <>
      {/* ── CSS Styles ── */}
      <style>{`
        /* ── Container ── */
        .battle-header-v2 {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          width: 100%;
          min-width: 1024px;
          height: 130px;
          padding: 8px 20px 4px;
          backdrop-filter: blur(16px) saturate(1.2);
          -webkit-backdrop-filter: blur(16px) saturate(1.2);
          border-bottom: 1px solid rgba(26, 58, 95, 0.8);
          box-shadow:
            0 4px 24px rgba(0, 0, 0, 0.6),
            0 1px 0 rgba(68, 136, 255, 0.15),
            inset 0 -1px 0 rgba(26, 58, 95, 0.3);
          overflow: visible;
          z-index: 100;
          font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
        }

        /* Subtle scanline overlay */
        .battle-header-v2::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Metallic sheen */
        .battle-header-v2::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(68, 136, 255, 0.4) 20%,
            rgba(100, 160, 255, 0.6) 50%,
            rgba(68, 136, 255, 0.4) 80%,
            transparent 100%
          );
          z-index: 2;
        }

        /* ── Commander Side ── */
        .commander-side {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          z-index: 10;
          flex: 1;
        }
        .commander-side.left {
          flex-direction: row;
        }
        .commander-side.right {
          flex-direction: row-reverse;
          text-align: right;
        }
        .commander-side.right .info-block {
          align-items: flex-end;
        }
        .commander-side.right .name-level-row {
          flex-direction: row-reverse;
        }
        .commander-side.right .level-row {
          justify-content: flex-end;
        }
        .commander-side.right .abilities-row {
          justify-content: flex-end;
        }
        .commander-side.right .stars-row {
          flex-direction: row-reverse;
        }

        /* ── Portrait ── */
        .portrait-wrap {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .portrait-container {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, rgba(10,20,35,0.9), rgba(20,30,50,0.8));
          transition: transform 200ms ease;
        }
        .portrait-container:hover {
          transform: scale(1.08);
        }
        .portrait-ring {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2.5px solid;
          overflow: hidden;
          position: relative;
          background: #0a0e1a;
        }
        .portrait-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .portrait-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a1a2e, #0a0e1a);
        }
        .portrait-ornament-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid;
          opacity: 0.3;
          animation: orbit-ring 8s linear infinite;
        }
        @keyframes orbit-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ── Info Block ── */
        .info-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 260px;
        }

        /* ── Name + Stars Row ── */
        .name-level-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .commander-name {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 0 8px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.8);
          white-space: nowrap;
        }
        .stars-row {
          display: flex;
          align-items: center;
          gap: 1px;
        }

        /* ── Level ── */
        .level-row {
          display: flex;
          align-items: center;
        }
        .level-badge {
          font-size: 12px;
          font-weight: 600;
          text-shadow: 0 0 6px currentColor;
        }
        .level-prefix {
          opacity: 0.8;
          font-size: 11px;
        }
        .level-number {
          font-size: 13px;
          font-weight: 700;
        }

        /* ── Star Pulse Animation ── */
        .star-pulse {
          animation: star-glint 3s ease-in-out infinite;
        }
        @keyframes star-glint {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.92); }
          75% { opacity: 1; transform: scale(1.05); }
        }

        /* ── HP/Shield Bar ── */
        .hp-bar-outer {
          width: 100%;
          max-width: 320px;
          margin-top: 2px;
        }
        .hp-bar-track {
          position: relative;
          width: 100%;
          height: 18px;
          background: rgba(26, 26, 46, 0.9);
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            inset 0 2px 4px rgba(0, 0, 0, 0.5),
            0 1px 0 rgba(255, 255, 255, 0.05);
        }
        .hp-bar-fill {
          position: relative;
          height: 100%;
          transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .hp-bar-fill:first-child {
          border-radius: 4px 0 0 4px;
        }
        .hp-bar-fill:last-of-type {
          border-radius: 0 4px 4px 0;
        }

        /* Shield colors */
        .shield-attacker {
          background: linear-gradient(180deg,
            #5599ff 0%,
            #4488ff 40%,
            #3366cc 100%
          );
        }
        .shield-defender {
          background: linear-gradient(180deg,
            #ff5555 0%,
            #cc3333 40%,
            #aa2222 100%
          );
        }

        /* HP colors */
        .hp-attacker {
          background: linear-gradient(180deg,
            #55dd55 0%,
            #44cc44 40%,
            #33aa33 100%
          );
        }
        .hp-defender {
          background: linear-gradient(180deg,
            #55dd55 0%,
            #44cc44 40%,
            #33aa33 100%
          );
        }

        /* Low HP pulse */
        .hp-low-pulse {
          animation: hp-danger-pulse 0.8s ease-in-out infinite;
        }
        @keyframes hp-danger-pulse {
          0%, 100% {
            background: linear-gradient(180deg, #ff4444 0%, #cc2222 40%, #aa1111 100%);
            box-shadow: inset 0 0 8px rgba(255, 0, 0, 0.3);
          }
          50% {
            background: linear-gradient(180deg, #ff6666 0%, #ff3333 40%, #cc2222 100%);
            box-shadow: inset 0 0 12px rgba(255, 0, 0, 0.5), 0 0 8px rgba(255, 0, 0, 0.3);
          }
        }

        /* Shine effect on bars */
        .hp-bar-shine {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 45%;
          background: linear-gradient(180deg,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* HP Text */
        .hp-bar-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-weight: 600;
          color: #ffffff;
          text-shadow:
            0 0 4px rgba(0, 0, 0, 0.9),
            0 0 8px rgba(0, 0, 0, 0.8),
            0 1px 2px rgba(0, 0, 0, 1);
          z-index: 5;
          pointer-events: none;
          letter-spacing: 0.3px;
        }

        /* ── Abilities Row ── */
        .abilities-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          min-height: 32px;
        }

        /* ── Ability Hex ── */
        .ability-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        .ability-hex {
          width: 26px;
          height: 26px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          position: relative;
          font-size: 9px;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .ability-hex:hover {
          transform: scale(1.15);
        }
        .ability-hex-attacker {
          background: linear-gradient(135deg, #1a5a2a, #0d3d18);
          border: 1px solid #33aa44;
          box-shadow:
            0 0 6px rgba(51, 170, 68, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .ability-hex-defender {
          background: linear-gradient(135deg, #1a3a6a, #0d2048);
          border: 1px solid #4488cc;
          box-shadow:
            0 0 6px rgba(68, 136, 204, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .ability-triangle {
          font-size: 12px;
          line-height: 1;
          color: #55dd66;
          text-shadow: 0 0 4px rgba(85, 221, 102, 0.5);
        }
        .ability-hex-defender .ability-triangle {
          color: #66aaff;
          text-shadow: 0 0 4px rgba(102, 170, 255, 0.5);
        }
        .ability-name {
          font-size: 7px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: -2px;
          max-width: 24px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ability-cooldown {
          font-size: 9px;
          color: #ffcc44;
          font-weight: 700;
          text-shadow: 0 0 4px rgba(255, 204, 68, 0.5);
          margin-top: 1px;
        }

        /* Ability Tooltip */
        .ability-tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%) scale(0.9);
          background: rgba(10, 14, 30, 0.95);
          border: 1px solid rgba(68, 136, 255, 0.4);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 11px;
          color: #fff;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 150ms ease, transform 150ms ease;
          z-index: 200;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
        }
        .ability-wrapper:hover .ability-tooltip {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }
        .tooltip-name {
          font-weight: 700;
          color: #ffd54f;
          margin-bottom: 2px;
        }
        .tooltip-cooldown {
          font-size: 10px;
          color: #88bbff;
        }

        /* ── Buff Icon ── */
        .buff-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        .buff-square {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2a1a6a, #1a0d48);
          border: 1px solid #6644cc;
          border-radius: 3px;
          box-shadow:
            0 0 6px rgba(102, 68, 204, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          transition: transform 150ms ease;
        }
        .buff-square:hover {
          transform: scale(1.15);
        }
        .buff-icon {
          font-size: 12px;
          filter: drop-shadow(0 0 2px rgba(102, 68, 204, 0.6));
        }
        .buff-cooldown {
          font-size: 9px;
          color: #ffcc44;
          font-weight: 700;
          text-shadow: 0 0 4px rgba(255, 204, 68, 0.5);
          margin-top: 1px;
        }
        .buff-tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%) scale(0.9);
          background: rgba(10, 14, 30, 0.95);
          border: 1px solid rgba(102, 68, 204, 0.5);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 11px;
          color: #fff;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 150ms ease, transform 150ms ease;
          z-index: 200;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
        }
        .buff-wrapper:hover .buff-tooltip {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }

        /* ── Center Round Display ── */
        .round-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding: 0 16px;
          position: relative;
        }

        /* Flourishes */
        .round-flourish-top {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }
        .flourish-line-left,
        .flourish-line-right {
          width: 30px;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 213, 79, 0.5)
          );
        }
        .flourish-line-right {
          background: linear-gradient(90deg,
            rgba(255, 213, 79, 0.5),
            transparent
          );
        }
        .flourish-diamond {
          color: rgba(255, 213, 79, 0.4);
          font-size: 8px;
        }
        .flourish-line-full {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 213, 79, 0.3),
            transparent
          );
          margin-top: 2px;
        }

        /* Round number */
        .round-number {
          font-size: 28px;
          font-weight: 900;
          color: #ffffff;
          text-shadow:
            0 0 12px rgba(255, 255, 255, 0.3),
            0 0 24px rgba(68, 136, 255, 0.2),
            0 2px 8px rgba(0, 0, 0, 0.8);
          line-height: 1;
          letter-spacing: -1px;
        }

        /* RONDA label */
        .round-label {
          font-size: 11px;
          font-weight: 700;
          color: #ffd54f;
          letter-spacing: 3px;
          text-shadow:
            0 0 8px rgba(255, 213, 79, 0.5),
            0 0 16px rgba(255, 213, 79, 0.2),
            0 2px 4px rgba(0, 0, 0, 0.8);
          margin-top: -2px;
        }

        /* Phase indicator */
        .phase-indicator {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%,
            rgba(68, 136, 255, 0.2),
            rgba(26, 58, 95, 0.6)
          );
          border: 1px solid rgba(68, 136, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
          box-shadow:
            0 0 8px rgba(68, 136, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .phase-number {
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 0 6px rgba(68, 136, 255, 0.6);
        }

        /* ── Separator ── */
        .center-separator {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(68, 136, 255, 0.15) 20%,
            rgba(68, 136, 255, 0.25) 50%,
            rgba(68, 136, 255, 0.15) 80%,
            transparent 100%
          );
          transform: translateX(-50%);
          z-index: 5;
        }

        /* ── VS decorative element ── */
        .vs-decorator {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 10px;
          font-weight: 900;
          color: rgba(255, 213, 79, 0.15);
          letter-spacing: 2px;
          z-index: 3;
          pointer-events: none;
        }
      `}</style>

      {/* ── Main Header ── */}
      <header className="battle-header-v2" style={headerStyle}>
        {/* Center separator line */}
        <div className="center-separator" />
        <div className="vs-decorator">VS</div>

        {/* ── Attacker Side (Left) ── */}
        <CommanderSide commander={attacker} side="left" />

        {/* ── Center: Round Display ── */}
        <RoundDisplay round={round} phase={phase} />

        {/* ── Defender Side (Right) ── */}
        <CommanderSide commander={defender} side="right" />
      </header>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
//  DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════
export default BattleHeaderV2;
