import { useState } from "react";
import { UnitCardGrid } from "../components/UnitCardsGrid";

export type ListingCardData = {
  id: string;
  images: string[];

  title: string;
  subtitle?: string;
  meta?: string;

  rating: number;
  reviewsCount: number;

  pricePerNight: number;
  originalPricePerNight?: number;
  currencySymbol?: string;

  cancellationText?: string;
};

export default function UnitListingPage() {
  const [items, setItems] = useState<ListingCardData[]>([
    {
      id: "1",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
    {
      id: "2",
      images: [
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Cabin in San Bernardino",
      subtitle: "Lakefront cabin in Sanber",
      meta: "1 bed",
      rating: 4.91,
      reviewsCount: 32,
      pricePerNight: 103,
      originalPricePerNight: 160,
      cancellationText: "Free cancellation",
    },
    {
      id: "3",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
    {
      id: "4",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
    {
      id: "5",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
    {
      id: "6",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
    {
      id: "7",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
    {
      id: "8",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
    {
      id: "9",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
    {
      id: "10",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
      ],
      title: "Tiny home in Piribebuy",
      subtitle: "Blue house",
      meta: "2 bedrooms · 3 beds",
      rating: 5.0,
      reviewsCount: 47,
      pricePerNight: 69,
      cancellationText: "Free cancellation",
    },
  ]);

  return (
    <div className="mx-auto max-w-5xl p-4">
      <UnitCardGrid items={items} />
    </div>
  );
}
