'use client';

import { useState } from 'react';

export function UploadZone({ onUploaded }: { onUploaded?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  function selectFile(nextFile: File | null) {
    setFile(nextFile);
    setStatus('');
    setProgress(0);
  }

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
      form.append('totalSize', String(file.size));
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
    setProgress(100);
    setFile(null);
    onUploaded?.();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) selectFile(f);
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
        onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('file-input')?.click(); }}
        className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--panel-strong)] p-4">
        <input
          id="file-input"
          className="field"
          type="file"
          accept=".txt,.md,.csv,.json,.xml,.rtf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.flac,.mp4,.webm,.mov,.mkv"
          onChange={(e) => selectFile(e.target.files?.[0] || null)}
        />
        <p className="mt-3 text-sm text-[color:var(--muted)]">Or drag and drop a file here. Large files are split into chunks automatically.</p>
      </div>
      {file ? (
        <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium">{file.name}</span>
            <span className="text-[color:var(--muted)]">{Math.round(file.size / 1024 / 1024)} MB</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[color:var(--border)]" aria-hidden="true">
            <div className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-[color:var(--muted)]">
            <span>{busy ? 'Uploading…' : progress === 100 ? 'Ready to upload again' : 'Queued'}</span>
            <span>{progress}%</span>
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={!file || busy} className="btn btn-primary" onClick={uploadSelected} type="button">
          {busy ? 'Uploading...' : 'Upload'}
        </button>
        <span className="text-sm text-[color:var(--muted)]">{status}</span>
      </div>
    </div>
  );
}
