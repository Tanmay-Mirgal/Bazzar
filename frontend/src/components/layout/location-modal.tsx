'use client';

import * as React from 'react';
import { MapPin, Navigation, Compass, Check, Search, Zap, X, Building2, ChevronRight } from 'lucide-react';
import { useUserLocationStore } from '@/store/user-location-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LOCATIONS = [
  { name: 'BKC, Mumbai', city: 'Mumbai', address: 'Bandra Kurla Complex, Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777, pincode: '400051', badge: '10-Min Dark Store' },
  { name: 'Indiranagar, Bengaluru', city: 'Bengaluru', address: '100 Feet Road, Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408, pincode: '560038', badge: '10-Min Dark Store' },
  { name: 'Connaught Place, New Delhi', city: 'New Delhi', address: 'Block A, Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167, pincode: '110001', badge: '15-Min Hub' },
  { name: 'Hitec City, Hyderabad', city: 'Hyderabad', address: 'Hitec City, Madhapur, Hyderabad', lat: 17.4474, lng: 78.3762, pincode: '500081', badge: '15-Min Hub' },
];

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const {
    locationName,
    formattedAddress,
    isLocating,
    isPermissionDenied,
    setLocation,
    detectCurrentLocation,
  } = useUserLocationStore();

  const [searchInput, setSearchInput] = React.useState('');

  const handleDetect = async () => {
    await detectCurrentLocation();
    onClose();
  };

  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setLocation(preset.lat, preset.lng, preset.address, preset.name, preset.pincode);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLocation(
      19.0760 + (Math.random() * 0.02 - 0.01),
      72.8777 + (Math.random() * 0.02 - 0.01),
      searchInput,
      searchInput.split(',')[0] || 'Selected Location',
      '400001'
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-white border border-gray-100 text-gray-900 shadow-2xl p-6 sm:p-7 rounded-3xl overflow-hidden">
        {/* Subtle Decorative Gradient Orb */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

        <DialogHeader className="space-y-2 relative z-10 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold text-[11px] uppercase tracking-wider w-fit shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 animate-pulse" />
            Hyperlocal Express Delivery
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Where should we deliver?
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            Get instant <span className="text-emerald-600 font-bold">10-15 minute delivery</span> directly from your nearest Bazzar dark store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 my-3 relative z-10">
          {/* GPS Auto Detect Button */}
          <Button
            onClick={handleDetect}
            disabled={isLocating}
            className="w-full h-12 bg-gray-900 hover:bg-emerald-600 text-white font-semibold shadow-md shadow-gray-900/10 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs sm:text-sm tracking-wide transform active:scale-98"
          >
            {isLocating ? (
              <>
                <Compass className="w-4 h-4 animate-spin text-emerald-400" />
                Detecting exact GPS coordinates...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                Use Current Location (Detect GPS)
              </>
            )}
          </Button>

          {isPermissionDenied && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-2xl text-center font-medium">
              Location permission denied. Please search your area or select a hub below.
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-gray-100 w-full" />
            <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              OR SEARCH AREA
            </span>
          </div>

          {/* Manual Address Input */}
          <form onSubmit={handleManualSubmit} className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search area, landmark or pincode..."
              className="bg-gray-50/80 border-gray-200 text-gray-900 pl-10 pr-20 h-11 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-xs sm:text-sm placeholder:text-gray-400 transition-all"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1.5 h-8 bg-gray-900 hover:bg-emerald-600 text-white text-xs px-3.5 rounded-xl font-medium transition-all"
            >
              Apply
            </Button>
          </form>

          {/* Popular Hubs Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Popular Quick-Commerce Hubs</span>
              <span className="text-emerald-600 font-semibold lowercase">4 stores live</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected = locationName === preset.name || locationName.includes(preset.city);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500/60 shadow-xs'
                        : 'bg-gray-50/50 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-gray-500 border border-gray-200/60 group-hover:text-emerald-600'
                      }`}>
                        <Building2 className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {preset.name}
                          </span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200/70 text-gray-600'
                          }`}>
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{preset.address}</p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Active Location Display */}
        <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl flex items-center justify-between text-xs text-gray-600 relative z-10">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate font-medium text-gray-800">
              <strong className="text-gray-900 font-semibold">{locationName}:</strong> {formattedAddress}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
