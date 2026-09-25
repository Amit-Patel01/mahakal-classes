'use client';

import React from 'react';
import { X, Download, ExternalLink, FileText, Video as VideoIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { formatVideoEmbedUrl } from '@/lib/videoUtils';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'pdf' | 'video' | 'image';
  fileId?: string;
  externalUrl?: string;
}

export default function MediaModal({
  isOpen,
  onClose,
  title,
  type,
  fileId,
  externalUrl,
}: MediaModalProps) {
  if (!isOpen) return null;

  const streamUrl = fileId ? api.getFileStreamUrl(fileId) : externalUrl;
  const downloadUrl = fileId ? api.getFileDownloadUrl(fileId) : externalUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-navy-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {type === 'pdf' ? (
              <FileText className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <VideoIcon className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <h3 className="font-bold text-sm truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {streamUrl && type === 'pdf' && (
              <a
                href={streamUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition"
                title="Open PDF in Full Browser Window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in New Tab</span>
              </a>
            )}

            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition"
                title="Download File"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 bg-slate-950 p-2 overflow-auto flex items-center justify-center min-h-[450px]">
          {type === 'pdf' && (
            <div className="w-full h-full min-h-[600px] flex flex-col relative">
              <iframe
                src={streamUrl}
                className="w-full flex-1 min-h-[580px] rounded-lg border-0 bg-white"
                title={title}
              />
            </div>
          )}

          {type === 'video' && (
            <div className="w-full h-full flex items-center justify-center">
              {externalUrl ? (
                (() => {
                  const { embedUrl, detectedName } = formatVideoEmbedUrl(externalUrl);
                  return (
                    <iframe
                      src={embedUrl}
                      className="w-full aspect-video max-w-4xl rounded-xl border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={title || detectedName}
                    />
                  );
                })()
              ) : (
                <video
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] rounded-xl shadow-lg bg-black"
                >
                  <source src={streamUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {type === 'image' && (
            <img
              src={streamUrl}
              alt={title}
              className="max-h-[75vh] max-w-full rounded-xl object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
