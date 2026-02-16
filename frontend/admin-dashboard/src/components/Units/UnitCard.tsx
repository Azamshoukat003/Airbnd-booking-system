import { FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

interface UnitCardProps {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  nightlyRate: number;
  maxGuests?: number | null;
  status: string;
  onEdit?: () => void;
  onDelete: () => void;
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function UnitCard({
  name,
  description,
  imageUrl,
  nightlyRate,
  maxGuests,
  status,
  onEdit,
  onDelete,
}: UnitCardProps) {
  const normalizedStatus = status.toLowerCase();
  const statusClassName = statusStyles[normalizedStatus] ?? 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${name} preview`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
            <p className="text-sm font-medium tracking-wide text-slate-500">No Image</p>
          </div>
        )}
        <span className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClassName}`}>
          {status}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className=" text-lg font-semibold text-slate-900">{name}</h3>
          <p className="min-h-10 text-sm leading-5 text-slate-600">
            {description?.trim() ? description : 'No description added yet for this unit.'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-slate-900">${nightlyRate}/night</p>
          {typeof maxGuests === 'number' && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <FiUsers className="h-3.5 w-3.5" aria-hidden="true" />
              {maxGuests} guests
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          {onEdit && (
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              onClick={onEdit}
              aria-label={`Edit ${name}`}
            >
              <FiEdit2 className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
          )}
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            onClick={onDelete}
            aria-label={`Delete ${name}`}
          >
            <FiTrash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
