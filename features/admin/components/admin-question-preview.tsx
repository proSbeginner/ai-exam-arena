'use client';

import { useState } from 'react';

interface AdminQuestionPreviewProps {
  question: string;
}

const PREVIEW_LENGTH = 180;

export function AdminQuestionPreview({ question }: AdminQuestionPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canToggle = question.length > PREVIEW_LENGTH;

  return (
    <div className="mt-2">
      <div className="relative overflow-hidden rounded-xl">
        <h3 className={`rounded-xl bg-purple-50/70 px-3 py-2 font-bold leading-relaxed whitespace-pre-line text-gray-800 ${!isExpanded && canToggle ? 'line-clamp-3' : ''}`}>
          {question}
        </h3>
        {!isExpanded && canToggle && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 rounded-b-xl bg-gradient-to-t from-purple-50 via-purple-50/80 to-transparent backdrop-blur-[1px]" aria-hidden />}
      </div>
      {canToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          className="ml-3 mt-1 cursor-pointer text-xs font-bold text-purple-500 hover:text-pink-500"
        >
          {isExpanded ? 'ย่อ' : 'ขยาย'}
        </button>
      )}
    </div>
  );
}
