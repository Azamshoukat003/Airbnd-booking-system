import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from 'react-leaflet';
import { IoLocationOutline } from 'react-icons/io5';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StorageService } from '../../../../services/storageService';

// Custom Black Marker Icon
const blackPinSvg = `
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="black"/>
  </svg>
`;

const customIcon = L.divIcon({
  html: blackPinSvg,
  className: 'custom-pin-icon',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

const mapBounds = [
  [-90, -180],
  [90, 180]
];

const Step1Location1 = ({ onValidityChange, onDataChange }) => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [countriesGeoJSON, setCountriesGeoJSON] = useState(null);
  const [highlightedCountryCode, setHighlightedCountryCode] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualForm, setManualForm] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zip: ''
  });
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isPasteRef = useRef(false);

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json')
      .then(res => setCountriesGeoJSON(res.data))
      .catch(err => console.error('Failed to load countries GeoJSON', err));
  }, []);

  // Restore from SQLite
  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await StorageService.getItem('step 1 host');
        if (saved && saved.location) {
          setAddress(saved.location.fullAddress || '');
          setSelectedAddress(saved.location);
          if (saved.location.manualEntry) {
            setManualMode(true);
            setManualForm({
              street: saved.location.street || '',
              city: saved.location.city || '',
              state: saved.location.state || '',
              country: saved.location.country || '',
              zip: saved.location.zipCode || ''
            });
          }
          if (saved.location.countryCode) {
            setHighlightedCountryCode(saved.location.countryCode.toUpperCase());
          }
        }
      } catch (err) {
        console.error('Failed to restore location:', err);
      }
    };
    restore();
  }, []);

  const [isTouched, setIsTouched] = useState(false); // New touched state

  // ... (effects)

  // Validation Logic
  useEffect(() => {
    let currentError = '';
    // Relaxed validation: check for minimal required data to consider it a "location"
    // If we have lat, lon, and country, we generally accept it for the map.
    const hasMinimalData = manualMode
      ? manualForm.street && manualForm.city && manualForm.country
      : selectedAddress && selectedAddress.country && selectedAddress.lat && selectedAddress.lon;
    
    // We strictly check validity for the parent component ('Next' button enable/disable)
    const isValid = !!hasMinimalData;

    onValidityChange?.(isValid);

    // UX: Only display error messages to the user if they have finished interacting (blurred/touched)
    // AND the data is invalid.
    if (isTouched) {
      if (manualMode) {
        if (!hasMinimalData) {
          currentError = 'Please fill in street, city, and country.';
        }
      } else if (address.length > 0 && !selectedAddress) {
        currentError = 'Please select an address from the suggestions';
      } else if (selectedAddress) {
         if (!selectedAddress.country) currentError = 'Country is required';
         // We can be less pedantic about city/state if we have coordinates and country, 
         // as not all places have clear "city" tags in OpenStreetMap/Nominatim.
      }
      setError(currentError);
    } else {
      // Clear error if not touched, or if a valid selection was just made
      setError('');
    }

    // Always update parent data if we have a provisional or final selection
    if (manualMode) {
      const parts = [
        manualForm.street,
        manualForm.city,
        manualForm.state,
        manualForm.country,
        manualForm.zip
      ].filter(Boolean);
      const combined = parts.join(', ');

      onDataChange?.({
        'step 1 host': {
          location: {
            fullAddress: combined,
            street: manualForm.street || '',
            city: manualForm.city || '',
            state: manualForm.state || '',
            country: manualForm.country || '',
            zipCode: manualForm.zip || '',
            lat: null,
            lon: null,
            manualEntry: true
          }
        }
      });
    } else if (selectedAddress) {
       const { city, state, country, postcode } = selectedAddress;
       // Construct a displayable string even if fields are missing
       const parts = [city, state, country, postcode].filter(Boolean);
       const combined = parts.length > 0 ? parts.join(', ') : selectedAddress.fullAddress;
       
       onDataChange?.({ 
        'step 1 host': { 
          location: {
            ...selectedAddress,
            fullAddress: combined,
            city: city || '',
            state: state || '',
            country: country || '',
            zipCode: postcode || ''
          } 
        } 
      });
    }
  }, [
    selectedAddress,
    address,
    isTouched,
    manualMode,
    manualForm,
    onValidityChange,
    onDataChange
  ]);

  // Input sanitizer to remove "Suite", "Apt", etc. which break OSM geocoders
  const cleanAddressInput = (input) => {
    // Regex to remove common unit designators at start of string or after comma
    return input
      .replace(/^(?:suite|apt|unit|floor|room)\s+#?\w+[\s,]+/i, '') // Start of string
      .replace(/,\s*(?:suite|apt|unit|floor|room)\s+#?\w+/gi, '')   // Middle of string
      .replace(/\s+#\w+/g, '') // Remove items like "#900"
      .trim();
  };

  // Helper to map Photon (Komoot) GeoJSON result to our internal format
  const mapPhotonResultToAddress = (feature) => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates; // [lon, lat]
    
    // Attempt to map various Photon fields to our schema
    const countryCode = props.countrycode?.toUpperCase();
    
    // Construct full address from available parts if name is not sufficient
    // Photon often puts the house number/street in 'name' or 'street'
    const name = props.name || '';
    const street = props.street || '';
    const housenumber = props.housenumber || '';
    
    let fullAddr = name;
    if (street && name !== street) fullAddr += `, ${street}`;
    if (props.city) fullAddr += `, ${props.city}`;
    else if (props.town) fullAddr += `, ${props.town}`;
    else if (props.village) fullAddr += `, ${props.village}`;
    
    if (props.state) fullAddr += `, ${props.state}`;
    if (props.postcode) fullAddr += `, ${props.postcode}`;
    if (props.country) fullAddr += `, ${props.country}`;

    return {
      fullAddress: fullAddr, // Or use the constructed one
      street: street || name || '',
      city: props.city || props.town || props.village || props.county || '',
      state: props.state || '',
      country: props.country || '',
      countryCode: countryCode, 
      postcode: props.postcode || '', 
      continent: null, // We'll compute this if needed or leave null
      lat: coords[1],
      lon: coords[0]
    };
  };

  const handleSearch = (val) => {
    setAddress(val);
    setSelectedAddress(null); // Reset selection on new input

    // Clear previous timeout
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!val || val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce API call
    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      setIsTouched(false);
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const cleanedVal = cleanAddressInput(val);
        const res = await axios.get(`https://photon.komoot.io/api/`, {
          params: {
            q: cleanedVal,
            limit: 6,
            lang: 'en'
          },
          signal: abortControllerRef.current.signal
        });

        const features = res.data.features || [];
        const mappedSuggestions = features.map(f => {
           const mapped = mapPhotonResultToAddress(f);
           return {
              ...f,
              display_name: mapped.fullAddress,
              address: { 
                  road: mapped.street,
                  city: mapped.city,
                  state: mapped.state,
                  country: mapped.country,
                  postcode: mapped.postcode,
                  country_code: mapped.countryCode 
              },
              lat: mapped.lat,
              lon: mapped.lon,
              mappedObject: mapped 
           };
        });

        setSuggestions(mappedSuggestions);
        
        // Auto-select if it was a paste action
        if (isPasteRef.current && mappedSuggestions.length > 0) {
             const topResult = mappedSuggestions[0];
             const finalSelection = topResult.mappedObject;
             
             setSelectedAddress(finalSelection);
             if (finalSelection.countryCode) {
               setHighlightedCountryCode(finalSelection.countryCode);
             }
             setShowSuggestions(false);
             isPasteRef.current = false; // Reset paste flag
        } else if (mappedSuggestions.length > 0) {
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
          setHighlightedCountryCode(null);
          // If paste failed to find results, reset flag
          isPasteRef.current = false;
        }

      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Search failed', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 500); // Wait for 500ms before fetching
  };

  const handleBlur = () => {
    setIsTouched(true); // User left the field, now we can validate strictness
    
    // Snap to the full formatted address if we have a valid selection
    if (selectedAddress) {
      setAddress(selectedAddress.fullAddress);
    }
  };

  const handleManualChange = (field, value) => {
    setManualForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const selectSuggestion = (sug) => {
    // Explicitly handle the selection logic to ensure click works
    // For Photon, we already mapped it in the search phase
    let mapped = sug.mappedObject;
    
    // Safety check just in case
    if (!mapped) {
        // Fallback if needed, though mostly unused now
        mapped = mapPhotonResultToAddress(sug);
    }
    
    // Add continent info
    const continent = getContinentFromAddress({ country_code: mapped.countryCode });
    mapped.continent = continent;

    // Commit selection
    setAddress(mapped.fullAddress);
    setSelectedAddress(mapped);
    if (mapped.countryCode) {
      setHighlightedCountryCode(mapped.countryCode);
    }
    
    // Clear suggestions and UI states
    setShowSuggestions(false);
    setIsTouched(false); 
    setError(''); 
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countryStyle = (feature) => {
    const countryCode = feature.properties.ISO_A2 || feature.properties.iso_a2;
    const isHighlighted = countryCode === highlightedCountryCode;
    
    const colors = ['#A3D9A5', '#F9E79F', '#F5CBA7', '#F1948A', '#AED6F1', '#D2B4DE', '#A2D9CE'];
    const name = feature.properties.NAME || "";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];

    return {
      fillColor: isHighlighted ? '#A1642E' : color,
      weight: 0.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: isHighlighted ? 0.9 : 0.8
    };
  };

  return (
    <div className="w-full h-full flex flex-col items-center md:px-4">
      <div className="w-full max-w-4xl text-left mb-8">
        <h1 className="text-2xl md:text-2xl font-semibold text-[#222222]">
          Where's your place located?
        </h1>
        <p className="text-[#6A6A6A] text-[15px] mt-2 font-normal">
          Your address is only shared with guests after they've made a reservation.
        </p>
      </div>

      <div className="relative w-full max-w-4xl h-[420px] md:h-[520px] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
        {/* Map Container */}
        <div className="absolute inset-0 z-0 bg-[#AAD3DF]">
          <MapContainer 
            center={[20, 10]} 
            zoom={1.8} 
            minZoom={1.5}
            maxBounds={mapBounds}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
            zoomSnap={0.1}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            dragging={false}
            touchZoom={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            attributionControl={false}
          >
             
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
              noWrap={true}
              bounds={mapBounds}
            />
            {countriesGeoJSON && (
              <GeoJSON 
                key={highlightedCountryCode || 'none'}
                data={countriesGeoJSON} 
                style={countryStyle}
              />
            )}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
              noWrap={true}
              bounds={mapBounds}
            />
          </MapContainer>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6" ref={searchRef}>
          <div className="relative">
            <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 px-5 py-3.5">
              <IoLocationOutline className="text-xl text-[#222222] mr-3" />
              <input 
                type="text"
                placeholder="Enter Address..."
                value={address}
                onChange={(e) => handleSearch(e.target.value)}
                onPaste={() => { isPasteRef.current = true; }}
                onBlur={handleBlur}
                autoComplete="off"
                className="w-full text-base font-normal text-[#222222] focus:outline-none bg-transparent"
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setManualMode((prev) => !prev);
                  setShowSuggestions(false);
                  setSelectedAddress(null);
                  setIsTouched(true);
                }}
                className="text-xs font-semibold text-primary hover:text-primary/80"
              >
                {manualMode ? 'Use search suggestions instead' : 'Enter address manually'}
              </button>
            </div>

            {manualMode && (
              <div className="mt-4 grid gap-3 bg-white/95 border border-gray-100 rounded-2xl p-4 shadow-lg">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">Street</label>
                    <input
                      type="text"
                      value={manualForm.street}
                      onChange={(e) => handleManualChange('street', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">City</label>
                    <input
                      type="text"
                      value={manualForm.city}
                      onChange={(e) => handleManualChange('city', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">State</label>
                    <input
                      type="text"
                      value={manualForm.state}
                      onChange={(e) => handleManualChange('state', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">Country</label>
                    <input
                      type="text"
                      value={manualForm.country}
                      onChange={(e) => handleManualChange('country', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">ZIP</label>
                    <input
                      type="text"
                      value={manualForm.zip}
                      onChange={(e) => handleManualChange('zip', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {!manualMode && showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[350px] overflow-y-auto"
                >
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(sug);
                      }}
                      className="w-full text-left px-5 py-4 hover:bg-gray-50 flex flex-col border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
                    >
                      <span className="text-[14px] font-semibold text-[#222222] leading-tight mb-1">
                        {sug.display_name}
                      </span>
                      <div className="flex flex-wrap gap-x-2 text-[12px] text-[#717171]">
                        {sug.address.road && <span>{sug.address.road},</span>}
                        {sug.address.city && <span>{sug.address.city},</span>}
                        {sug.address.state && <span>{sug.address.state},</span>}
                        {sug.address.postcode && <span className="text-primary font-medium">ZIP: {sug.address.postcode},</span>}
                        <span>{sug.address.country}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-3 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-medium flex items-center shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Location1;










