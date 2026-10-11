import React from 'react';
import { GameContract } from '../types/game';
import { DEFAULT_CONTRACTS } from '../data/gameData';
import { sound } from '../audio/soundEngine';
import { Crosshair, DollarSign, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ContractsViewProps {
  activeContract: GameContract | null;
  onSelectContract: (contract: GameContract) => void;
  onCancelContract: () => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  activeContract,
  onSelectContract,
  onCancelContract
}) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">
            Dynamic Match Contracts & Bounties
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Accept high-risk contracts mid-match to earn cash for Underground Buy Station loadouts.
          </p>
        </div>

        {activeContract && (
          <button
            onClick={onCancelContract}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-rose-800/40 text-xs font-mono rounded transition-colors"
          >
            Abandon Contract
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEFAULT_CONTRACTS.map((contract) => {
          const isActive = activeContract?.id === contract.id;
          const isCompleted = activeContract?.id === contract.id && activeContract.completed;

          return (
            <div
              key={contract.id}
              className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                isActive
                  ? 'bg-neutral-800 border-amber-500 shadow-xl ring-1 ring-amber-500/50'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                    {contract.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-400 font-mono text-sm font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span className="tabular-nums">+{contract.reward.toLocaleString()}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mt-2 leading-snug">
                  {contract.title}
                </h3>

                <p className="text-xs text-neutral-400 mt-1">
                  Target: <span className="text-neutral-200">{contract.targetName}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{contract.timeLimit}s LIMIT</span>
                </div>

                {isCompleted ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> COMPLETED
                  </span>
                ) : isActive ? (
                  <span className="text-amber-400 font-bold animate-pulse">
                    ACTIVE CONTRACT
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      sound.playCashChime();
                      onSelectContract(contract);
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition-colors text-xs"
                  >
                    Accept Bounty
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
