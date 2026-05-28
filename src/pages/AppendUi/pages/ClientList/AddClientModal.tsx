import { ChangeEvent } from 'react';
import { X, UserPlus, Mail, Phone, Calendar, Check, Plus } from 'lucide-react';
import type { NewClientForm } from './types';

interface AddClientModalProps {
  open: boolean;
  client: NewClientForm;
  onClose: () => void;
  onChangeFirstName: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeLastName: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeEmail: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangePhone: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeDob: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeSex: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeEthnicity: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangePractitioner: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeCategory: (e: ChangeEvent<HTMLSelectElement>) => void;
  onChangeActiveWeeks: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleUnlimited: () => void;
}

const AddClientModal = ({
  open,
  client,
  onClose,
  onChangeFirstName,
  onChangeLastName,
  onChangeEmail,
  onChangePhone,
  onChangeDob,
  onChangeSex,
  onChangeEthnicity,
  onChangePractitioner,
  onChangeCategory,
  onChangeActiveWeeks,
  onToggleUnlimited,
}: AddClientModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[580px] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-7 pt-6 pb-4 border-b border-gray-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">
                  Add New Client
                </h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Fill in client details to create a new profile
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-150"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="px-7 py-5 space-y-5">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
              PERSONAL INFORMATION
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={client.firstName}
                  onChange={onChangeFirstName}
                  placeholder="e.g. Sarah"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={client.lastName}
                  onChange={onChangeLastName}
                  placeholder="e.g. Chen"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
              CONTACT
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={client.email}
                    onChange={onChangeEmail}
                    placeholder="client@email.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={client.phone}
                    onChange={onChangePhone}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
              DEMOGRAPHICS
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={client.dob}
                    onChange={onChangeDob}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Biological Sex <span className="text-red-400">*</span>
                </label>
                <select
                  value={client.sex}
                  onChange={onChangeSex}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="intersex">Intersex</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Ethnicity
                </label>
                <select
                  value={client.ethnicity}
                  onChange={onChangeEthnicity}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="">Select...</option>
                  <option value="caucasian">Caucasian</option>
                  <option value="african">African / African American</option>
                  <option value="hispanic">Hispanic / Latino</option>
                  <option value="asian">Asian</option>
                  <option value="middle_eastern">Middle Eastern</option>
                  <option value="native">Native / Indigenous</option>
                  <option value="pacific">Pacific Islander</option>
                  <option value="mixed">Mixed / Multi-ethnic</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-3">
              CLINICAL ASSIGNMENT
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Practitioner <span className="text-red-400">*</span>
                </label>
                <select
                  value={client.practitioner}
                  onChange={onChangePractitioner}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="">Select practitioner...</option>
                  <option value="dr_holt">
                    Dr. Raina Holt — Integrative Medicine
                  </option>
                  <option value="dr_voss">
                    Dr. Elena Voss — Functional Medicine
                  </option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={client.category}
                  onChange={onChangeCategory}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 cursor-pointer"
                >
                  <option value="">Select category...</option>
                  <option value="peptide">Peptide Therapy</option>
                  <option value="longevity">Longevity Protocol</option>
                  <option value="diet">Diet Intervention</option>
                  <option value="sleep">Sleep Protocol</option>
                  <option value="lifestyle">Lifestyle Optimization</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-[12px] font-medium text-gray-700 mb-1.5 block">
                Active Time (weeks)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max="104"
                    value={client.activeWeeks}
                    onChange={onChangeActiveWeeks}
                    disabled={client.unlimited}
                    placeholder="e.g. 12"
                    className={`w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all duration-150 ${
                      client.unlimited ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                    weeks
                  </span>
                </div>
                <button
                  onClick={onToggleUnlimited}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[12px] font-medium transition-colors duration-150 ${
                    client.unlimited
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#059669]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors duration-150 ${
                      client.unlimited
                        ? 'bg-[#10B981] border-[#10B981]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {client.unlimited && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>{' '}
                  Unlimited
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white z-10 px-7 py-4 border-t border-gray-100 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150">
              Save as Draft
            </button>
            <button className="px-5 py-2.5 text-[13px] font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition-colors duration-150 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
