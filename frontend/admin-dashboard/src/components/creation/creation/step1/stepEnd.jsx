import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StorageService } from '../../../../services/storageService';

const Card = ({ label, icon, isSelected, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      flex flex-col p-5 rounded-xl border-2 transition-all text-left w-full h-full min-h-[120px] justify-between
      ${isSelected 
        ? 'border-[#B08968] bg-[#F7F7F7] ring-0' 
        : 'border-gray-200 hover:border-[#B08968] bg-white'}
    `}
  >
    <div className="flex items-center justify-start mb-4">
      {icon ? (
        <img 
          src={icon?.includes('cloudinary.com') ? icon.replace('/upload/', '/upload/q_auto,f_auto,w_64/') : icon} 
          alt={label} 
          className="w-8 h-8 object-contain" 
          loading="lazy"
        />
      ) : (
        <span className="text-3xl font-bold text-[#222222] leading-none">
          {label === 'Me' ? '-' : '.'}
        </span>
      )}
    </div>
    <span className="text-[17px] font-medium text-[#222222]">{label}</span>
  </motion.button>
);

const Step1End = ({ onValidityChange, onDataChange }) => {
  const [selection, setSelection] = useState('Me');

  useEffect(() => {
    // Restore data from SQLite on mount
    const restoreData = async () => {
      try {
        const savedData = await StorageService.getItem('step 1 host');
        if (savedData && savedData.whoElse) {
          setSelection(savedData.whoElse);
        }
      } catch (err) {
        console.error("Failed to restore whoElse data:", err);
      }
    };
    restoreData();
  }, []);

  useEffect(() => {
    // Always valid once something is selected (and it defaults to 'Me')
    onValidityChange?.(true);
    
    onDataChange?.({
      'step 1 host': {
        whoElse: selection
      }
    });
  }, [selection, onValidityChange, onDataChange]);

  const cards = [
    { label: 'Me', icon: null },
    { label: 'My family', icon: 'https://res.cloudinary.com/di9tb45rl/image/upload/v1769606512/l_d_4985_ju2yhq.png' },
    { label: 'Other guests', icon: 'https://res.cloudinary.com/di9tb45rl/image/upload/v1769606334/l_d_5095_hrsdys.png' },
    { label: 'Roommates', icon: null }
  ];

  return (
    <div className="max-w-3xl w-full mx-auto pb-10 md:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-[#222222] mb-1 leading-tight">
          Who else might be there?
        </h1>
        <p className="text-[#6A6A6A] text-[17px] mb-12 leading-relaxed">
          Guests need to know whether they'll encounter other people during their stay.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-14">
          {cards.map((card) => (
            <div key={card.label} className="h-full">
              <Card
                label={card.label}
                icon={card.icon}
                isSelected={selection === card.label}
                onClick={() => setSelection(card.label)}
              />
            </div>
          ))}
        </div>

        <p className="text-[#6A6A6A] text-[15px] font-normal">
          We'll show this information on your listing and in search results.
        </p>
      </motion.div>
    </div>
  );
};

export default Step1End;