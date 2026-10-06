import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Calendar, User, ShieldAlert, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import apiClient from '../api/client';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { RiskLevel } from '../types';

export const CreateCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [personName, setPersonName] = useState('');
  const [gender, setGender] = useState('Male');
  const [ageWhenMissing, setAgeWhenMissing] = useState(16);
  const [estimatedCurrentAge, setEstimatedCurrentAge] = useState(16);
  const [dateMissing, setDateMissing] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [approximateLocation, setApproximateLocation] = useState('');
  const [lastKnownLocation, setLastKnownLocation] = useState('');
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [clothingDescription, setClothingDescription] = useState('');
  const [vulnerabilityInformation, setVulnerabilityInformation] = useState('');
  const [circumstances, setCircumstances] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('NORMAL');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (name: string) => {
    setPersonName(name);
    if (!title || title.startsWith('Disappearance of')) {
      setTitle(`Disappearance of ${name} (Age ${ageWhenMissing})`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      const newPreviews = selected.map((f) => URL.createObjectURL(f));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !approximateLocation || !lastKnownLocation || !physicalDescription || !clothingDescription) {
      setError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title || `Disappearance of ${personName}`);
      formData.append('personName', personName);
      formData.append('gender', gender);
      formData.append('ageWhenMissing', String(ageWhenMissing));
      formData.append('estimatedCurrentAge', String(estimatedCurrentAge));
      formData.append('dateMissing', dateMissing);
      formData.append('approximateLocation', approximateLocation);
      formData.append('lastKnownLocation', lastKnownLocation);
      formData.append('locationVisibility', 'RESTRICTED_INVESTIGATOR');
      formData.append('physicalDescription', physicalDescription);
      formData.append('clothingDescription', clothingDescription);
      if (vulnerabilityInformation) formData.append('vulnerabilityInformation', vulnerabilityInformation);
      formData.append('circumstances', circumstances || 'Reported missing under active investigation.');
      formData.append('riskLevel', riskLevel);

      files.forEach((f) => {
        formData.append('photographs', f);
      });

      const res = await apiClient.post('/cases', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        navigate(`/cases/${res.data.case.caseId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create case. Please verify inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Register New Missing-Person Case File
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Structured case intake. Exact coordinate data will remain encrypted and investigator-restricted.
        </p>
      </div>

      <PrivacyNotice message="Confidential health records and exact residential coordinates are automatically protected under SETHU investigative access rules." />

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Name, Gender, Age */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Full Name of Missing Person *
            </label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Not Disclosed">Not Disclosed</option>
            </select>
          </div>
        </div>

        {/* Age Baseline and Current Age */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Age When Missing *
            </label>
            <input
              type="number"
              required
              min="0"
              max="120"
              value={ageWhenMissing}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setAgeWhenMissing(val);
                setEstimatedCurrentAge(val);
              }}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Current Age *
            </label>
            <input
              type="number"
              required
              min="0"
              max="120"
              value={estimatedCurrentAge}
              onChange={(e) => setEstimatedCurrentAge(parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Date Missing *
            </label>
            <input
              type="date"
              required
              value={dateMissing}
              onChange={(e) => setDateMissing(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              Approximate Area / District (Public Redacted) *
            </label>
            <input
              type="text"
              required
              value={approximateLocation}
              onChange={(e) => setApproximateLocation(e.target.value)}
              placeholder="e.g. Central Railway Station Area, District 4"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Exact Last-Known Location (Investigator Only) *
            </label>
            <input
              type="text"
              required
              value={lastKnownLocation}
              onChange={(e) => setLastKnownLocation(e.target.value)}
              placeholder="e.g. Platform 3 Waiting Lounge, Station East Wing"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Physical Traits & Clothing */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Description & Distinguishing Marks *
            </label>
            <textarea
              required
              rows={3}
              value={physicalDescription}
              onChange={(e) => setPhysicalDescription(e.target.value)}
              placeholder="Height, build, hair style/color, eye color, permanent marks, scars, glasses, or dental features..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clothing Description *
            </label>
            <input
              type="text"
              required
              value={clothingDescription}
              onChange={(e) => setClothingDescription(e.target.value)}
              placeholder="e.g. Navy blue shirt, dark charcoal trousers, white canvas sneakers, olive backpack"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vulnerability & Health Flags (Protected Health Information)
            </label>
            <input
              type="text"
              value={vulnerabilityInformation}
              onChange={(e) => setVulnerabilityInformation(e.target.value)}
              placeholder="e.g. Alzheimer / Memory impairment, critical insulin dependency, minor vulnerability..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Circumstances of Disappearance
            </label>
            <textarea
              rows={3}
              value={circumstances}
              onChange={(e) => setCircumstances(e.target.value)}
              placeholder="Context of last confirmed sighting, travel plans, mental state, or any suspicious factors..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Initial Risk Priority */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Initial Risk Triage Level
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(['NORMAL', 'HIGH', 'CRITICAL'] as RiskLevel[]).map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                  riskLevel === level
                    ? level === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-400'
                      : level === 'HIGH'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-400'
                      : 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Original Photographs (Up to 5 images)
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-teal-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              id="case-photos"
              className="hidden"
            />
            <label htmlFor="case-photos" className="cursor-pointer flex flex-col items-center gap-2 text-xs text-slate-500">
              <Upload className="w-6 h-6 text-teal-600" />
              <span>Click to select photographs</span>
              <span className="text-[10px] text-slate-400">Stored privately in secure object storage</span>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Registering Case File...' : 'Create Missing Person Case Record'}
        </button>
      </form>
    </div>
  );
};
