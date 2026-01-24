'use client';

import { X } from 'lucide-react';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export default function Chip({ label, onRemove, className = '' }: ChipProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs ${
        onRemove ? 'pr-1' : ''
      } ${className}`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
