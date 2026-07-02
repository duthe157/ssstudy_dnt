'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value: externalValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const value = externalValue || selectedValue;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-[150px] px-4 py-2 text-gray-400 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none"
      >
        <span className="text-sm font-normal truncate">{value || label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                className={`
                  block w-full px-4 py-2 text-sm text-left text-gray-700
                  hover:bg-gray-50 hover:text-gray-900
                  ${value === option ? 'bg-gray-50 text-gray-900' : ''}
                `}
                onClick={() => {
                  setSelectedValue(option);
                  onChange?.(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
