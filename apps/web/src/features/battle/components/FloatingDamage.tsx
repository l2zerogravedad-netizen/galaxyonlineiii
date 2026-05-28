/**
 * ====================================================================
 * FloatingDamage — Stub component
 * Sistema de numeros de daño flotantes
 * Será reemplazado por el agente de UI de batalla
 * ====================================================================
 */

import React, { useEffect, useState } from 'react';

export interface FloatingDamageItem {
  id: string;
  value: number;
  x: number;
  y: number;
  isCritical?: boolean;
  isHeal?: boolean;
  timestamp: number;
}

export interface FloatingDamageProps {
  damages: FloatingDamageItem[];
}

function DamageParticle({ item }: { item: FloatingDamageItem }) {
  const [opacity, setOpacity] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
      setOffsetY(-30);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`absolute pointer-events-none font-black text-lg transition-all duration-700 ${
        item.isCritical
          ? 'text-yellow-400 text-xl'
          : item.isHeal
          ? 'text-green-400'
          : 'text-red-400'
      }`}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        opacity,
        transform: `translateY(${offsetY}px)`,
        textShadow: '0 0 6px rgba(0,0,0,0.8)',
      }}
    >
      {item.isHeal ? '+' : '-'}
      {item.value.toLocaleString()}
      {item.isCritical && '!'}
    </div>
  );
}

export function FloatingDamage({ damages }: FloatingDamageProps) {
  const [active, setActive] = useState<FloatingDamageItem[]>([]);

  useEffect(() => {
    if (damages.length > 0) {
      const latest = damages.slice(-5);
      setActive(latest);
      const timer = setTimeout(() => setActive([]), 800);
      return () => clearTimeout(timer);
    }
  }, [damages]);

  if (active.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {active.map((item) => (
        <DamageParticle key={item.id} item={item} />
      ))}
    </div>
  );
}
