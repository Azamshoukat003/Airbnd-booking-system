import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '../../../../services/storageService';
import { HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const PhotoUpload = ({ onValidityChange, onDataChange }) => {
  const [photos, setPhotos] = useState([]); // Array of { id, url, name, size, file, publicId, secureUrl, isUploaded }
  const [category, setCategory] = useState("place");

  useEffect(() => {
    const loadData = async () => {
      try {
        const step1Data = await StorageService.getItem('step 1 host');
        if (step1Data && step1Data.placeType) {
          setCategory(step1Data.placeType.toLowerCase());
        }
        
        // Load the finalized uploaded photos if any
        const savedStep2 = await StorageService.getItem('step2');
        if (savedStep2 && savedStep2.photos) {
          setPhotos(savedStep2.photos.map((p, idx) => ({
            id: p.publicId || `uploaded-${idx}`,
            url: p.secureUrl,
            publicId: p.publicId,
            secureUrl: p.secureUrl,
            isUploaded: true,
            name: p.publicId
          })));
        } else {
            // Fallback to draft photos if no final upload yet
            const draftData = await StorageService.getItem('step 2 photos');
            if (draftData && draftData.photos) {
                setPhotos(draftData.photos);
            }
        }
      } catch (err) {
        console.error("Failed to load photo data:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Exactly 5 photos required for validity
    const isValid = photos.length === MAX_PHOTOS;
    onValidityChange?.(isValid);
    onDataChange?.({ 'step 2 photos': { photos } });
  }, [photos]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validNewPhotos = [];
    const errors = [];

    files.forEach(file => {
      // Duplicate detection based on name and size
      const isDuplicate = photos.some(p => p.name === file.name && p.size === file.size);
      if (isDuplicate) {
        errors.push(`${file.name} is already added.`);
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name} is not a valid format (PNG, JPG, or JPEG).`);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        errors.push(`${file.name} exceeds 2MB.`);
        return;
      }
      
      if (photos.length + validNewPhotos.length < MAX_PHOTOS) {
          validNewPhotos.push({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file), // Create preview URL
            name: file.name,
            size: file.size, // Store size for duplicate check
            file: file, // Store the actual file for upload
            isUploaded: false
          });
      } else {
        if (!errors.includes('Maximum 5 photos allowed.')) {
          errors.push('Maximum 5 photos allowed.');
        }
      }
    });

    if (errors.length > 0) {
      toast.error(errors[0], {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    }

    if (validNewPhotos.length > 0) {
      setPhotos(prev => [...prev, ...validNewPhotos]);
    }
    
    // Reset input
    e.target.value = '';
  };

  const removePhoto = (id) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === id);
      if (photoToRemove?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(photoToRemove.url);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const setAsCover = (id) => {
    setPhotos(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index <= 0) return prev;
      const newPhotos = [...prev];
      const [movedPhoto] = newPhotos.splice(index, 1);
      newPhotos.unshift(movedPhoto);
      return newPhotos;
    });
  };

  return (
    <div className="max-w-5xl w-full mx-auto md:px-4 py-4 overflow-y-auto no-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col"
      >
        <div className="mb-16">
          <h1 className="text-2xl md:text-3xl font-semibold text-secondary mb-1">
            Add some photos of your {category}
          </h1>
          <p className="text-[#6A6A6A] text-[10px] md:text-[12px]">  

            You'll need {MAX_PHOTOS} photos to get started. You can add more or make changes later. (max 2MB each) 
            <span className={`ml-2 font-semibold ${photos.length === 5 ? 'text-green-600' : 'text-primary'}`}>
              ({photos.length}/{MAX_PHOTOS})
            </span>
          </p>
        </div>

        {photos.length === 0 ? (
          /* Empty State / Upload Box */
          <div 
            className="flex-1 w-full border-2 border-dashed border-[#B0B0B0] rounded-2xl flex flex-col items-center justify-center bg-[#FCF8F5] cursor-pointer hover:border-primary transition-all duration-300 group min-h-[300px]"
            onClick={() => document.getElementById('photo-upload').click()}
          >
            <input 
              type="file" 
              id="photo-upload" 
              className="hidden" 
              multiple 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center text-center p-8 max-w-sm">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <img 
                  src="https://res.cloudinary.com/di9tb45rl/image/upload/v1769772458/Vector_wzfhc9.png" 
                  alt="Upload" 
                  loading='lazy'
                  className="w-10 h-10 object-contain"
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-secondary tracking-tight">
                  Upload your photos
                </h3>
                <p className="text-[#717171] text-sm md:text-base font-medium">
                  Drag and drop your photos here or
                </p>
                
                <div className="pt-4">
                  <span className="inline-flex items-center justify-center px-8 py-3 bg-secondary text-white text-sm font-bold rounded-xl shadow-lg shadow-secondary/10 hover:bg-black transition-all active:scale-95">
                    Choose photos
                  </span>
                </div>
                
                <p className="text-[10px] md:text-xs text-[#9c9c9c] pt-6 font-semibold uppercase tracking-widest">
                  PNG, JPG or JPEG • Max 2MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* "Professional" Grid Preview */
          <div className="flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 min-h-[400px]">
              {/* Main Large Image */}
              <div className="md:col-span-2 md:row-span-2 relative group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                {photos[0] ? (
                  <>
                    <img 
                      src={photos[0].url?.includes('cloudinary.com') ? photos[0].url.replace('/upload/', '/upload/q_auto,f_auto,w_800/') : photos[0].url} 
                      alt="Main room" 
                      loading='lazy'
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      onClick={() => removePhoto(photos[0].id)}
                      className="absolute top-3 left-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 z-10"
                    >
                      <HiOutlineX className="text-lg text-secondary" />
                    </button>
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/50 text-white text-xs font-semibold rounded-full backdrop-blur-sm">Cover photo</div>
                  </>
                ) : (
                   <EmptySlot index={0} onClick={() => document.getElementById('photo-upload').click()} />
                )}
              </div>

              {/* Smaller Images */}
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                  {photos[idx] ? (
                    <>
                      <img 
                        src={photos[idx].url?.includes('cloudinary.com') ? photos[idx].url.replace('/upload/', '/upload/q_auto,f_auto,w_400/') : photos[idx].url} 
                        alt={`View ${idx}`} 
                        loading="lazy"
                        className="w-full h-full object-cover"  
                      />
                      <button 
                        onClick={() => removePhoto(photos[idx].id)}
                        className="absolute top-2 left-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all active:scale-95 z-10"
                      >
                        <HiOutlineX className="text-base text-secondary" />
                      </button>
                      <button
                        onClick={() => setAsCover(photos[idx].id)}
                        className="absolute bottom-2 left-2 right-2 py-1.5 bg-white/90 hover:bg-white text-secondary text-[10px] font-semibold uppercase tracking-wider rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                      >
                        Set as cover
                      </button>
                    </>
                  ) : (
                    <EmptySlot index={idx} onClick={() => document.getElementById('photo-upload').click()} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Action Bar when photos exist but not complete */}
            {photos.length < MAX_PHOTOS && (
              <div className="flex justify-center mt-2">
                <button 
                  onClick={() => document.getElementById('photo-upload').click()}
                  className="flex items-center gap-2 px-6 py-2 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all text-sm"
                >
                  <HiOutlinePhotograph />
                  Add more photos
                </button>
                <input 
                  type="file" 
                  id="photo-upload" 
                  className="hidden" 
                  multiple 
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const EmptySlot = ({ index, onClick }) => (
  <div 
    onClick={onClick}
    className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/80 transition-all border-2 border-dashed border-gray-200"
  >
    <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
      <HiOutlinePhotograph className="text-gray-300 text-xl" />
    </div>
    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Add Photo {index + 1}</span>
  </div>
);

export default PhotoUpload;