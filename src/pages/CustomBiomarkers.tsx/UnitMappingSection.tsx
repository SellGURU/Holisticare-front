/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import Circleloader from '../../Components/CircleLoader';
import SearchBox from '../../Components/SearchBox';
import SpinnerLoader from '../../Components/SpinnerLoader';

interface UnitEntry {
  biomarker: string;
  unit: string;
  to_unit: string;
  conversion_factor?: number | null;
  offset?: number | null;
}

const UnitMappingSection = () => {
  const [data, setData] = useState<any>(null);
  const [entries, setEntries] = useState<UnitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<UnitEntry | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [newEntry, setNewEntry] = useState<UnitEntry>({
    biomarker: '',
    unit: '',
    to_unit: '',
    conversion_factor: null,
    offset: null,
  });

  useEffect(() => {
    BiomarkersApi.getUnitMapping()
      .then((res) => {
        const d = res.data;
        setData(d);
        setEntries(d?.biomarker_specific || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter(
    (e) =>
      !search ||
      e.biomarker.toLowerCase().includes(search.toLowerCase()) ||
      e.unit.toLowerCase().includes(search.toLowerCase()),
  );

  const saveAll = async (newEntries: UnitEntry[]) => {
    setSaving(true);
    try {
      const payload = { ...data, biomarker_specific: newEntries };
      await BiomarkersApi.updateUnitMapping(payload);
      setData(payload);
      setEntries(newEntries);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (idx: number) => {
    const updated = entries.filter((_, i) => i !== idx);
    saveAll(updated);
  };

  const handleEditSave = () => {
    if (editIdx === null || !editEntry) return;
    const updated = [...entries];
    updated[editIdx] = editEntry;
    saveAll(updated);
    setEditIdx(null);
    setEditEntry(null);
  };

  const handleAdd = () => {
    if (!newEntry.biomarker.trim() || !newEntry.unit.trim()) return;
    const updated = [...entries, { ...newEntry, to_unit: newEntry.to_unit || newEntry.unit }];
    saveAll(updated);
    setAddMode(false);
    setNewEntry({ biomarker: '', unit: '', to_unit: '', conversion_factor: null, offset: null });
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
          Unit Mapping
          <span className="text-Text-Secondary text-[10px] font-normal ml-2">
            ({entries.length} entries)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchBox
            value={search}
            ClassName="rounded-2xl !h-7 !py-[0px] !px-3 !shadow-[unset]"
            placeHolder="Search biomarker or unit..."
            onSearch={setSearch}
          />
          <button
            type="button"
            className="shrink-0 text-[11px] font-medium text-white bg-Primary-DeepTeal hover:opacity-90 rounded-full px-3 py-1.5"
            onClick={() => setAddMode(true)}
          >
            + Add Entry
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-Gray-50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_100px_80px_60px_50px] bg-gray-50 text-[10px] font-semibold text-Text-Secondary uppercase px-3 py-2 gap-2 border-b border-Gray-50">
          <span>Biomarker</span>
          <span>From Unit</span>
          <span>To Unit</span>
          <span className="text-center">Factor</span>
          <span className="text-center">Offset</span>
          <span />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {/* Add new row */}
          {addMode && (
            <div className="grid grid-cols-[1fr_100px_100px_80px_60px_50px] items-center px-3 py-2 gap-2 bg-blue-50 border-b border-blue-100">
              <input
                type="text"
                value={newEntry.biomarker}
                onChange={(e) => setNewEntry({ ...newEntry, biomarker: e.target.value })}
                placeholder="Biomarker name"
                className="border border-Gray-50 rounded-lg px-2 py-1 text-[11px] outline-none bg-white"
              />
              <input
                type="text"
                value={newEntry.unit}
                onChange={(e) => setNewEntry({ ...newEntry, unit: e.target.value })}
                placeholder="From"
                className="border border-Gray-50 rounded-lg px-2 py-1 text-[11px] outline-none bg-white"
              />
              <input
                type="text"
                value={newEntry.to_unit}
                onChange={(e) => setNewEntry({ ...newEntry, to_unit: e.target.value })}
                placeholder="To"
                className="border border-Gray-50 rounded-lg px-2 py-1 text-[11px] outline-none bg-white"
              />
              <input
                type="number"
                step="any"
                value={newEntry.conversion_factor ?? ''}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    conversion_factor: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="1.0"
                className="border border-Gray-50 rounded-lg px-1.5 py-1 text-[11px] outline-none text-center bg-white"
              />
              <input
                type="number"
                step="any"
                value={newEntry.offset ?? ''}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    offset: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder="0"
                className="border border-Gray-50 rounded-lg px-1 py-1 text-[11px] outline-none text-center bg-white"
              />
              <div className="flex gap-1 justify-center">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="text-green-600 text-[14px] hover:text-green-800"
                  title="Save"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode(false)}
                  className="text-red-400 text-[14px] hover:text-red-600"
                  title="Cancel"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {filtered.map((entry, i) => {
            const realIdx = entries.indexOf(entry);
            const isEditing = editIdx === realIdx;
            return (
              <div
                key={i}
                className={`grid grid-cols-[1fr_100px_100px_80px_60px_50px] items-center px-3 py-1.5 gap-2 text-[11px] border-b border-Gray-50 ${
                  isEditing ? 'bg-yellow-50' : i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'
                }`}
              >
                {isEditing && editEntry ? (
                  <>
                    <input
                      type="text"
                      value={editEntry.biomarker}
                      onChange={(e) => setEditEntry({ ...editEntry, biomarker: e.target.value })}
                      className="border border-Gray-50 rounded-lg px-2 py-0.5 text-[11px] outline-none"
                    />
                    <input
                      type="text"
                      value={editEntry.unit}
                      onChange={(e) => setEditEntry({ ...editEntry, unit: e.target.value })}
                      className="border border-Gray-50 rounded-lg px-2 py-0.5 text-[11px] outline-none"
                    />
                    <input
                      type="text"
                      value={editEntry.to_unit}
                      onChange={(e) => setEditEntry({ ...editEntry, to_unit: e.target.value })}
                      className="border border-Gray-50 rounded-lg px-2 py-0.5 text-[11px] outline-none"
                    />
                    <input
                      type="number"
                      step="any"
                      value={editEntry.conversion_factor ?? ''}
                      onChange={(e) =>
                        setEditEntry({
                          ...editEntry,
                          conversion_factor: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="border border-Gray-50 rounded-lg px-1 py-0.5 text-[11px] outline-none text-center"
                    />
                    <input
                      type="number"
                      step="any"
                      value={editEntry.offset ?? ''}
                      onChange={(e) =>
                        setEditEntry({
                          ...editEntry,
                          offset: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="border border-Gray-50 rounded-lg px-1 py-0.5 text-[11px] outline-none text-center"
                    />
                    <div className="flex gap-1 justify-center">
                      <button type="button" onClick={handleEditSave} className="text-green-600 text-[12px]" title="Save">✓</button>
                      <button type="button" onClick={() => { setEditIdx(null); setEditEntry(null); }} className="text-red-400 text-[12px]" title="Cancel">×</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-Text-Primary truncate">{entry.biomarker}</span>
                    <span className="text-Text-Secondary">{entry.unit}</span>
                    <span className="text-Text-Secondary">{entry.to_unit}</span>
                    <span className="text-center text-Text-Secondary">{entry.conversion_factor ?? '—'}</span>
                    <span className="text-center text-Text-Secondary">{entry.offset ?? '—'}</span>
                    <div className="flex gap-1 justify-center">
                      <button
                        type="button"
                        onClick={() => { setEditIdx(realIdx); setEditEntry({ ...entry }); }}
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
              No unit mapping entries found.
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

export default UnitMappingSection;
