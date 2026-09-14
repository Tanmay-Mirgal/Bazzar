'use client';

import * as React from 'react';
import { MapPin, Navigation, Compass, Check, Search, Zap, Loader2, ChevronRight, X } from 'lucide-react';
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

interface SearchLocationResult {
  place_id: number;
  lat: number;
  lng: number;
  title: string;
  formattedAddress: string;
  pincode: string;
}

const DEFAULT_QUICK_LOCATIONS = [
  { title: 'Sewri, Mumbai', address: 'Sewri East & West, Mumbai, Maharashtra 400015', lat: 18.9986, lng: 72.8550, pincode: '400015' },
  { title: 'Dadar, Mumbai', address: 'Dadar West, Mumbai, Maharashtra 400028', lat: 19.0178, lng: 72.8478, pincode: '400028' },
  { title: 'BKC, Mumbai', address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051', lat: 19.0760, lng: 72.8777, pincode: '400051' },
  { title: 'Lower Parel, Mumbai', address: 'Lower Parel West, Mumbai, Maharashtra 400013', lat: 18.9950, lng: 72.8300, pincode: '400013' },
  { title: 'Powai, Mumbai', address: 'Powai Tech Park, Hiranandani, Mumbai 400076', lat: 19.1176, lng: 72.9060, pincode: '400076' },
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
  const [searchResults, setSearchResults] = React.useState<SearchLocationResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Live Reverse Geocoding / Address Search with Nominatim OpenStreetMap
  React.useEffect(() => {
    if (!searchInput.trim() || searchInput.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchInput.trim();
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=in&limit=6`
        );

        if (res.ok) {
          const data = await res.json();
          const mapped: SearchLocationResult[] = data.map((item: any) => {
            const addr = item.address || {};
            const mainName =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.city_district ||
              addr.town ||
              addr.city ||
              item.display_name.split(',')[0];
            
            const city = addr.city || addr.town || addr.state_district || 'Mumbai';

            return {
              place_id: item.place_id,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              title: `${mainName}, ${city}`,
              formattedAddress: item.display_name,
              pincode: addr.postcode || '',
            };
          });
          setSearchResults(mapped);
        }
      } catch (err) {
        console.error('Location search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDetect = async () => {
    await detectCurrentLocation();
    onClose();
  };

  const handleSelectLocation = (loc: { lat: number; lng: number; address: string; name: string; pincode?: string }) => {
    setLocation(loc.lat, loc.lng, loc.address, loc.name, loc.pincode || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-100 text-gray-900 shadow-2xl p-6 sm:p-7 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

        <DialogHeader className="space-y-2 relative z-10 text-left shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider w-fit">
            <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 animate-pulse" />
            Hyperlocal Delivery Engine
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
            Where should we deliver?
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            Get instant <strong className="text-emerald-700 font-extrabold">10-15 minute delivery</strong> directly from your nearest Bazzar dark store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 relative z-10 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {/* GPS Auto Detect Button */}
          <Button
            onClick={handleDetect}
            disabled={isLocating}
            className="w-full h-12 bg-[#111111] hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs sm:text-sm tracking-wide shadow-md shadow-gray-900/10 transform active:scale-98 cursor-pointer"
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
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-2xl text-center font-semibold">
              Location permission denied. Please search your area below.
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search area, landmark (e.g. Sewri, Dadar, BKC)..."
              className="bg-[#F9F9F8] border-gray-200 text-gray-900 pl-10 pr-10 h-11 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-xs sm:text-sm placeholder:text-gray-400 transition-all font-medium"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results OR Quick Area Recommendations */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-wider">
              <span>{searchInput.trim() ? 'Matching Search Results' : 'Suggested Delivery Locations'}</span>
              {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />}
            </div>

            {/* If searching and no results */}
            {searchInput.trim().length > 1 && !isSearching && searchResults.length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center text-xs text-gray-500">
                No matching locations found for "<strong className="text-gray-900">{searchInput}</strong>". Try typing area or city name (e.g. Sewri, Mumbai).
              </div>
            )}

            {/* Render Live Search Results */}
            {searchInput.trim().length > 1 && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((res) => {
                  const isSelected = locationName === res.title || formattedAddress === res.formattedAddress;
                  return (
                    <button
                      key={res.place_id}
                      type="button"
                      onClick={() =>
                        handleSelectLocation({
                          lat: res.lat,
                          lng: res.lng,
                          address: res.formattedAddress,
                          name: res.title,
                          pincode: res.pincode,
                        })
                      }
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-xs'
                          : 'bg-[#F9F9F8] border-gray-200/70 hover:border-emerald-400 hover:bg-emerald-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-emerald-600 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-extrabold text-[#111111] group-hover:text-emerald-700 transition-colors block truncate">
                            {res.title}
                          </span>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">{res.formattedAddress}</p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isSelected ? (
                          <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render Default Quick Suggestions when searchInput is empty */}
            {!searchInput.trim() && (
              <div className="space-y-2">
                {DEFAULT_QUICK_LOCATIONS.map((loc) => {
                  const isSelected = locationName === loc.title || (locationName && locationName.includes(loc.title.split(',')[0]));
                  return (
                    <button
                      key={loc.title}
                      type="button"
                      onClick={() =>
                        handleSelectLocation({
                          lat: loc.lat,
                          lng: loc.lng,
                          address: loc.address,
                          name: loc.title,
                          pincode: loc.pincode,
                        })
                      }
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-xs'
                          : 'bg-[#F9F9F8] border-gray-200/70 hover:border-emerald-400 hover:bg-emerald-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-gray-500 border border-gray-200 group-hover:text-emerald-600'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-extrabold text-[#111111] group-hover:text-emerald-700 transition-colors block truncate">
                            {loc.title}
                          </span>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">{loc.address}</p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isSelected ? (
                          <span className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Selected Location Banner */}
        <div className="mt-3 pt-3 border-t border-gray-100 shrink-0 relative z-10">
          <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-2xl flex items-center gap-3 text-xs text-emerald-950">
            <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Selected Address:</span>
              </div>
              <p className="font-extrabold text-emerald-950 truncate text-xs mt-0.5">
                {locationName || 'BKC, Mumbai'}
                <span className="font-medium text-emerald-800/80 text-[11px]"> - {formattedAddress || 'Bandra Kurla Complex, Mumbai'}</span>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
