import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import { StorageService } from '../../../../services/storageService';

const WeekendPrice = ({ onValidityChange, onDataChange }) => {
  const [weekdayBasePrice, setWeekdayBasePrice] = useState(19);
  const [premiumPercentage, setPremiumPercentage] = useState(8);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const dropdownRef = useRef(null);

  // Constants matching previous step logic
  const GUEST_MARKUP_PERCENT = 15.8;
  const HOST_FEE_PERCENT = 3;

  // Calculations
  const weekendBasePrice = Math.round(weekdayBasePrice * (1 + premiumPercentage / 100));
  const guestPrice = Math.round(weekendBasePrice * (1 + GUEST_MARKUP_PERCENT / 100));
  const hostEarns = Math.round(weekendBasePrice * (1 - HOST_FEE_PERCENT / 100));

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get weekday price from storage to calculate weekend base
        const step3Data = await StorageService.getItem('step3');
        if (step3Data && step3Data.weekdayPrice) {
          setWeekdayBasePrice(Number(step3Data.weekdayPrice));
        }

        const savedData = await StorageService.getItem('step 3 weekend price');
        if (savedData && savedData.percentage !== undefined) {
          setPremiumPercentage(Number(savedData.percentage));
        }
      } catch (err) {
        console.error("Failed to load weekend price data:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    onValidityChange?.(true); // Percentage is always valid (0-99)
    onDataChange?.({ 
      'step 3 weekend price': { 
        percentage: premiumPercentage,
        basePrice: weekendBasePrice,
        guestPrice: guestPrice,
        hostEarns: hostEarns
      } 
    });
  }, [premiumPercentage, weekendBasePrice, guestPrice, hostEarns]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBreakdown(false);
      }
    };
    if (showBreakdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBreakdown]);

  return (
    <div className="w-full max-w-4xl mx-auto md:px-6 flex flex-col items-center justify-center min-h-[70vh] text-left pt-6 md:pt-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-10 w-full max-w-2xl"
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-[#222222] tracking-tight text-left">
          Set a weekend price
        </h1>
        <p className="text-[#717171] text-base md:text-lg text-left mt-2">
          Add a premium for Fridays and Saturdays.
        </p>
      </motion.div>

      {/* Main Price Display */}
      <div className="relative mb-2 w-full max-w-2xl px-4">
        <div className="flex items-center justify-center">
          <span className="text-6xl sm:text-8xl md:text-[130px] font-semibold text-[#222222] tracking-tighter">
            ${weekendBasePrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Guest Price Breakdown Toggle */}
      <div className="relative flex flex-col items-center mb-20" ref={dropdownRef}>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="group flex items-center gap-2 text-[#484848] text-[15px] md:text-[16px] font-normal hover:bg-gray-50 px-4 py-2 rounded-full border border-transparent hover:border-gray-100 transition-all"
        >
          <span>Guest price before taxes ${guestPrice.toLocaleString()}</span>
          <motion.div
            animate={{ rotate: showBreakdown ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <HiChevronDown className="text-lg text-[#717171] group-hover:text-[#222222]" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute bottom-full mb-2 bg-white border border-gray-100 rounded-[24px] p-8 w-[320px] md:w-[360px] text-left shadow-[0_12px_42px_rgba(0,0,0,0.16)] z-[20]"
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-[#717171]">Weekend base price</span>
                  <span className="font-normal text-[#222222]">${weekendBasePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-[#717171]">Guest service fee</span>
                  <span className="font-normal text-[#222222]">${Math.round(weekendBasePrice * (GUEST_MARKUP_PERCENT/100)).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#222222] text-[16px]">Guest price</span>
                    <span className="font-semibold text-[#222222] text-[16px]">${guestPrice.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-[12px] text-[#717171] leading-[1.5] pt-1">
                  This is the price guests will see for weekend stays. It includes your premium and the guest service fee.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slider Section */}
      <div className="w-full max-w-[500px] mt-12 md:mt-auto pt-10 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h3 className="text-[17px] font-semibold text-[#222222]">Weekend premium</h3>
            <p className="text-[#717171] text-[15px]">Tip: Try 8%</p>
          </div>
          <div className="w-[80px] ml-0 h-[54px] border border-gray-200 rounded-[12px] flex items-center justify-center text-[18px] font-semibold text-[#222222] focus-within:border-[#222222] transition-all bg-white shadow-sm overflow-hidden">
            <input
              type="text"
              value={premiumPercentage}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val === '') {
                  setPremiumPercentage(0);
                } else {
                  const num = parseInt(val);
                  if (num <= 99) setPremiumPercentage(num);
                }
              }}
              className="w-[25px] text-left outline-none bg-transparent pr-0.5"
            />
            <span className="text-[#222222] pr-1">%</span>
          </div>
        </div>

        <div className="relative h-10 flex items-center">
          <input
            type="range"
            min="0"
            max="99"
            value={premiumPercentage}
            onChange={(e) => setPremiumPercentage(Number(e.target.value))}
            className="w-full h-[6px] bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#222222]"
            style={{
                background: `linear-gradient(to right, #222222 0%, #222222 ${premiumPercentage}%, #E5E7EB ${premiumPercentage}%, #E5E7EB 100%)`
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-[#717171] font-medium">0%</span>
          <span className="text-[11px] text-[#717171] font-medium">99%</span>
        </div>
      </div>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border: 1px solid #DDDDDD;
          box-shadow: 0 2px 4px rgba(0,0,0,0.18);
          border-radius: 50%;
          cursor: grab;
          margin-top: -9px;
        }
        input[type='range']::-webkit-slider-thumb:active {
          cursor: grabbing;
        }
        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: white;
          border: 1px solid #DDDDDD;
          box-shadow: 0 2px 4px rgba(0,0,0,0.18);
          border-radius: 50%;
          cursor: grab;
        }
        input[type='range']::-moz-range-thumb:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default WeekendPrice;