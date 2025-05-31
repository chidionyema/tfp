import React from 'react';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import { UploadedPhoto } from '../../types/backgroundCheck';

interface DocumentCardProps {
  doc: UploadedPhoto;
  onRemove: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onRemove }) => (
  <div className="border rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{doc.name}</span>
      <button
        onClick={() => onRemove(doc.id)}
        className="text-red-600 hover:text-red-800 p-1"
        aria-label={`Remove ${doc.name}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mb-2 relative">
      <Image
        src={doc.url}
        alt={doc.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
      <button
        onClick={() => window.open(doc.url, '_blank')}
        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        <Eye size={12} />
        View
      </button>
    </div>
  </div>
);
