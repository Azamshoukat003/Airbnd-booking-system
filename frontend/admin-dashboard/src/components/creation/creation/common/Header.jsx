import React from "react";

const Header = ({ onSaveAndExit }) => {
  return (
    <div className="w-full border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">Unit creation</p>
          <h2 className="text-xl font-semibold text-secondary">Create a new unit</h2>
        </div>
        <button
          type="button"
          onClick={() => onSaveAndExit?.()}
          className="px-4 py-2 rounded-full border border-black/10 text-sm font-semibold text-black/70 hover:border-black/30"
        >
          Save & Exit
        </button>
      </div>
    </div>
  );
};

export default Header;
