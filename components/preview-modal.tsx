'use client';

import Image from 'next/image';
import { useEffect } from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal>
      <div className="max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="section-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="title-sm font-semibold">{file.originalName}</h2>
              <p className="detail text-sm">{file.mimeType}</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onClose} type="button">Close</button>
          </div>
          <div className="mt-4">
            {isImage ? (
              <Image
                src={`/api/files/${file.id}/preview`}
                alt={file.originalName}
                width={1200}
                height={800}
                className="max-h-[70vh] w-full rounded-2xl object-contain"
                unoptimized
              />
            ) : null}
            {isVideo ? (
              <video controls className="w-full max-h-[70vh] rounded-2xl bg-black">
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
