"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mockFacilities } from "@/lib/mockFacilities";
import type { Facility, FacilityType } from "@/lib/types";
import { ChevronDown, LocateFixed, Search, Filter, MapPin, Crosshair, CheckCircle } from "lucide-react";

const facilityTypeOptions: string[] = [
  "Private Hospital",
  "PNC",
  "Clinic",
  "Jan Aushadhi Kendra",
  "Health Centers"
];

const ALL_FACILITIES_VALUE = "all";
const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946, zoom: 12 };

export default function MapWithFacilities() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(facilityTypeOptions);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(mockFacilities);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [searchingNearby, setSearchingNearby] = useState(false);

  // Store all fetched facilities in localStorage for persistence and fast filtering
  const [allFacilities, setAllFacilities] = useState<Facility[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('allFacilities');
      if (stored) return JSON.parse(stored);
    }
    return mockFacilities;
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = L.map(mapRef.current).setView([
      userLocation?.lat || DEFAULT_LOCATION.lat,
      userLocation?.lng || DEFAULT_LOCATION.lng
    ], DEFAULT_LOCATION.zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(mapInstanceRef.current);
  }, []);

  // On mount, sync filteredFacilities with allFacilities
  useEffect(() => {
    setFilteredFacilities(allFacilities);
  }, [allFacilities]);

  // Helper to get filtered facilities based on selectedTypes, always from allFacilities
  const getFilteredFacilities = () => {
    if (selectedTypes.length === 0) return [];
    // Fix: cast string to FacilityType for getFacilityTypeLabel
    const selectedLabels = selectedTypes.map(type => getFacilityTypeLabel(type as FacilityType));
    if (selectedLabels.length === facilityTypeOptions.length) return allFacilities;
    return allFacilities.filter(facility => selectedLabels.includes(getFacilityTypeLabel(facility.type)));
  };

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer(layer => {
      if ((layer as any)._icon) mapInstanceRef.current?.removeLayer(layer);
    });
    // User marker
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
          shadowSize: [41, 41]
        })
      })
        .addTo(mapInstanceRef.current)
        .bindPopup("Your Location");
    }
    // Only show filtered facilities as pins
    getFilteredFacilities().forEach(facility => {
      const isSelected = selectedFacilities.includes(facility.id);
      let iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
      if (isSelected) {
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";
      }
      L.marker([facility.lat, facility.lng], {
        icon: L.icon({
          iconUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
          shadowSize: [41, 41]
        })
      })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`<b>${facility.name}</b><br/>${facility.address}`);
    });
  }, [userLocation, filteredFacilities, selectedFacilities, selectedTypes]);

  // Handler to find nearby facilities within 11km using real-world data
  const handleFindNearbyFacilities = useCallback(async () => {
    if (!userLocation) return;
    setSearchingNearby(true);
    // Use Nominatim to search for medical facilities within 11km
    const types = [
      "hospital",
      "clinic",
      "pharmacy",
      "doctors",
      "health_care",
      "dentist"
    ];
    // Compose the Overpass QL query for all types
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"~"${types.join('|')}"](around:11000,${userLocation.lat},${userLocation.lng});
        way["amenity"~"${types.join('|')}"](around:11000,${userLocation.lat},${userLocation.lng});
        relation["amenity"~"${types.join('|')}"](around:11000,${userLocation.lat},${userLocation.lng});
      );
      out center;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const facilities: Facility[] = (data.elements || []).map((el: any, idx: number) => {
        const lat = el.lat || (el.center && el.center.lat);
        const lng = el.lon || (el.center && el.center.lon);
        return {
          id: el.id ? String(el.id) : String(idx),
          name: el.tags && (el.tags.name || el.tags["operator"] || el.tags["brand"] || "Medical Facility"),
          type: el.tags && el.tags.amenity ? el.tags.amenity.charAt(0).toUpperCase() + el.tags.amenity.slice(1) : "Medical Facility",
          address: el.tags && (el.tags["addr:full"] || el.tags["addr:street"] || ""),
          lat,
          lng,
          phone: el.tags && el.tags.phone,
          email: el.tags && el.tags.email,
          website: el.tags && el.tags.website,
          services: el.tags && el.tags.healthcare ? [el.tags.healthcare] : [],
        };
      }).filter(fac => fac.lat && fac.lng);
      // Sort by distance
      facilities.sort((a, b) =>
        getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, a.lat, a.lng) -
        getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
      );
      setFilteredFacilities(facilities);
      setAllFacilities(facilities);
      localStorage.setItem('allFacilities', JSON.stringify(facilities));
      if (mapInstanceRef.current && facilities.length > 0) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13, { animate: true });
      }
    } catch (e) {
      setFilteredFacilities([]);
      setAllFacilities([]);
      localStorage.removeItem('allFacilities');
    }
    setSearchingNearby(false);
  }, [userLocation, selectedTypes]);

  // Search bar handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    // Use Nominatim API for geocoding
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      mapInstanceRef.current?.setView([parseFloat(lat), parseFloat(lon)], 15, { animate: true });
    }
  };

  // User location handler
  const handleUserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      localStorage.setItem("userLocation", JSON.stringify({ lat: latitude, lng: longitude }));
      mapInstanceRef.current?.setView([latitude, longitude], 15, { animate: true });
    });
  };

  // Toggle facility selection
  const handleSelectFacility = useCallback((id: string) => {
    setSelectedFacilities(prev =>
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  }, []);

  // Helper: Haversine formula to calculate distance in km
  function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  const NEARBY_RADIUS_KM = 5; // You can adjust this radius as needed

  function getFacilityTypeLabel(type: FacilityType) {
    if (type === "PHC") return "Health Centers";
    if (type === "Clinic") return "Clinic";
    if (type === "Private Hospital") return "Hospital";
    if (type === "Jan Aushadhi Kendra") return "Jan Aushadhi Kendra";
    return type;
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* Left Panel - Map & Controls */}
      <div className="flex-1 min-w-[350px]">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <Button type="submit" variant="outline" className="hidden sm:flex">
                Search
              </Button>
            </form>
            <Button 
              type="button" 
              onClick={handleUserLocation} 
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              <LocateFixed className="mr-2 h-4 w-4" />
              My Location
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Facility Types
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-4 z-[100] bg-white shadow-xl rounded-xl">
                <h4 className="font-medium mb-3">Filter Facilities</h4>
                <div className="space-y-3">
                  {facilityTypeOptions.map(type => (
                    <div key={type} className="flex items-center gap-3">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={checked => {
                          setSelectedTypes(prev =>
                            checked
                              ? [...prev, type]
                              : prev.filter(t => t !== type)
                          );
                        }}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm cursor-pointer select-none">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTypes(facilityTypeOptions)}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedTypes([])}
                  >
                    Clear
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
              onClick={handleFindNearbyFacilities}
              disabled={!userLocation || selectedTypes.length === 0 || searchingNearby}
            >
              <Crosshair className="h-4 w-4" />
              {searchingNearby ? "Searching..." : "Find Nearby (11km)"}
            </Button>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border shadow-lg relative h-[500px]">
          <div ref={mapRef} className="w-full h-full z-10" />
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg text-sm shadow-md">
            {userLocation 
              ? "Viewing facilities near you" 
              : "Search or use your location"}
          </div>
        </div>
      </div>
      {/* Right Panel - Facilities List */}
      <div className="w-full lg:w-[400px]">
        <Card className="h-full rounded-xl shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle>Nearby Facilities</CardTitle>
              <Badge variant="secondary" className="px-2 py-1">
                {getFilteredFacilities().length} found
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-300px)] lg:h-[500px] overflow-y-auto">
              {getFilteredFacilities().length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No facilities found</h3>
                  <p className="text-muted-foreground text-sm">
                    {selectedTypes.length === 0
                      ? "Select facility types to display"
                      : "Try adjusting your filters or search location"}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {getFilteredFacilities().map(facility => {
                    const isSelected = selectedFacilities.includes(facility.id);
                    return (
                      <div
                        key={facility.id}
                        className={`p-4 transition-all cursor-pointer hover:bg-muted/50 ${
                          isSelected ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                        }`}
                        onClick={() => handleSelectFacility(facility.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{facility.name}</h3>
                              <Badge variant="secondary">
                                {getFacilityTypeLabel(facility.type)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">
                              {facility.address}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {facility.phone && (
                            <Badge variant="outline" className="font-normal">
                              📞 {facility.phone}
                            </Badge>
                          )}
                          {facility.services?.slice(0, 3).map((service, i) => (
                            <Badge key={i} variant="outline" className="font-normal">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
