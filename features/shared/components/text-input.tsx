import type { InputHTMLAttributes, ReactNode } from 'react';

function TextInputMessage({
  isError,
  message,
  messageId,
}: {
  isError: boolean;
  message?: ReactNode;
  messageId: string;
}) {
  if (!message) return null;

  return (
    <p
      id={messageId}
      className={`mt-1 flex items-center justify-start pl-4 text-left text-xs font-medium ${
        isError ? 'text-red-500' : 'text-gray-400'
      }`}
      role={isError ? 'alert' : undefined}
    >
      {message}
    </p>
  );
}

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
  error?: ReactNode;
  hint?: ReactNode;
  showCounter?: boolean;
}

export function TextInput({
  className = '',
  error,
  hint,
  id,
  maxLength,
  showCounter = false,
  value = '',
  ...inputProps
}: TextInputProps) {
  const messageId = `${id}-message`;
  const currentValue = typeof value === 'string' ? value : '';
  const hasMessage = Boolean(error ?? hint);
  const shouldShowCounter = showCounter && typeof maxLength === 'number';

  return (
    <div>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          maxLength={maxLength}
          value={value}
          aria-describedby={hasMessage ? messageId : undefined}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border-2 border-purple-200 bg-purple-50 py-3 pl-4 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0 ${
            shouldShowCounter ? 'pr-14' : 'pr-4'
          } ${className}`}
        />
        {shouldShowCounter && (
          <span className="absolute right-4 top-3.5 text-xs text-gray-400" aria-live="polite">
            {maxLength - currentValue.length}
          </span>
        )}
      </div>
      {hasMessage && (
        <TextInputMessage
          isError={Boolean(error)}
          message={error ?? hint}
          messageId={messageId}
        />
      )}
    </div>
  );
}
