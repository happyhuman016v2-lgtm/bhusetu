import React from 'react';
import { Role } from '../types';
import { Map, ShieldCheck, UserCheck, Database, Award } from 'lucide-react';

interface Props {
  activeRole: Role;
  onRoleChange: (role: Role) => void;
  onOpenRegistryModal: () => void;
  totalParcelsCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeRole,
  onRoleChange,
  onOpenRegistryModal,
  totalParcelsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#C85A32] text-white shadow-md border-b border-[#A94424]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Hackathon Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
            <Map className="w-6 h-6 text-[#FBF9F5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
                BhuSetu
                <span className="text-[11px] font-semibold bg-[#23201F] text-[#FAF7F2] px-2 py-0.5 rounded-full ml-2">
                  HackITon '26
                </span>
              </span>
            </div>
            <p className="text-[11px] text-[#F3ECE2] font-medium hidden sm:block">
              Bharat Unified Land Stack • KPR Institute of Engineering and Technology
            </p>
          </div>
        </div>

        {/* Center / Right: Role Switcher & Ingestion Button */}
        <div className="flex items-center gap-3">
          {/* Mock Registry Trigger */}
          <button
            onClick={onOpenRegistryModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white/95 border border-white/15 text-xs font-semibold transition-colors"
            title="Import or simulate RoR Land Registry Data"
          >
            <Database className="w-3.5 h-3.5 text-amber-300" />
            <span>Mock Registry ({totalParcelsCount} Plots)</span>
          </button>

          {/* Role Switcher Pills */}
          <div className="bg-[#23201F] p-1 rounded-xl flex items-center shadow-inner border border-black/20">
            <button
              onClick={() => onRoleChange('citizen')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'citizen'
                  ? 'bg-[#C85A32] text-white shadow-sm'
                  : 'text-[#FAF7F2]/70 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => onRoleChange('officer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'officer'
                  ? 'bg-[#C85A32] text-white shadow-sm'
                  : 'text-[#FAF7F2]/70 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Officer Portal</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
