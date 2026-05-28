'use client';

import { useState } from 'react';

export function UploadZone({ onUploaded }: { onUploaded?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  async function uploadSelected() {
    if (!file) return;
    setBusy(true);
    setStatus('');
    const chunkSize = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const fileId = crypto.randomUUID();

    for (let index = 0; index < totalChunks; index++) {
      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const form = new FormData();
      form.append('chunk', chunk);
      form.append('fileId', fileId);
      form.append('fileName', file.name);
      form.append('mimeType', file.type || 'application/octet-stream');
      form.append('fileSize', String(file.size));
      form.append('chunkIndex', String(index));
      form.append('totalChunks', String(totalChunks));

      const csrf = document.cookie.split('; ').find((c) => c.startsWith('nd_csrf='))?.split('=')[1] || '';
      const res = await fetch('/api/files/upload', { method: 'POST', body: form, headers: { 'x-csrf-token': csrf } });
      const data = await res.json();
      if (!res.ok) {
        setBusy(false);
        setStatus(data.error || 'Upload failed');
        return;
      }
      setProgress(Math.round(((index + 1) / totalChunks) * 100));
    }

    setBusy(false);
    setStatus('Upload complete');
    setFile(null);
    setProgress(0);
    onUploaded?.();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="section-card space-y-4">
      <div className="stack-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="title-md font-semibold">Upload files</h2>
            <p className="detail mt-2 text-sm leading-6">Chunked upload in one app, with CSRF protection and storage quota checks.</p>
          </div>
          <span className="pill">Drag & drop</span>
        </div>
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('file-input')?.click(); }}
        className="upload-dropzone p-4 sm:p-5">
        <input id="file-input" className="field" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[color:var(--muted)]">Or drag and drop a file here. Large files are split into chunks automatically.</p>
          {file ? <p className="text-sm font-medium text-[color:var(--text)]">Selected: {file.name}</p> : <p className="text-sm text-[color:var(--muted)]">No file selected</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={!file || busy} className="btn btn-primary" onClick={uploadSelected} type="button">
          {busy ? 'Uploading...' : 'Upload'}
        </button>
        <span className="text-sm text-[color:var(--muted)]">{progress ? `${progress}%` : status}</span>
      </div>
    </div>
  );
}
