/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import Circleloader from '../../Components/CircleLoader';
import SearchBox from '../../Components/SearchBox';
import SpinnerLoader from '../../Components/SpinnerLoader';

interface MappingEntry {
  standard_name: string;
  variations: string[];
}

const BiomarkerMappingSection = () => {
  const [entries, setEntries] = useState<MappingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<MappingEntry | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [newEntry, setNewEntry] = useState<MappingEntry>({ standard_name: '', variations: [''] });

  useEffect(() => {
    BiomarkersApi.getBiomarkerMapping()
      .then((res) => {
        const data = res.data;
        if (data?.mappings && Array.isArray(data.mappings)) {
          setEntries(data.mappings);
        } else if (Array.isArray(data)) {
          setEntries(data);
        } else {
          setEntries([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter(
    (e) =>
      !search ||
      e.standard_name.toLowerCase().includes(search.toLowerCase()) ||
      e.variations.some((v) => v.toLowerCase().includes(search.toLowerCase())),
  );

  const saveAll = async (newEntries: MappingEntry[]) => {
    setSaving(true);
    try {
      await BiomarkersApi.updateBiomarkerMapping({ mappings: newEntries });
      setEntries(newEntries);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (idx: number) => {
    saveAll(entries.filter((_, i) => i !== idx));
  };

  const handleEditSave = () => {
    if (editIdx === null || !editEntry) return;
    const cleaned = {
      ...editEntry,
      variations: editEntry.variations.filter((v) => v.trim() !== ''),
    };
    const updated = [...entries];
    updated[editIdx] = cleaned;
    saveAll(updated);
    setEditIdx(null);
    setEditEntry(null);
  };

  const handleAdd = () => {
    if (!newEntry.standard_name.trim()) return;
    const cleaned = {
      ...newEntry,
      variations: newEntry.variations.filter((v) => v.trim() !== ''),
    };
    saveAll([...entries, cleaned]);
    setAddMode(false);
    setNewEntry({ standard_name: '', variations: [''] });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Circleloader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="text-Text-Primary text-sm font-medium">
          Biomarker Name Mapping
          <span className="text-Text-Secondary text-[10px] font-normal ml-2">
            ({entries.length} mappings)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchBox
            value={search}
            ClassName="rounded-2xl !h-7 !py-[0px] !px-3 !shadow-[unset]"
            placeHolder="Search standard name or variation..."
            onSearch={setSearch}
          />
          <button
            type="button"
            className="shrink-0 text-[11px] font-medium text-white bg-Primary-DeepTeal hover:opacity-90 rounded-full px-3 py-1.5"
            onClick={() => setAddMode(true)}
          >
            + Add Mapping
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[10px] text-Text-Secondary">
        Each mapping links a <strong>Standard System Name</strong> to one or more <strong>Variations</strong> (alternate lab names). When a lab report uses a variation name, the system maps it to the standard biomarker automatically.
      </div>

      {/* Add new */}
      {addMode && (
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[10px] text-Text-Secondary mb-0.5">Standard Name</label>
              <input
                type="text"
                value={newEntry.standard_name}
                onChange={(e) => setNewEntry({ ...newEntry, standard_name: e.target.value })}
                placeholder="e.g. 25 OH Vitamin D"
                className="w-full border border-Gray-50 rounded-lg px-2 py-1 text-[11px] outline-none bg-white"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={handleAdd} className="text-green-600 text-[12px] font-medium">Save</button>
              <button type="button" onClick={() => setAddMode(false)} className="text-red-400 text-[12px]">Cancel</button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-Text-Secondary mb-0.5">Variations (one per line)</label>
            <textarea
              value={newEntry.variations.join('\n')}
              onChange={(e) => setNewEntry({ ...newEntry, variations: e.target.value.split('\n') })}
              placeholder={"Vitamin D\nVit D 25-OH\n25-Hydroxyvitamin D"}
              rows={3}
              className="w-full border border-Gray-50 rounded-lg px-2 py-1 text-[11px] outline-none resize-none bg-white font-mono"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-Gray-50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[200px_1fr_70px] bg-gray-50 text-[10px] font-semibold text-Text-Secondary uppercase px-3 py-2 gap-2 border-b border-Gray-50">
          <span>Standard Name</span>
          <span>Variations</span>
          <span />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {filtered.map((entry, i) => {
            const realIdx = entries.indexOf(entry);
            const isEditing = editIdx === realIdx;
            return (
              <div
                key={i}
                className={`grid grid-cols-[200px_1fr_70px] items-start px-3 py-2 gap-2 text-[11px] border-b border-Gray-50 ${
                  isEditing ? 'bg-yellow-50' : i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                }`}
              >
                {isEditing && editEntry ? (
                  <>
                    <input
                      type="text"
                      value={editEntry.standard_name}
                      onChange={(e) => setEditEntry({ ...editEntry, standard_name: e.target.value })}
                      className="border border-Gray-50 rounded-lg px-2 py-0.5 text-[11px] outline-none"
                    />
                    <textarea
                      value={editEntry.variations.join('\n')}
                      onChange={(e) =>
                        setEditEntry({ ...editEntry, variations: e.target.value.split('\n') })
                      }
                      rows={Math.max(2, editEntry.variations.length)}
                      className="border border-Gray-50 rounded-lg px-2 py-0.5 text-[11px] outline-none resize-none font-mono"
                    />
                    <div className="flex gap-1 pt-1">
                      <button type="button" onClick={handleEditSave} className="text-green-600 text-[10px]">Save</button>
                      <button type="button" onClick={() => { setEditIdx(null); setEditEntry(null); }} className="text-red-400 text-[10px]">Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-Text-Primary font-medium">{entry.standard_name}</span>
                    <div className="flex flex-wrap gap-1">
                      {entry.variations.map((v, vi) => (
                        <span
                          key={vi}
                          className="bg-gray-100 text-Text-Secondary rounded-full px-2 py-0.5 text-[10px]"
                        >
                          {v}
                        </span>
                      ))}
                      {entry.variations.length === 0 && (
                        <span className="text-Text-Secondary italic text-[10px]">No variations</span>
                      )}
                    </div>
                    <div className="flex gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => { setEditIdx(realIdx); setEditEntry({ ...entry, variations: [...entry.variations] }); }}
                        className="text-Primary-DeepTeal text-[10px] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(realIdx)}
                        className="text-red-400 text-[10px] hover:text-red-600"
                      >
                        Del
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && !addMode && (
            <div className="py-6 text-center text-[11px] text-Text-Secondary">
              No biomarker mappings found.
            </div>
          )}
        </div>
      </div>
      {saving && (
        <div className="flex items-center gap-2 text-[11px] text-Text-Secondary">
          <SpinnerLoader color="#005F73" /> Saving...
        </div>
      )}
    </div>
  );
};

export default BiomarkerMappingSection;
