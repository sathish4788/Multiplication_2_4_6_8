import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload, AlertCircle, RotateCcw } from 'lucide-react';
import { GameProgress, Language } from '../types/game';
import { exportBackupCode, importBackupCode, INITIAL_PROGRESS } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface BackupModalProps {
  isOpen: boolean;
  progress: GameProgress;
  language: Language;
  onClose: () => void;
  onRestoreProgress: (imported: GameProgress) => void;
  onResetProgress: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  progress,
  language,
  onClose,
  onRestoreProgress,
  onResetProgress,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [importInput, setImportInput] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const backupCode = exportBackupCode(progress);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(backupCode);
      setCopied(true);
      soundManager.playPop(1.4);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleApplyImport = () => {
    setImportError(null);
    setImportSuccess(false);

    if (!importInput.trim()) {
      setImportError(language === 'ta' ? 'குறியீட்டை உள்ளிடவும்' : 'Please enter a backup code');
      soundManager.playBoop();
      return;
    }

    const imported = importBackupCode(importInput);
    if (imported) {
      soundManager.playFanfare();
      setImportSuccess(true);
      setTimeout(() => {
        onRestoreProgress(imported);
        onClose();
      }, 1000);
    } else {
      soundManager.playBoop();
      setImportError(language === 'ta' ? 'தவறான குறியீடு. சரிபார்க்கவும்!' : 'Invalid backup code. Please check!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-amber-300 flex items-center gap-2 mb-1">
          <Download className="w-5 h-5 text-pink-400" />
          <span>{language === 'ta' ? 'முன்னேற்றக் காப்பு & மீட்டல்' : 'Save & Backup Studio Progress'}</span>
        </h3>
        <p className="text-xs text-slate-300 mb-5">
          {language === 'ta'
            ? 'உலாவி வரலாறு அல்லது தற்காலிக நினைவகம் அழிக்கப்பட்டாலும் உங்கள் நட்சத்திரங்களும் அலங்காரங்களும் பத்திரமாக இருக்க இந்தக் குறியீட்டைப் பாதுகாக்கவும்.'
            : 'Export your progress code to keep your stars, paint drops, and decorated room safe across devices!'}
        </p>

        {/* EXPORT SECTION */}
        <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-5">
          <span className="text-xs font-black uppercase text-pink-400 block">
            {language === 'ta' ? 'உங்கள் காப்புக் குறியீடு (Export Code):' : 'Your Export Code:'}
          </span>
          <div className="relative">
            <textarea
              readOnly
              value={backupCode}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-300 select-all resize-none focus:outline-none"
            />
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow active:scale-98 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-yellow-300" /> : <Copy className="w-4 h-4" />}
            <span>
              {copied
                ? language === 'ta'
                  ? 'நகலெடுக்கப்பட்டது!'
                  : 'Copied to Clipboard!'
                : language === 'ta'
                ? 'குறியீட்டை நகலெடு'
                : 'Copy Backup Code'}
            </span>
          </button>
        </div>

        {/* IMPORT SECTION */}
        <div className="space-y-2 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-5">
          <span className="text-xs font-black uppercase text-amber-400 block">
            {language === 'ta' ? 'குறியீட்டை உள்ளிட்டு மீட்டெடு (Restore):' : 'Restore from Backup Code:'}
          </span>
          <textarea
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            placeholder="Paste your TMS-... code here"
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-200 resize-none focus:border-amber-400 focus:outline-none"
          />

          {importError && (
            <p className="text-xs text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{importError}</span>
            </p>
          )}

          {importSuccess && (
            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>
                {language === 'ta' ? 'வெற்றிகரமாக மீட்கப்பட்டது!' : 'Progress restored successfully!'}
              </span>
            </p>
          )}

          <button
            onClick={handleApplyImport}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow active:scale-98 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'ta' ? 'முன்னேற்றத்தை மீட்டெடு' : 'Restore Progress'}</span>
          </button>
        </div>

        {/* RESET DANGER OPTION */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to start fresh with a new room?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="text-[11px] text-slate-500 hover:text-rose-400 font-medium flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Progress to Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
