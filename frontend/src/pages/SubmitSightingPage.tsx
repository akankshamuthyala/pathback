import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Calendar, Clock, Shirt, User, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import apiClient from '../api/client';
import { VoiceRecorder } from '../components/common/VoiceRecorder';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { MissingCase } from '../types';

export const SubmitSightingPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<MissingCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [approximateLocation, setApproximateLocation] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [clothing, setClothing] = useState('');
  const [estimatedAge, setEstimatedAge] = useState('');
  const [description, setDescription] = useState('');
  const [isVoiceTranscribed, setIsVoiceTranscribed] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    apiClient.get('/cases').then((res) => {
      if (res.data.success) {
        setCases(res.data.cases);
      }
    }).catch((err) => console.warn('Could not load public cases list:', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      const newPreviews = selected.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 10) {
      setErrorMessage('Please provide a descriptive witness statement (at least 10 characters).');
      return;
    }
    if (!approximateLocation) {
      setErrorMessage('Please specify the approximate neighborhood or area.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      if (selectedCaseId) formData.append('caseId', selectedCaseId);
      formData.append('description', description);
      formData.append('location', exactLocation || approximateLocation);
      formData.append('approximateLocation', approximateLocation);
      formData.append('date', date);
      formData.append('time', time);
      if (clothing) formData.append('clothing', clothing);
      if (estimatedAge) formData.append('estimatedAge', estimatedAge);
      formData.append('isVoiceTranscribed', String(isVoiceTranscribed));

      files.forEach((file) => {
        formData.append('photographs', file);
      });

      const res = await apiClient.post('/sightings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSuccessResponse(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit sighting. Please review form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successResponse) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sighting Ingested Successfully
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Thank you for contributing to responsible investigation. Your report has been registered under Sighting ID{' '}
          <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
            {successResponse.sighting?.sightingId}
          </span>
        </p>

        {successResponse.fraudWarning && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 text-left flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">System Integrity Notification: </span>
              {successResponse.fraudWarning}. Flagged for investigator verification without penalizing your submission.
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-50 dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-xl text-xs text-slate-500 text-left space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Next Steps in the Verification Protocol:</p>
          <p>• Sighting features will be correlated with active spatial transit corridors.</p>
          <p>• An authorized human investigator will audit the submission before operational contact.</p>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => {
              setSuccessResponse(null);
              setDescription('');
              setFiles([]);
              setPreviews([]);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-sethu-navy-800 text-slate-800 dark:text-slate-200"
          >
            Submit Another Report
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white"
          >
            View Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Submit a Potential Sighting Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Provide observational details, photographs, or voice notes. Information is strictly safeguarded under PathBack verification standards.
        </p>
      </div>

      <PrivacyNotice message="Witness submissions are routed directly to authorized investigators. Exact locations are not published to the public." />

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Associated Case Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Associated Missing-Person Case (Optional)
          </label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">General Public Sighting (No Specific Case Link)</option>
            {cases.map((c) => (
              <option key={c._id} value={c.caseId}>
                [{c.caseId}] {c.personName} — Last seen: {c.approximateLocation}
              </option>
            ))}
          </select>
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              Approximate Area / Neighborhood *
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Specific Location Landmark (Restricted to Investigators)
            </label>
            <input
              type="text"
              value={exactLocation}
              onChange={(e) => setExactLocation(e.target.value)}
              placeholder="e.g. Platform 4 waiting bench near tea stall"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Date Sighted *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Approximate Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Estimated Age Observed
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={estimatedAge}
              onChange={(e) => setEstimatedAge(e.target.value)}
              placeholder="e.g. 16"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Clothing Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-teal-600" />
            Clothing / Visible Attire Observed
          </label>
          <input
            type="text"
            value={clothing}
            onChange={(e) => setClothing(e.target.value)}
            placeholder="e.g. Dark navy shirt, charcoal trousers, olive backpack"
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Voice Recorder / Witness Statement */}
        <VoiceRecorder
          onTranscriptChange={(t, isTranscribed) => {
            setDescription(t);
            setIsVoiceTranscribed(isTranscribed);
          }}
          initialTranscript={description}
        />

        {/* Photo Upload with Previews */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Photographs or Surveillance Frame Extracts (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-teal-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              id="sighting-photos"
              className="hidden"
            />
            <label
              htmlFor="sighting-photos"
              className="cursor-pointer flex flex-col items-center gap-2 text-xs text-slate-500"
            >
              <Upload className="w-6 h-6 text-teal-600" />
              <span>Click to upload image files (JPEG, PNG, WEBP)</span>
              <span className="text-[10px] text-slate-400">Perceptual hash analysis will verify non-duplication</span>
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
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Submit Sighting for Investigator Verification</span>
          )}
        </button>
      </form>
    </div>
  );
};
