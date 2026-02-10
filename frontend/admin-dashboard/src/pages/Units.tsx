import { useState } from 'react';
import UnitList, { UnitRow } from '../components/Units/UnitList';
import CreationFlow from '../components/creation/creation/CreationFlow';
import { CreationProvider } from '../context/CreationContext';

export default function Units() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitRow | null>(null);

  const closeModal = () => {
    setShowCreate(false);
    setEditingUnit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Units</h2>
        <button className="primary-button" type="button" onClick={() => setShowCreate(true)}>
          Create unit
        </button>
      </div>

      <UnitList onEditUnit={(unit) => setEditingUnit(unit)} />

      {(showCreate || editingUnit) && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full border border-black/10 text-xs font-semibold text-black/70 hover:border-black/30 bg-white"
            >
              Close
            </button>
            <CreationProvider>
              <CreationFlow
                mode="admin-unit"
                onClose={closeModal}
                unitDraft={editingUnit}
              />
            </CreationProvider>
          </div>
        </div>
      )}
    </div>
  );
}
