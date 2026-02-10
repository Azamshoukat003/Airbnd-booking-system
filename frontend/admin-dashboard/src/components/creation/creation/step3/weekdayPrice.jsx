import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  HiOutlinePencil,
  HiChevronDown,
  HiX,
  HiLocationMarker,
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { StorageService } from "../../../../services/storageService";
import api from "../../../../api/axios";
import toast from "react-hot-toast";

const WeekdayPrice = ({ onValidityChange, onDataChange }) => {
  const [basePrice, setBasePrice] = useState(19);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showListingsModal, setShowListingsModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [tempPrice, setTempPrice] = useState(19);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const dropdownRef = useRef(null);

  const GUEST_MARKUP_PERCENT = 15.8;
  const HOST_FEE_PERCENT = 3;

  const guestPrice = Math.round(basePrice * (1 + GUEST_MARKUP_PERCENT / 100));
  const hostEarns = Math.round(basePrice * (1 - HOST_FEE_PERCENT / 100));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowBreakdown(false);
      }
    };

    if (showBreakdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBreakdown]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await StorageService.getItem("step 3 weekday price");
        if (savedData && savedData.price) {
          setBasePrice(Number(savedData.price));
          setTempPrice(Number(savedData.price));
        } else {
          // Set initial values according to image
          setBasePrice(19);
          setTempPrice(19);
        }
      } catch (err) {
        console.error("Failed to load weekday price:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    onValidityChange?.(basePrice >= 10 && basePrice <= 10000000);
    onDataChange?.({
      "step 3 weekday price": {
        price: basePrice,
        guestPrice,
        hostEarns,
      },
    });
  }, [basePrice]);

  const fetchListings = async () => {
    setIsLoadingListings(true);
    setShowListingsModal(true);
    try {
      const response = await api.get("/public/listings");
      if (response.data && response.data.data) {
        setListings(response.data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch similar listings");
      console.error(err);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const handleSelectListing = (listing) => {
    const selectedPrice = Number(listing.weekdayPrice) || 150;
    setBasePrice(selectedPrice);
    setTempPrice(selectedPrice);
    setShowListingsModal(false);
    toast.success(
      `Price updated to $${selectedPrice} based on "${listing.title}"`,
      {
        style: { borderRadius: "12px", background: "#222222", color: "#fff" },
      },
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredListings = listings.filter(
    (listing) =>
      (listing.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.category || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredListings.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="w-full max-w-4xl mx-auto md:px-6 flex flex-col items-center justify-center min-h-[70vh] text-left pt-6 md:pt-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-16 w-full max-w-2xl"
      >
        <h1 className="text-2xl md:text-[32px] font-semibold text-[#222222] tracking-tight text-left">
          Now, set a weekday base price
        </h1>
        <p className="text-[#717171] text-base md:text-lg text-left mt-2">
          Tip: $19. You'll set a weekend price next.
        </p>
      </motion.div>

      {/* Main Price Display */}
      <div className="relative mb-2 w-full max-w-2xl px-4">
        <div className="flex items-center justify-center gap-2 md:gap-5">
          <span className="text-6xl sm:text-8xl md:text-[130px] font-semibold text-[#222222] tracking-tighter">
            ${basePrice.toLocaleString()}
          </span>
          <button
            onClick={() => {
              setTempPrice(basePrice.toString());
              setShowPriceModal(true);
            }}
            className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full border border-gray-200 hover:border-gray-800 hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm"
          >
            <HiOutlinePencil className="text-base md:text-lg text-[#222222]" />
          </button>
        </div>
      </div>

      {/* Guest Price Breakdown Toggle */}
      <div className="relative flex flex-col items-center" ref={dropdownRef}>
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
                  <span className="text-[#717171]">Base price</span>
                  <span className="font-normal text-[#222222]">
                    ${basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-[#717171]">Guest service fee</span>
                  <span className="font-normal text-[#222222]">
                    $
                    {Math.round(
                      basePrice * (GUEST_MARKUP_PERCENT / 100),
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#222222] text-[16px]">
                      Guest price
                    </span>
                    <span className="font-semibold text-[#222222] text-[16px]">
                      ${guestPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-[12px] text-[#717171] leading-[1.5] pt-1">
                  This is the price guests will see (excluding taxes). It's
                  calculated by adding a service fee to your base price.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Section */}
      <div className="mt-12 md:mt-auto py-10 mb-6 flex flex-col items-center gap-5 w-full">
        <button
          onClick={fetchListings}
          className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 rounded-full hover:border-[#222222] hover:shadow-md transition-all group"
        >
          <img
            src="https://res.cloudinary.com/di9tb45rl/image/upload/v1769793047/Frame_bc75li.png"
            alt="pin"
            className="w-5 h-5 object-contain"
            loading='lazy'
          />
          <span className="font-semibold text-[#222222] text-[15px]">
            View similar listings
          </span>
        </button>
        <button className="text-[#717171]  font-medium text-[13px] hover:text-[#222222] transition-colors tracking-wide">
          Learn more about pricing
        </button>
      </div>

      {/* Modals & Portals */}
      {createPortal(
        <AnimatePresence>
          {showPriceModal && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div
                key="price-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                // Removed onClick to satisfy "should not be close when click outside"
              />
              <motion.div
                key="price-modal"
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#222222]">
                    Set base price
                  </h2>
                  <p className="text-[#717171] text-[15px]">
                    This is your price before guest fees and taxes.
                  </p>
                </div>

                <div className="relative bg-[#F7F7F7] rounded-3xl p-6 border-2 border-transparent focus-within:border-[#222222] transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-semibold text-[#222222]">
                      $
                    </span>
                    <input
                      type="text"
                      value={
                        tempPrice === ""
                          ? ""
                          : Number(tempPrice).toLocaleString("en-US")
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        if (val.length <= 8) {
                          setTempPrice(val);
                        }
                      }}
                      className="w-full text-5xl font-semibold text-[#222222] bg-transparent outline-none appearance-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowPriceModal(false);
                      setTempPrice(basePrice);
                    }}
                    className="flex-1 py-4 px-6 border border-gray-300 rounded-2xl font-bold text-[#222222] hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const val = Number(tempPrice);
                      if (val >= 10 && val <= 10000000) {
                        setBasePrice(val);
                        setShowPriceModal(false);
                      } else if (val < 10) {
                        toast.error("Price must be at least $10");
                      } else {
                        toast.error("Price cannot exceed $10,000,000");
                      }
                    }}
                    className="flex-1 py-4 px-6 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showListingsModal && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div
                key="listings-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowListingsModal(false)}
              />
              <motion.div
                key="listings-modal"
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className="relative bg-white rounded-[32px] w-full max-w-6xl max-h-[85vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.25)] overflow-hidden"
              >
                <div className="px-4 md:px-10 py-6 md:py-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between bg-white sticky top-0 z-20 gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-[#222222]">
                      Compare listings
                    </h2>
                    <p className="text-[#717171] text-xs md:text-sm mt-0.5">
                      Select a listing to use its price as a benchmark.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                      <input
                        type="text"
                        placeholder="Search by title, city or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <button
                      onClick={() => setShowListingsModal(false)}
                      className="p-3 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
                    >
                      <HiX className="text-2xl text-[#222222]" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-10 py-8 bg-[#F7F7F7]">
                  {isLoadingListings ? (
                    <div className="h-80 flex items-center justify-center flex-col gap-6">
                      <div className="w-12 h-12 border-[5px] border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[#717171] font-medium text-lg">
                        Fetching similar listings...
                      </p>
                    </div>
                  ) : currentItems.length === 0 ? (
                    <div className="h-80 flex items-center justify-center flex-col gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <HiSearch className="text-2xl text-gray-400" />
                      </div>
                      <p className="text-[#717171] text-lg font-medium text-center">
                        {searchQuery
                          ? `No results found for "${searchQuery}"`
                          : "No similar listings found in this area."}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-primary font-semibold "
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                      {currentItems.map((listing) => (
                        <motion.div
                          key={listing.id}
                          whileHover={{ y: -8 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          onClick={() => handleSelectListing(listing)}
                          className="group cursor-pointer bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all flex flex-col border border-transparent hover:border-[#222222]"
                        >
                          <div className="aspect-[4/3] relative overflow-hidden bg-gray-200">
                            {listing.photos && listing.photos[0] ? (
                              <img
                                src={listing.photos[0].secureUrl}
                                alt={listing.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <HiLocationMarker className="text-4xl" />
                              </div>
                            )}
                            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-xl text-lg font-bold text-[#222222] shadow-sm">
                              ${listing.weekdayPrice || 150}
                            </div>
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-[#222222]/80 backdrop-blur rounded-lg text-[10px] uppercase font-bold text-white tracking-widest">
                                {listing.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-7 space-y-3">
                            <h4 className="font-bold text-[#222222] text-lg line-clamp-1 leading-tight">
                              {listing.title}
                            </h4>
                            <p className="text-[#717171] text-[14px] line-clamp-2 leading-relaxed h-[42px]">
                              {listing.description}
                            </p>
                            <div className="pt-3 flex items-center gap-3 text-[13px] text-[#A1642E] font-bold">
                              <span className="bg-[#A1642E]/5 px-2 py-1 rounded-md">
                                {listing.guests} guests
                              </span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="bg-[#A1642E]/5 px-2 py-1 rounded-md">
                                {listing.beds} beds
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-4 md:px-10 py-6 border-t border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center sticky bottom-0 z-20 gap-6">
                  <div className="flex items-center gap-4 order-2 md:order-1">
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-black disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
                        >
                          <HiChevronLeft className="text-xl" />
                        </button>

                        <div className="flex items-center gap-1">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                                currentPage === i + 1
                                  ? "bg-black text-white"
                                  : "hover:bg-gray-100 text-[#222222]"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-black disabled:opacity-30 disabled:hover:border-gray-200 transition-all"
                        >
                          <HiChevronRight className="text-xl" />
                        </button>
                      </div>
                    )}
                    <p className="text-[#717171] text-sm hidden lg:block ml-4">
                      Showing {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, filteredListings.length)} of{" "}
                      {filteredListings.length} listings
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto order-1 md:order-2">
                    <button
                      onClick={() => setShowListingsModal(false)}
                      className="flex-1 md:flex-none px-10 py-4 bg-[#222222] text-white font-bold rounded-2xl hover:bg-black transition-colors active:scale-95 shadow-lg"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

export default WeekdayPrice;
