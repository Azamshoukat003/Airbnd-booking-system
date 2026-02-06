import { ListingCardData } from "../pages/UnitListingPage";
import { ImageCarousel } from "./ImageCarousel";

export function UnitCard({
  data,
  className = "",
}: {
  data: ListingCardData;
  className?: string;
}) {
  const currency = data.currencySymbol ?? "$";

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <ImageCarousel images={data.images} alt={data.title} />
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-neutral-900">
            {data.title}
          </div>
          {data.subtitle ? (
            <div className="truncate text-sm text-neutral-600">
              {data.subtitle}
            </div>
          ) : null}
          {data.meta ? (
            <div className="truncate text-sm text-neutral-600">{data.meta}</div>
          ) : null}
        </div>
      </div>

      <div className="mt-2 text-sm text-neutral-900">
        {data.originalPricePerNight != null ? (
          <span className="mr-1 text-neutral-600 line-through">
            {currency}
            {data.originalPricePerNight}
          </span>
        ) : null}
        <span className="font-semibold">
          {currency}
          {data.pricePerNight}
        </span>{" "}
        <span className="text-neutral-700">for 1 night</span>
      </div>

      {data.cancellationText ? (
        <div className="mt-1 text-sm text-neutral-600">
          {data.cancellationText}
        </div>
      ) : null}
    </div>
  );
}
