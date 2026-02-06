import React, { useMemo, useState } from "react";
import ImageShowcase from "../components/ImageShowcase";
import AmenitiesSection from "../components/AmenitiesSection";
import DynamicModal from "../components/DynamicModal";
import DatePicker from "../components/DatePicker";

type OpenModal = "amenities" | "about" | null;

const UnitDetailPage = () => {
  const [openModal, setOpenModal] = useState<OpenModal>(null);

  const data = {
    heading: "Entire rental unit in Asunción, Paraguay",
    options: ["2 guests", "1 bedroom ", "1 bed ", " 1 bath"],
    description:
      "We inform you that between October 27 and December 20 of the current year, construction work will be carried out in specific sectors of the building.During this period, there may be movement of construction personnel and noise from the work, especially during the day.We assure you that all necessary measures are being taken to minimize inconvenience and maintain safety and order in the common areas.We thank you in advance for your understanding and cooperation during this process, which aims to improve the facilities to provide a better level of comfort to all our guests.",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    ],
    offer: [
      {
        img: "https://www.freeiconspng.com/uploads/fork-kitchen-knife-icon-7.png",
        title: "Kitchen",
      },
      {
        img: "https://www.freeiconspng.com/thumbs/wifi-icon/3d-black-wifi-icon-9.png",
        title: "Wifi",
      },
      {
        img: "https://www.freeiconspng.com/uploads/furniture-home-indoor-interior-office-pc-place-table-work-icon-27.png",
        title: "Dedicated workspace",
      },
      {
        img: "https://cdn-icons-png.flaticon.com/512/3103/3103446.png",
        title: "Pool",
      },
      {
        img: "https://cdn-icons-png.flaticon.com/512/869/869636.png",
        title: "Washer",
      },
      {
        img: "https://cdn-icons-png.flaticon.com/512/1946/1946488.png",
        title: "Paid parking on premises",
      },
      {
        img: "https://cdn-icons-png.flaticon.com/512/3075/3075908.png",
        title: "Carbon monoxide alarm",
        available: false,
      },
    ],
    aboutModal: {
      title: "About this space",
      sectionHeading: "The space",
      subheading: "Notice of Construction Work at Zentrum Stay & Residences",
    },
    amenitiesModal: {
      title: "What this place offers",
      shortDescription: "",
    },
  };
  const descriptionParagraphs = useMemo(() => {
    return data.description.split(/(?<=\.)\s+(?=[A-Z])/g).filter(Boolean);
  }, [data.description]);

  const amenitySections = useMemo(() => {
    return [
      {
        heading: "Essentials",
        items: data.offer.slice(0, 4),
      },
      {
        heading: "Other",
        items: data.offer.slice(4),
      },
    ];
  }, [data.offer]);

  const totalAmenities = useMemo(() => data.offer.length, [data.offer]);

  return (
    <div className="p-4 lg:px-10">
      <ImageShowcase images={data?.images} />
      <h2 className="text-2xl font-semibold mt-5 ">{data.heading}</h2>
      <div className="flex flex-wrap text-lg mt-3">
        {data.options.map((e, index) => (
          <React.Fragment key={e}>
            <p>{e}</p>

            {index !== data.options.length - 1 && (
              <span className="mx-2">·</span>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-2">
        <p className="text-neutral-500 line-clamp-3">{data.description}</p>

        <button
          type="button"
          onClick={() => setOpenModal("about")}
          className="mt-2 underline font-semibold"
        >
          Show more
        </button>
      </div>
      <AmenitiesSection
        amenities={data.offer}
        maxVisible={6}
        onShowAll={() => setOpenModal("amenities")}
      />
      {openModal === "amenities" ? (
        <DynamicModal
          open={openModal === "amenities"}
          onClose={() => setOpenModal(null)}
          title={data.amenitiesModal.title}
          description={`All amenities (${totalAmenities})`}
          mode="amenities"
          sections={amenitySections}
          durationMs={220}
        />
      ) : (
        <DynamicModal
          open={openModal === "about"}
          onClose={() => setOpenModal(null)}
          title={data.aboutModal.title}
          mode="text"
          sections={[
            {
              heading: data.aboutModal.sectionHeading,
              subheading: data.aboutModal.subheading,
              paragraphs: descriptionParagraphs,
            },
          ]}
          durationMs={220}
        />
      )}
      <div className="pt-6">
        <DatePicker guests={1} />
      </div>
    </div>
  );
};

export default UnitDetailPage;
