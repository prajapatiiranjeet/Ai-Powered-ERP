import { useRef, useState } from 'react';

const initialDocuments = [
  { id: 'policy-handbook', name: 'NIU Academic Handbook.pdf', size: '2.4 MB', status: 'Indexed', tone: 'emerald' },
  { id: 'exam-calendar', name: 'Examination Calendar 2025-26.docx', size: '816 KB', status: 'Indexed', tone: 'emerald' }
];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function KnowledgeUploadPanel() {
  const inputRef = useRef(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [dragActive, setDragActive] = useState(false);

  const addFiles = (fileList) => {
    const files = Array.from(fileList ?? []).filter((file) => file.size > 0);
    if (!files.length) return;
    setDocuments((current) => [
      ...files.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        name: file.name,
        size: formatSize(file.size),
        status: 'Ready for indexing',
        tone: 'amber'
      })),
      ...current
    ]);
  };

  const removeDocument = (id) => {
    setDocuments((current) => current.filter((document) => document.id !== id));
  };

  return (
    <section className="erp-card overflow-hidden border-niu-green-200/70">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-niu-green-900 to-niu-green-700 p-5 text-white sm:flex-row sm:items-center sm:justify-between md:p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-niu-gold-400 text-slate-950" aria-hidden="true">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-niu-gold-300">Knowledge base</p>
              <h3 className="text-lg font-black">Upload university documents</h3>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-emerald-100">Add policies, notices and academic material. These documents will power answers for students, faculty and admins after the RAG service is connected.</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-emerald-300/25 bg-black/15 px-3 py-1.5 text-xs font-bold text-emerald-100 sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-300" /> Admin only
        </div>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-6">
        <button
          type="button"
          className={`group flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 text-center transition ${dragActive ? 'border-niu-gold-500 bg-niu-gold-50' : 'border-slate-200 bg-slate-50 hover:border-niu-green-400 hover:bg-niu-green-50/40'}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => { event.preventDefault(); setDragActive(false); addFiles(event.dataTransfer.files); }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-niu-green-700 shadow-sm ring-1 ring-slate-200 group-hover:bg-niu-green-700 group-hover:text-white" aria-hidden="true">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /><path d="M5 17v4" /><path d="M19 17v4" /></svg>
          </span>
          <span className="mt-3 text-sm font-bold text-slate-800">Drop files here or browse</span>
          <span className="mt-1 text-xs text-slate-500">PDF, DOCX, DOC or TXT up to 25 MB</span>
          <input ref={inputRef} className="sr-only" type="file" accept=".pdf,.doc,.docx,.txt" multiple onChange={(event) => addFiles(event.target.files)} />
        </button>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Document library</p>
            <span className="rounded-full bg-niu-green-100 px-2 py-1 text-xs font-black text-niu-green-800">{documents.length}</span>
          </div>
          <div className="mt-3 space-y-2">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center gap-2 rounded-xl bg-white p-2.5 ring-1 ring-slate-100">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600" aria-hidden="true">PDF</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800" title={document.name}>{document.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{document.size} · <span className={document.tone === 'amber' ? 'text-amber-700' : 'text-emerald-700'}>{document.status}</span></p>
                </div>
                <button type="button" className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => removeDocument(document.id)} aria-label={`Remove ${document.name}`} title="Remove document">×</button>
              </div>
            ))}
            {!documents.length ? <p className="py-6 text-center text-xs text-slate-500">No documents uploaded yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
