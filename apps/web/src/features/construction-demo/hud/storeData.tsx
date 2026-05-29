import React from 'react';
import {
  CouponIcon, BlueprintIcon, BookIcon, GemIcon, PlanetIcon, CardIcon, ChipIcon,
} from './StoreIcons';

export type StoreCurrency = 'cube' | 'honor';

export interface StoreItem {
  id: number;
  name: string;
  price: number;
  currency: StoreCurrency;
  label: string; // 'NEW' | 'HOT' | ''
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const storeData: Record<string, StoreItem[]> = {
  'All Items': [
    { id: 101, name: 'Coupon', price: 10, currency: 'cube', label: 'NEW', color: 'purple', icon: CouponIcon },
    { id: 102, name: 'Luxurious Planet', price: 80, currency: 'cube', label: 'NEW', color: 'red', icon: (p) => <PlanetIcon {...p} type="lux" /> },
    { id: 103, name: 'Metallic Planet', price: 80, currency: 'cube', label: 'NEW', color: 'yellow', icon: (p) => <PlanetIcon {...p} type="met" /> },
    { id: 104, name: 'Gaseous Planet', price: 80, currency: 'cube', label: 'NEW', color: 'green', icon: (p) => <PlanetIcon {...p} type="gas" /> },
    { id: 105, name: 'Adv. Truce Card', price: 80, currency: 'cube', label: 'HOT', color: 'blue', icon: CardIcon },
    { id: 106, name: 'Memory Chip', price: 35, currency: 'cube', label: 'HOT', color: 'blue', icon: ChipIcon },
  ],
  Development: [
    { id: 501, name: 'Speed-Up x2', price: 40, currency: 'cube', label: 'NEW', color: 'cyan', icon: ChipIcon },
    { id: 502, name: 'Auto Builder', price: 150, currency: 'cube', label: '', color: 'blue', icon: BlueprintIcon },
    { id: 503, name: 'Resource Booster', price: 60, currency: 'cube', label: 'HOT', color: 'green', icon: (p) => <PlanetIcon {...p} type="gas" /> },
    { id: 504, name: 'Slot Expansion', price: 90, currency: 'cube', label: '', color: 'purple', icon: CouponIcon },
  ],
  Battle: [
    { id: 601, name: 'Fleet Reinforce', price: 100, currency: 'cube', label: 'HOT', color: 'blue', icon: CardIcon },
    { id: 602, name: 'Temp Shield', price: 45, currency: 'cube', label: '', color: 'cyan', icon: (p) => <GemIcon {...p} color="#3b82f6" highlight="#93c5fd" /> },
    { id: 603, name: 'Orbital Missile', price: 200, currency: 'cube', label: '', color: 'red', icon: (p) => <GemIcon {...p} color="#ef4444" highlight="#fca5a5" /> },
    { id: 604, name: 'Instant Repair', price: 30, currency: 'cube', label: '', color: 'green', icon: ChipIcon },
  ],
  Honor: [
    { id: 201, name: 'Titan', price: 2500, currency: 'honor', label: 'NEW', color: 'green', icon: (p) => <BookIcon {...p} color="#4ade80" inner="#14532d" /> },
    { id: 202, name: 'Hellen', price: 2500, currency: 'honor', label: 'NEW', color: 'pink', icon: (p) => <BookIcon {...p} color="#f472b6" inner="#831843" /> },
    { id: 203, name: 'Dilira', price: 2500, currency: 'honor', label: 'NEW', color: 'blue', icon: (p) => <BookIcon {...p} color="#60a5fa" inner="#1e3a8a" /> },
    { id: 204, name: "Corsairs' Chest", price: 1, currency: 'honor', label: '', color: 'purple', icon: ChipIcon },
    { id: 205, name: 'Polymesus (Blueprint)', price: 1000, currency: 'honor', label: '', color: 'blue', icon: (p) => <BlueprintIcon {...p} color="#3b82f6" /> },
    { id: 206, name: 'Cybra (Blueprint)', price: 1300, currency: 'honor', label: '', color: 'cyan', icon: BlueprintIcon },
  ],
  Badge: [
    { id: 301, name: 'Accuracy Ruby-I', price: 25, currency: 'cube', label: '', color: 'red', icon: (p) => <GemIcon {...p} color="#ef4444" highlight="#fca5a5" /> },
    { id: 302, name: 'Accuracy Sapphire-I', price: 25, currency: 'cube', label: '', color: 'blue', icon: (p) => <GemIcon {...p} color="#3b82f6" highlight="#93c5fd" /> },
    { id: 303, name: 'Accuracy Emerald-I', price: 25, currency: 'cube', label: '', color: 'green', icon: (p) => <GemIcon {...p} color="#22c55e" highlight="#86efac" /> },
    { id: 304, name: 'Dodge Ruby-I', price: 25, currency: 'cube', label: '', color: 'red', icon: (p) => <GemIcon {...p} color="#ef4444" highlight="#fca5a5" /> },
    { id: 305, name: 'Dodge Sapphire-I', price: 25, currency: 'cube', label: '', color: 'blue', icon: (p) => <GemIcon {...p} color="#3b82f6" highlight="#93c5fd" /> },
    { id: 306, name: 'Dodge Emerald-I', price: 25, currency: 'cube', label: '', color: 'green', icon: (p) => <GemIcon {...p} color="#22c55e" highlight="#86efac" /> },
  ],
  Gems: [
    { id: 401, name: 'Memory Chip', price: 35, currency: 'cube', label: 'NEW', color: 'blue', icon: ChipIcon },
    { id: 402, name: 'Adv. Truce Card', price: 80, currency: 'cube', label: 'HOT', color: 'blue', icon: CardIcon },
    { id: 403, name: 'Adv Galaxy Transfer', price: 120, currency: 'cube', label: '', color: 'purple', icon: (p) => <PlanetIcon {...p} type="lux" /> },
    { id: 404, name: 'Galaxy Transfer', price: 8, currency: 'cube', label: '', color: 'pink', icon: (p) => <PlanetIcon {...p} type="met" /> },
    { id: 405, name: 'Truce Card', price: 8, currency: 'cube', label: '', color: 'blue', icon: CardIcon },
    { id: 406, name: 'Resetting Card', price: 15, currency: 'cube', label: '', color: 'cyan', icon: CouponIcon },
  ],
};

export const storeTabs = ['All Items', 'Development', 'Battle', 'Gems', 'Badge', 'Honor'];
