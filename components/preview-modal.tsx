'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PreviewModal({ file, open, onClose }: { file: any; open: boolean; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open || !file) return null;

  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-md" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Preview ${file.originalName}`}>
      <div className="mx-auto w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="section-card overflow-hidden p-0 shadow-[18px_18px_0_rgba(30,36,48,0.24)]">
          <div className="flex items-start justify-between gap-3 border-b border-[color:var(--border)] bg-[color:color-mix(in_oklab,var(--panel)_94%,white)] p-4 sm:p-5">
            <div className="min-w-0">
              <p className="pill mb-2">Preview</p>
              <h2 className="truncate title-sm font-semibold">{file.originalName}</h2>
              <p className="detail text-sm">{file.mimeType}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a className="btn btn-secondary btn-sm" href={`/api/files/${file.id}/download`}>
                <Download className="h-4 w-4" />
                Download
              </a>
              <button className="btn btn-secondary btn-sm" onClick={onClose} type="button" aria-label="Close preview">
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
          </div>
          <div className="bg-[color:color-mix(in_oklab,var(--surface)_82%,black)] p-3 sm:p-5">
            {isImage ? (
              <Image
                src={`/api/files/${file.id}/preview`}
                alt={file.originalName}
                width={1200}
                height={800}
                className="max-h-[72vh] w-full rounded-[18px] object-contain"
                unoptimized
              />
            ) : null}
            {isVideo ? (
              <video controls className="w-full max-h-[72vh] rounded-[18px] bg-black">
                <source src={`/api/files/${file.id}/preview`} type={file.mimeType} />
                Your browser does not support the video tag.
              </video>
            ) : null}
            {!isImage && !isVideo ? <div className="p-4 text-sm text-[color:var(--muted)]">Preview not available for this file type.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
