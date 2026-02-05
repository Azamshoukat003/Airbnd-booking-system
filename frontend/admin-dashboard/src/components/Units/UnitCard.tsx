interface UnitCardProps {
  name: string;
  nightlyRate: number;
  status: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UnitCard({ name, nightlyRate, status, onEdit, onDelete }: UnitCardProps) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-black/60">${nightlyRate}/night · {status}</p>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded-lg border" onClick={onEdit}>
          Edit
        </button>
        <button className="px-3 py-1 rounded-lg border text-red-600" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
