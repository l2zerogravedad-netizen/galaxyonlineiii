import React from 'react';
import { RadarIcon } from './StoreIcons';

export interface QuestReward {
  alloy: number;
  gold: number;
  crystal: number;
  itemIcon: React.ComponentType<{ className?: string }> | null;
  itemCount?: number;
}

export interface Quest {
  id: string;
  title: string;
  type: string;
  desc: string;
  target: string;
  statusText: string;
  statusColor: string;
  rewards: QuestReward;
  buttonText: string;
  buttonType: 'collect' | 'incomplete';
}

export const questData: Record<string, Quest> = {
  loud: {
    id: 'loud',
    title: 'Loud and Clear',
    type: 'Main Quest',
    desc: 'With a Loudspeaker, you can make your presence in the galaxy felt by chatting in the World Channel! Give a shout-out to friends in the GO universe or challenge a rival! What you say is up to you! (Click on the chat window in the lower left corner and choose World. Enter some text and start chatting!)',
    target: 'Say something in the World Channel',
    statusText: '(Completed, Unclaimed)',
    statusColor: 'text-green-400',
    rewards: { alloy: 460, gold: 520, crystal: 980, itemIcon: null },
    buttonText: 'Collect Rewards',
    buttonType: 'collect',
  },
  tech: {
    id: 'tech',
    title: 'Lv1 Technology Center',
    type: 'Main Quest',
    desc: 'Technology drives progress. Only through diligent research can society hope to move forward. Construct a Technology Center to enable the research of the latest sciences. (Click on (Build) located in the lower right corner, and select (Construct Buildings)',
    target: 'Build a Lv1 Technology Center',
    statusText: '(Incomplete)',
    statusColor: 'text-red-500',
    rewards: { alloy: 2250, gold: 3250, crystal: 2100, itemIcon: RadarIcon, itemCount: 20 },
    buttonText: 'Incomplete',
    buttonType: 'incomplete',
  },
};

export interface BuildingDef {
  id: number;
  name: string;
  type: string;
  limit: string;
  info?: {
    desc: string;
    cost: { alloy: number; crystal: number; gold: number };
    time: string;
    req: string;
  };
}

export const buildingsData: BuildingDef[] = [
  { id: 1, name: 'Alliance Center', type: 'alliance', limit: '0/1' },
  { id: 2, name: 'Compounding Center', type: 'comp', limit: '0/1' },
  {
    id: 3, name: 'Technology Center', type: 'tech', limit: '0/1',
    info: {
      desc: 'Devoted to scientific advancement, these labs are essential for increasing research speed.\nImproves research time by 3%',
      cost: { alloy: 450, crystal: 420, gold: 650 },
      time: '00:01:40',
      req: 'Civic Center Lv: 1',
    },
  },
];
