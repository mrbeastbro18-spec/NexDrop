"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { PreviewModal } from './preview-modal';

type FileItem = {
  id: string;
  originalName: string;
  mimeType: string;
  size: string;
  createdAt: string;
  shareToken?: string | null;
};

export function FileGrid({ files, onShare }: { files: FileItem[]; onShare?: (id: string) => void }) {
  const [preview, setPreview] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  if (!files.length) return <div className="section-card empty-state">No files yet. Upload your first item to start sharing.</div>;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {files.map((file) => (
        <motion.div
          key={file.id}
          className="file-card space-y-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="stack-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="title-sm font-semibold">{file.originalName}</h3>
                <p className="detail text-sm">{file.mimeType}</p>
              </div>
              <span className="pill shrink-0">{file.size}</span>
            </div>
            <p className="meta text-xs">Uploaded {new Date(file.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a aria-label={`Download ${file.originalName}`} className="btn btn-secondary btn-sm" href={`/api/files/${file.id}/download`}>Download</a>
            <button aria-label={`Preview ${file.originalName}`} className="btn btn-secondary btn-sm" onClick={() => { setPreview(file); setOpen(true); }} type="button">Preview</button>
            {file.shareToken ? <a aria-label={`Open share for ${file.originalName}`} className="btn btn-secondary btn-sm" href={`/share/${file.shareToken}`}>Open share</a> : null}
            {onShare ? <button aria-label={`Create share for ${file.originalName}`} className="btn btn-primary btn-sm" onClick={() => onShare(file.id)} type="button">Create share</button> : null}
          </div>
        </motion.div>
      ))}
      <PreviewModal file={preview} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
