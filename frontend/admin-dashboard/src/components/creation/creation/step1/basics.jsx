import React, { useState, useEffect } from "react";
import { StorageService } from "../../../../services/storageService";
import { motion } from "framer-motion";
import { IoAdd, IoRemove } from "react-icons/io5";

const Counter = ({ label, value, onChange, min = 0 }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
    <span className="text-lg text-[#222222] font-normal">{label}</span>
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => value > min && onChange(value - 1)}
        className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center transition-all ${
          value <= min
            ? "opacity-30 cursor-not-allowed"
            : "hover:border-black active:scale-95"
        }`}
      >
        <IoRemove size={18} />
      </button>
      <span className="text-lg w-6 text-left tabular-nums">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black active:scale-95 transition-all"
      >
        <IoAdd size={18} />
      </button>
    </div>
  </div>
);

const Step1Basics = ({ onValidityChange, onDataChange }) => {
  const [basics, setBasics] = useState({
    guests: 0,
    bedrooms: 0,
    beds: 0,
    hasLock: null,
  });

  // Load from SQLite on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await StorageService.getItem("step 1 host");
        if (savedData && savedData["hotel basics"]) {
          setBasics(savedData["hotel basics"]);
        } else if (savedData && savedData.basics) {
          setBasics(savedData.basics);
        }
      } catch (err) {
        console.error("Failed to load basics data from SQLite:", err);
      }
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    // Validation: At least 1 for each count and lock must be selected (true or false)
    const isValid =
      basics.guests >= 1 &&
      basics.bedrooms >= 1 &&
      basics.beds >= 1 &&
      basics.hasLock !== null;
    onValidityChange?.(isValid);

    // Save to parent/persistence
    onDataChange?.({
      "step 1 host": {
        basics: basics,
        "hotel basics": basics,
      },
    });
  }, [basics, onValidityChange, onDataChange]);

  const updateCount = (key, val) => {
    setBasics((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="max-w-xl w-full mx-auto py-6 pt-2 md:pt-6 md:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-[#222222] mb-7">
          Let's start with the basics
        </h1>

        <div className="mb-12">
          <h2 className="text-md font-medium text-[#222222] mb-4">
            How many people can stay here?
          </h2>
          <div className="flex flex-col">
            <Counter
              label="Guests"
              value={basics.guests}
              onChange={(v) => updateCount("guests", v)}
            />
            <Counter
              label="Bedrooms"
              value={basics.bedrooms}
              onChange={(v) => updateCount("bedrooms", v)}
            />
            <Counter
              label="Beds"
              value={basics.beds}
              onChange={(v) => updateCount("beds", v)}
            />
          </div>
        </div>

        <div>
          <h2 className="text-md font-medium text-[#222222] mb-6">
            Does every bedroom have a lock?
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="hasLock"
                  checked={basics.hasLock === true}
                  onChange={() =>
                    setBasics((prev) => ({ ...prev, hasLock: true }))
                  }
                  className="w-6 h-6 appearance-none border-2 border-gray-300 rounded-full checked:border-black transition-all cursor-pointer"
                />
                {basics.hasLock === true && (
                  <div className="absolute w-3 h-3 bg-black rounded-full" />
                )}
              </div>
              <span className="text-lg text-[#222222]">Yes</span>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative mt-1 flex items-center justify-center">
                <input
                  type="radio"
                  name="hasLock"
                  checked={basics.hasLock === false}
                  onChange={() =>
                    setBasics((prev) => ({ ...prev, hasLock: false }))
                  }
                  className="w-6 h-6 appearance-none border-2 border-gray-300 rounded-full checked:border-black transition-all cursor-pointer"
                />
                {basics.hasLock === false && (
                  <div className="absolute w-3 h-3 bg-black rounded-full" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-lg text-[#222222]">No</span>
                <p className="text-gray-500 text-sm mt-1 max-w-full leading-relaxed">
                  Guests expect a lock for their room. We strongly recommend
                  adding one.{" "}
                  <span className=" font-medium text-[#222222] cursor-pointer">
                    Learn more
                  </span>
                </p>
              </div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Step1Basics;
