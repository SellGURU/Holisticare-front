/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Application from '../../../api/app';
import MainModal from '../../MainModal';
import SpinnerLoader from '../../SpinnerLoader';
import { ButtonSecondary } from '../../Button/ButtosSecondary';

interface ManageOtherTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTypesUpdated?: () => void;
}

const ManageOtherTypesModal: FC<ManageOtherTypesModalProps> = ({
  isOpen,
  onClose,
  onTypesUpdated,
}) => {
  const [list, setList] = useState<{ Ot_Id: string; type_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Application.getOtherTypeList()
        .then((res) => {
          setList(res.data || []);
        })
        .catch((err) => {
          console.error('Error getting other types:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAdd = () => {
    const name = newTypeName.trim();
    if (!name) return;
    setAdding(true);
    Application.addOtherType({ type_name: name })
      .then(() => {
        setNewTypeName('');
        return Application.getOtherTypeList();
      })
      .then((res) => {
        setList(res.data || []);
        onTypesUpdated?.();
      })
      .catch((err) => console.error('Error adding type:', err))
      .finally(() => setAdding(false));
  };

  const handleDelete = (Ot_Id: string) => {
    setDeletingId(Ot_Id);
    Application.deleteOtherType(Ot_Id)
      .then(() => Application.getOtherTypeList())
      .then((res) => {
        setList(res.data || []);
        onTypesUpdated?.();
      })
      .catch((err) => console.error('Error deleting type:', err))
      .finally(() => setDeletingId(null));
  };

  return (
    <MainModal isOpen={isOpen} onClose={onClose}>
      <div
        className="flex flex-col bg-white w-[320px] xs:w-[380px] sm:w-[440px] rounded-2xl shadow-lg border border-[#E2F1F8] overflow-hidden"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E2F1F8] bg-[#F9FCFD]">
          <h3 className="text-base font-semibold text-Text-Primary text-left">
            Manage types
          </h3>
          <p className="text-xs text-Text-Quadruple mt-1.5 leading-relaxed">
            Add or remove types for the Other library. They appear in the Type
            dropdown when adding or editing an item.
          </p>
        </div>

        {/* Add new type */}
        <div className="px-6 py-4 border-b border-[#E2F1F8]">
          <label className="block text-xs font-medium text-Text-Primary mb-2">
            Add new type
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              className="flex-1 rounded-xl border border-[#E2F1F8] px-4 py-2.5 text-sm text-Text-Primary placeholder:text-Text-Quadruple focus:outline-none focus:ring-2 focus:ring-Primary-DeepTeal/20 focus:border-Primary-DeepTeal transition-shadow"
              placeholder="e.g. Ozone Therapy (IV), Cryo Cabin"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <ButtonSecondary
              ClassName="rounded-xl px-5 py-2.5 min-w-[88px] h-[42px] flex items-center justify-center shadow-100"
              onClick={handleAdd}
              disabled={adding || !newTypeName.trim()}
            >
              {adding ? (
                <SpinnerLoader color="#fff" />
              ) : (
                <>
                  <img
                    src="/icons/add-square.svg"
                    alt=""
                    className="w-4 h-4 mr-1.5 brightness-0 invert"
                  />
                  Add
                </>
              )}
            </ButtonSecondary>
          </div>
        </div>

        {/* List */}
        <div className="px-6 py-4 flex-1 overflow-hidden flex flex-col min-h-0">
          <label className="block text-xs font-medium text-Text-Primary mb-3">
            Current types
          </label>
          {loading ? (
            <div className="flex justify-center py-10">
              <SpinnerLoader color="#005F73" />
            </div>
          ) : (
            <ul className="overflow-y-auto flex-1 space-y-2 pr-1 -mr-1" style={{ maxHeight: '280px' }}>
              {list.length === 0 ? (
                <li className="flex items-center justify-center py-8 px-4 rounded-xl bg-[#F9FCFD] border border-[#E2F1F8]">
                  <span className="text-sm text-Text-Quadruple text-center">
                    No types yet. Add one above to get started.
                  </span>
                </li>
              ) : (
                list.map((t) => (
                  <li
                    key={t.Ot_Id}
                    className="flex items-center justify-between gap-3 py-3 px-4 rounded-xl bg-white border border-[#E2F1F8] hover:border-Primary-DeepTeal/30 hover:bg-[#F9FCFD] transition-colors group"
                  >
                    <span className="text-sm text-Text-Primary truncate flex-1 min-w-0">
                      {t.type_name}
                    </span>
                    <button
                      type="button"
                      className="flex-shrink-0 text-xs font-medium text-Text-Quadruple hover:text-[#FC5474] disabled:opacity-50 transition-colors py-1 px-2 rounded-lg hover:bg-[#FFD8E4]/30"
                      onClick={() => handleDelete(t.Ot_Id)}
                      disabled={deletingId === t.Ot_Id}
                      title="Delete type"
                    >
                      {deletingId === t.Ot_Id ? 'Deleting…' : 'Delete'}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2F1F8] bg-[#F9FCFD] flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-Primary-DeepTeal hover:text-Primary-DeepTeal/80 cursor-pointer py-2 px-4 rounded-xl border border-[#E2F1F8] bg-white hover:bg-white/90 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </MainModal>
  );
};

export default ManageOtherTypesModal;
