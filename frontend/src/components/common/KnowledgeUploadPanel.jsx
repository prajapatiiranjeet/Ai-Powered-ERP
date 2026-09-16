import { useRef, useState, useMemo } from 'react';
import { ragService } from '../../services/ragService.js';

// Initial documents set to empty so dummy demo files don't show on refresh
const initialDocuments = [];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgeUploadPanel() {
  const inputRef = useRef(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, PENDING, INDEXED

  const addFiles = (fileList) => {
    const files = Array.from(fileList ?? []).filter((file) => file.size > 0);
    if (!files.length) return;

    setUploadError('');
    setUploadSuccess('');

    const newDocs = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}-${Date.now()}`,
      file,
      name: file.name,
      size: formatSize(file.size),
      status: 'Ready to upload',
      tone: 'amber',
      uploadedAt: 'Just now'
    }));

    setDocuments((current) => [...newDocs, ...current]);
  };

  const uploadSelectedFiles = async () => {
    const pendingDocuments = documents.filter((document) => document.file && document.status === 'Ready to upload');
    if (!pendingDocuments.length || uploading) return;

    setUploadError('');
    setUploadSuccess('');
    setUploading(true);
    setUploadProgress(15);

    let uploadedCount = 0;
    const totalFiles = pendingDocuments.length;

    for (let i = 0; i < totalFiles; i++) {
      const document = pendingDocuments[i];
      setCurrentUploadingFile(document.name);
      
      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id ? { ...item, status: 'Indexing into RAG...', tone: 'amber' } : item
        )
      );

      const baseProgress = Math.round((i / totalFiles) * 100);
      setUploadProgress(Math.min(90, baseProgress + 40));

      try {
        await ragService.uploadDocument(document.file);
        uploadedCount += 1;

        setDocuments((current) =>
          current.map((item) =>
            item.id === document.id
              ? { ...item, file: undefined, status: 'Indexed', tone: 'emerald', uploadedAt: 'Just now' }
              : item
          )
        );
      } catch (error) {
        setDocuments((current) =>
          current.map((item) =>
            item.id === document.id ? { ...item, status: 'Upload failed', tone: 'rose' } : item
          )
        );
        setUploadError(
          (current) => `${current ? `${current} | ` : ''}${document.name}: ${error?.message || 'Upload failed.'}`
        );
      }
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      setCurrentUploadingFile('');
      if (uploadedCount > 0) {
        setUploadSuccess(
          `${uploadedCount} document${uploadedCount === 1 ? '' : 's'} uploaded and indexed into RAG memory successfully.`
        );
      }
    }, 500);
  };

  const removeDocument = (id) => {
    setDocuments((current) => current.filter((document) => document.id !== id));
  };

  const pendingCount = documents.filter((d) => d.file && d.status === 'Ready to upload').length;
  const indexedCount = documents.filter((d) => d.status === 'Indexed').length;

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterTab === 'PENDING') return matchesSearch && doc.status === 'Ready to upload';
      if (filterTab === 'INDEXED') return matchesSearch && doc.status === 'Indexed';
      return matchesSearch;
    });
  }, [documents, searchQuery, filterTab]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
      {/* Panel Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-niu-green-900 p-5 text-white dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-niu-gold-400 text-slate-950 shadow-md">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-niu-gold-300">
                Sherpal RAG Engine
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-white">Upload University Documents</h3>
            <p className="mt-0.5 text-xs text-emerald-100">
              Add policies, syllabi, and notices. Indexing documents updates Sherpal AI answers instantly across the portal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-100 sm:self-auto">
          <span>Admin Only</span>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-12 md:p-6">
        {/* Drop Zone & Upload Control */}
        <div className="space-y-4 md:col-span-7">
          <div
            className={`group flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
              dragActive
                ? 'border-niu-green-500 bg-niu-green-50/50 dark:bg-emerald-950/20'
                : 'border-slate-200 bg-slate-50/50 hover:border-niu-green-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'
            }`}
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-niu-green-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-emerald-400 dark:ring-slate-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            </div>
            <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-200">
              {uploading ? 'Processing documents...' : 'Drop files here or click to browse'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              PDF, DOCX, DOC or TXT up to 25 MB
            </p>
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = '';
              }}
            />
          </div>

          {/* Progress Animation during Upload */}
          {uploading && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950 p-4 text-white shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-300">Indexing: {currentUploadingFile || 'Files'}</span>
                <span className="text-niu-gold-300">{uploadProgress}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-niu-gold-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadSuccess && (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span>{uploadSuccess}</span>
              <button type="button" onClick={() => setUploadSuccess('')} className="font-bold text-emerald-700">×</button>
            </div>
          )}

          {/* Error Banner */}
          {uploadError && (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError('')} className="font-bold text-rose-700">×</button>
            </div>
          )}

          {/* Upload Button - Sleek Normal Size */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {pendingCount > 0 ? `${pendingCount} document(s) queued` : 'No files selected'}
            </span>
            <button
              type="button"
              onClick={uploadSelectedFiles}
              disabled={uploading || pendingCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-niu-green-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-niu-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Start Upload'}
            </button>
          </div>
        </div>

        {/* Right Side Document Library */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50 md:col-span-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Document library
            </p>
            <span className="rounded-full bg-niu-green-100 px-2 py-0.5 text-xs font-black text-niu-green-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              {documents.length}
            </span>
          </div>

          {/* Filter tabs */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'PENDING', label: 'Pending' },
              { key: 'INDEXED', label: 'Indexed' }
            ].map((tab) => {
              const active = filterTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterTab(tab.key)}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-niu-green-600/95 text-white shadow ring-1 ring-emerald-200 dark:bg-emerald-600 dark:text-white dark:ring-emerald-400/40'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  aria-pressed={active}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200" title={doc.name}>
                    {doc.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {doc.size} ·{' '}
                    <span
                      className={
                        doc.tone === 'amber'
                          ? 'text-amber-600 dark:text-amber-400'
                          : doc.tone === 'rose'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {doc.status}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.id)}
                  className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition"
                  title="Remove document"
                >
                  ×
                </button>
              </div>
            ))}

            {!filteredDocuments.length && (
              <p className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No documents uploaded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
