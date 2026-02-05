import React, { createContext, useContext, useState } from 'react';
import { DateRange } from 'react-day-picker';

export interface UnitSummary {
  id: string;
  name: string;
  description: string | null;
  nightly_rate_usd: number;
  max_guests: number;
  image_urls: string[] | null;
}

interface BookingContextValue {
  units: UnitSummary[];
  setUnits: (units: UnitSummary[]) => void;
  selectedUnit: UnitSummary | null;
  setSelectedUnit: (unit: UnitSummary | null) => void;
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  blockedDates: string[];
  setBlockedDates: (dates: string[]) => void;
  lastSyncAt: string | null;
  setLastSyncAt: (value: string | null) => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitSummary | null>(null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  return (
    <BookingContext.Provider
      value={{
        units,
        setUnits,
        selectedUnit,
        setSelectedUnit,
        range,
        setRange,
        blockedDates,
        setBlockedDates,
        lastSyncAt,
        setLastSyncAt
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within BookingProvider');
  }
  return context;
}
