import React from 'react';
import { AppTab } from '../types/game';

interface HeaderNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onDeploy: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onTabChange,
  onDeploy
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => onTabChange('MATCH')}
        className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display hover:text-amber-400 transition-colors cursor-pointer text-left"
      >
        Outbreak Syndicate
      </button>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
        <button
          onClick={() => onTabChange('MATCH')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'MATCH' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          Combat Match
        </button>
        <button
          onClick={() => onTabChange('MAP')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'MAP' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          Tactical Map
        </button>
        <button
          onClick={() => onTabChange('GUNSMITH')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'GUNSMITH' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          Gunsmith
        </button>
        <button
          onClick={() => onTabChange('DOSSIER')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'DOSSIER' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          Threat Dossier
        </button>
        <button
          onClick={() => onTabChange('CONTRACTS')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'CONTRACTS' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
          }`}
        >
          Contracts
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onDeploy}
          className="px-4 py-2 text-xs font-semibold text-black bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 font-mono uppercase tracking-wider shadow-sm"
        >
          Deploy Match
        </button>
      </div>
    </header>
  );
};
