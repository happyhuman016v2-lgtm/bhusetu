import React from 'react';
import { NearestRevenueOffice } from '../types';
import { Building2, User, Phone, Mail, Clock, ShieldAlert, MapPin, ExternalLink } from 'lucide-react';

interface Props {
  office: NearestRevenueOffice;
  parcelLocation: string;
}

export const NearestOfficeCard: React.FC<Props> = ({ office, parcelLocation }) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${office.officeName}, ${office.address}`
  )}`;

  return (
    <div className="bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-start justify-between gap-3 border-b border-[#E7DFD5] pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center text-[#C85A32]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-[#23201F] leading-tight">{office.officeName}</h4>
              <span className="text-[11px] font-medium bg-[#E7DFD5] text-[#383432] px-2 py-0.5 rounded-full">
                {office.distanceKm} km away
              </span>
            </div>
            <p className="text-xs text-[#6B6360] mt-0.5">{office.jurisdiction}</p>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#C85A32] hover:text-[#A94424] font-medium inline-flex items-center gap-1 hover:underline"
          title="Open in Google Maps"
        >
          <span>Map</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Officer in Charge */}
      <div className="bg-white/80 rounded-lg p-3 border border-[#E7DFD5] mb-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#276728]/10 text-[#276728] flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#23201F] truncate">{office.officerName}</p>
            <p className="text-[11px] text-[#276728] font-medium leading-tight">{office.designation}</p>
            <p className="text-[11px] text-[#6B6360] mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C85A32] shrink-0" />
              <span className="truncate">{office.address}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Phone & Email */}
        <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-gray-100">
          <a
            href={`tel:${office.phone.replace(/[^0-9+]/g, '')}`}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-[#276728]/10 text-[#276728] hover:bg-[#276728]/20 transition-colors text-xs font-medium"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Office</span>
          </a>
          <a
            href={`mailto:${office.email}?subject=Inquiry regarding Parcel at ${encodeURIComponent(parcelLocation)}`}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-[#C85A32]/10 text-[#C85A32] hover:bg-[#C85A32]/20 transition-colors text-xs font-medium"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Official</span>
          </a>
        </div>
      </div>

      {/* Office Timings & Grievance */}
      <div className="space-y-1.5 text-[11px] text-[#6B6360]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span>Grievance Hours: <strong className="text-[#383432]">{office.grievanceHours}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
          <span>Toll-Free Grievance Helpline: <strong className="text-[#383432]">{office.emergencyHelpline}</strong></span>
        </div>
      </div>
    </div>
  );
};
