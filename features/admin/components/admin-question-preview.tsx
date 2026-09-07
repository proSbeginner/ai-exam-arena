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
    <>
      <h3 className={`font-bold text-gray-800 ${!isExpanded && canToggle ? 'line-clamp-3' : ''}`}>
        {question}
      </h3>
      {canToggle && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          className="mt-1 cursor-pointer text-xs font-bold text-purple-500 hover:text-pink-500"
        >
          {isExpanded ? 'ย่อ' : 'ขยาย'}
        </button>
      )}
    </>
  );
}
