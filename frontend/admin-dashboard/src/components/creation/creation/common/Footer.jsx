import React from "react";

const Footer = ({
  currentStep,
  onNext,
  onBack,
  isFirst,
  isLast,
  nextDisabled,
  backDisabled
}) => {
  return (
    <div className="w-full border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst || backDisabled}
          className={
            isFirst || backDisabled
              ? "px-4 py-2 rounded-full border border-black/5 text-sm font-semibold text-black/30"
              : "px-4 py-2 rounded-full border border-black/10 text-sm font-semibold text-black/70 hover:border-black/30"
          }
        >
          Back
        </button>

        <div className="text-xs text-black/50">Step {currentStep} of 4</div>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={
            nextDisabled
              ? "px-5 py-2 rounded-full bg-black/20 text-white text-sm font-semibold"
              : "px-5 py-2 rounded-full bg-black text-white text-sm font-semibold"
          }
        >
          {isLast ? "Publish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Footer;

