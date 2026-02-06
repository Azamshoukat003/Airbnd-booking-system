import React, { useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import {
  addMonths,
  differenceInCalendarDays,
  format,
  startOfDay,
  startOfMonth,
} from "date-fns";
import "react-day-picker/dist/style.css";

type Props = { guests?: number };

function useIsLg() {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsLg(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isLg;
}

type GuestState = {
  adults: number;
  children: number;
  infants: number;
  pets: number;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const DatePicker: React.FC<Props> = ({ guests = 1 }) => {
  const isLg = useIsLg();

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addMonths(today, 3), [today]);
  const minMonth = useMemo(() => startOfMonth(today), [today]);
  const maxMonth = useMemo(() => startOfMonth(maxDate), [maxDate]);

  const disabledDays = useMemo(
    () => [{ before: today }, { after: maxDate }],
    [today, maxDate],
  );

  const [range, setRange] = useState<DateRange | undefined>();
  const [month, setMonth] = useState<Date>(minMonth);

  const [guestOpen, setGuestOpen] = useState(false);
  const guestRef = useRef<HTMLDivElement | null>(null);

  const [guestState, setGuestState] = useState<GuestState>({
    adults: guests,
    children: 0,
    infants: 0,
    pets: 0,
  });

  useEffect(() => {
    if (!guestOpen) return;

    const onDown = (e: MouseEvent) => {
      if (!guestRef.current) return;
      if (!guestRef.current.contains(e.target as Node)) setGuestOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [guestOpen]);

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return differenceInCalendarDays(range.to, range.from);
  }, [range]);

  const hasValidDates = !!range?.from && !!range?.to && nights >= 1;

  const title = useMemo(() => {
    if (hasValidDates) return `${nights} night${nights > 1 ? "s" : ""}`;
    if (range?.from && !range?.to) return "Select checkout date";
    return "Select check-in date";
  }, [range, nights, hasValidDates]);

  const prevDisabled = useMemo(() => {
    const prev = startOfMonth(
      new Date(month.getFullYear(), month.getMonth() - 1, 1),
    );
    return prev < minMonth;
  }, [month, minMonth]);

  const nextDisabled = useMemo(() => {
    const next = startOfMonth(
      new Date(month.getFullYear(), month.getMonth() + 1, 1),
    );
    return next > maxMonth;
  }, [month, maxMonth]);

  const goPrev = () => {
    const prev = startOfMonth(
      new Date(month.getFullYear(), month.getMonth() - 1, 1),
    );
    if (prev < minMonth) return;
    setMonth(prev);
  };

  const goNext = () => {
    const next = startOfMonth(
      new Date(month.getFullYear(), month.getMonth() + 1, 1),
    );
    if (next > maxMonth) return;
    setMonth(next);
  };

  const handleMonthChange = (m: Date) => {
    const mStart = startOfMonth(m);
    if (mStart < minMonth) setMonth(minMonth);
    else if (mStart > maxMonth) setMonth(maxMonth);
    else setMonth(mStart);
  };

  const handleSelect = (next: DateRange | undefined) => {
    if (!next) {
      setRange(undefined);
      return;
    }

    if (
      next.from &&
      next.to &&
      differenceInCalendarDays(next.to, next.from) < 1
    ) {
      setRange({ from: next.from, to: undefined });
      return;
    }

    if (next.from && (next.from < today || next.from > maxDate)) return;
    if (next.to && (next.to < today || next.to > maxDate)) {
      setRange({ from: next.from, to: undefined });
      return;
    }

    setRange(next);
  };

  const totalGuests = guestState.adults + guestState.children;
  const guestLabel = `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`;

  const MAX_GUESTS = 2;
  const canAddGuest = totalGuests < MAX_GUESTS;

  const updateAdults = (delta: number) => {
    setGuestState((s) => {
      const next = { ...s };
      next.adults = clamp(next.adults + delta, 1, MAX_GUESTS);
      const tg = next.adults + next.children;
      if (tg > MAX_GUESTS)
        next.children = clamp(MAX_GUESTS - next.adults, 0, MAX_GUESTS);
      return next;
    });
  };

  const updateChildren = (delta: number) => {
    setGuestState((s) => {
      const next = { ...s };
      if (delta > 0 && !canAddGuest) return s;
      next.children = clamp(next.children + delta, 0, MAX_GUESTS);
      const tg = next.adults + next.children;
      if (tg > MAX_GUESTS)
        next.children = clamp(MAX_GUESTS - next.adults, 0, MAX_GUESTS);
      return next;
    });
  };

  const updateInfants = (delta: number) => {
    setGuestState((s) => ({ ...s, infants: clamp(s.infants + delta, 0, 5) }));
  };

  const updatePets = (delta: number) => {
    setGuestState((s) => ({ ...s, pets: clamp(s.pets + delta, 0, 2) }));
  };

  const CounterRow = ({
    title,
    subtitle,
    value,
    onMinus,
    onPlus,
    disableMinus,
    disablePlus,
  }: {
    title: string;
    subtitle: string;
    value: number;
    onMinus: () => void;
    onPlus: () => void;
    disableMinus?: boolean;
    disablePlus?: boolean;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-neutral-500">{subtitle}</div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMinus}
          disabled={disableMinus}
          className="h-8 w-8 rounded-full border border-neutral-300 grid place-items-center disabled:opacity-30"
        >
          –
        </button>
        <span className="w-4 text-center">{value}</span>
        <button
          type="button"
          onClick={onPlus}
          disabled={disablePlus}
          className="h-8 w-8 rounded-full border border-neutral-300 grid place-items-center disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between max-w-[700px] mb-5">
        <div>
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Add your travel dates for exact pricing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={prevDisabled}
            className="h-10 w-10 rounded-full text-2xl hover:bg-neutral-100 grid place-items-center disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={nextDisabled}
            className="h-10 w-10 rounded-full text-2xl hover:bg-neutral-100 grid place-items-center disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 mx-auto">
          <DayPicker
            mode="range"
            month={month}
            onMonthChange={handleMonthChange}
            numberOfMonths={isLg ? 2 : 1}
            selected={range}
            onSelect={handleSelect}
            disabled={disabledDays}
            showOutsideDays
            hideNavigation
            style={
              {
                "--rdp-accent-color": "#000000",
                "--rdp-accent-color-dark": "#000000",
                "--rdp-background-color": "#E5E7EB",
              } as React.CSSProperties
            }
            classNames={{
              months: isLg ? "flex gap-14" : "flex",
              month: "w-full max-w-[360px]",
              caption: "flex items-center justify-center h-12 mb-2",
              caption_label: "text-base font-semibold",
              table: "w-full",
              head_row: "flex",
              head_cell:
                "w-10 text-center text-xs text-neutral-500 font-medium",
              row: "flex mt-2",
              cell: "w-10 h-10 flex items-center justify-center relative",
              day: "h-10 w-10 rounded-full hover:bg-neutral-200 text-sm",
              day_outside: "text-neutral-300",
              day_disabled:
                "text-neutral-300 opacity-40 line-through decoration-1 decoration-neutral-400 cursor-not-allowed",
              day_selected: "bg-black text-white hover:bg-black",
              day_range_start: "bg-black text-white hover:bg-black",
              day_range_end: "bg-black text-white hover:bg-black",
              day_range_middle:
                "bg-neutral-200 text-black rounded-none hover:bg-neutral-200",
            }}
          />

          <button
            type="button"
            onClick={() => setRange(undefined)}
            className="mt-6 underline font-semibold text-sm"
          >
            Clear dates
          </button>
        </div>

        <div className="w-full lg:w-[380px]">
          <div className="rounded-2xl border border-neutral-200 shadow-sm p-6">
            <h4 className="text-xl font-semibold">Add dates for prices</h4>

            <div
              className="mt-4 rounded-xl border border-neutral-400 overflow-hidden"
              ref={guestRef}
            >
              <div className="grid grid-cols-2">
                <div className="p-3 border-r border-neutral-400">
                  <div className="text-[10px] font-semibold uppercase">
                    Check-in
                  </div>
                  <div className="text-sm">
                    {range?.from
                      ? format(range.from, "MM/dd/yyyy")
                      : "Add date"}
                  </div>
                </div>

                <div className="p-3">
                  <div className="text-[10px] font-semibold uppercase">
                    Checkout
                  </div>
                  <div className="text-sm">
                    {range?.to ? format(range.to, "MM/dd/yyyy") : "Add date"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGuestOpen((v) => !v)}
                className="w-full border-t border-neutral-400 p-3 flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="text-[10px] font-semibold uppercase">
                    Guests
                  </div>
                  <div className="text-sm">
                    {guestLabel}
                    {guestState.infants > 0
                      ? `, ${guestState.infants} infant${guestState.infants > 1 ? "s" : ""}`
                      : ""}
                    {guestState.pets > 0
                      ? `, ${guestState.pets} pet${guestState.pets > 1 ? "s" : ""}`
                      : ""}
                  </div>
                </div>
                <span className="text-lg">{guestOpen ? "▴" : "▾"}</span>
              </button>

              {guestOpen && (
                <div className="border-t border-neutral-200 bg-white p-4">
                  <CounterRow
                    title="Adults"
                    subtitle="Age 13+"
                    value={guestState.adults}
                    onMinus={() => updateAdults(-1)}
                    onPlus={() => updateAdults(+1)}
                    disableMinus={guestState.adults <= 1}
                    disablePlus={guestState.adults >= MAX_GUESTS}
                  />
                  <CounterRow
                    title="Children"
                    subtitle="Ages 2–12"
                    value={guestState.children}
                    onMinus={() => updateChildren(-1)}
                    onPlus={() => updateChildren(+1)}
                    disableMinus={guestState.children <= 0}
                    disablePlus={!canAddGuest}
                  />
                  <CounterRow
                    title="Infants"
                    subtitle="Under 2"
                    value={guestState.infants}
                    onMinus={() => updateInfants(-1)}
                    onPlus={() => updateInfants(+1)}
                    disableMinus={guestState.infants <= 0}
                    disablePlus={guestState.infants >= 5}
                  />
                  <CounterRow
                    title="Pets"
                    subtitle="Bringing a service animal?"
                    value={guestState.pets}
                    onMinus={() => updatePets(-1)}
                    onPlus={() => updatePets(+1)}
                    disableMinus={guestState.pets <= 0}
                    disablePlus={guestState.pets >= 2}
                  />

                  <div className="mt-3 text-xs text-neutral-600">
                    This place has a maximum of {MAX_GUESTS} guests, not
                    including infants. Pets aren&apos;t allowed.
                  </div>

                  <button
                    type="button"
                    onClick={() => setGuestOpen(false)}
                    className="mt-4 w-full text-right underline font-semibold text-sm"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!hasValidDates}
              className={[
                "mt-5 w-full rounded-full py-4 font-semibold text-white",
                hasValidDates
                  ? "bg-neutral-900 hover:brightness-95"
                  : "bg-neutral-300 cursor-not-allowed",
              ].join(" ")}
            >
              {hasValidDates ? "Reserve" : "Please select dates"}
            </button>

            {hasValidDates && (
              <p className="mt-4 text-center text-sm text-neutral-600">
                You won&apos;t be charged yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
