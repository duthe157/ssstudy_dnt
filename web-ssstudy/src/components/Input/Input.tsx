import { useId } from 'react';
import clsx from 'clsx';

type TextInputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

export default function TextInput({
  label,
  placeholder = '',
  value,
  onChange,
  disabled = false,
}: TextInputProps) {
  const inputId = useId();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
        )}
      />
    </div>
  );
}
