import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from 'lucide-react';

type Option = {
    label: string;
    value: string;
};

type SelectDropdownProps = {
    options: Option[];
    selected: Option | null;
    onChange: (value: Option) => void;
    label?: string;
    disabled?: boolean;
    minWidth?: number;
    placeholder?: string;
  };

export default function Dropwdown({
    options,
    selected,
    onChange,
    disabled = false,
    minWidth = 48,
    placeholder,
  }: SelectDropdownProps) {

  return (
    <div className={`w-${minWidth}`}>
      <Listbox value={selected} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className="min-h-[32px] relative w-full cursor-default rounded-lg bg-white py-2 pl-3 text-left border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            {/* <span className="block truncate">{selected?.label}</span> */}
            <span className="block truncate">
              {selected ? selected.label : <span className="text-gray-400">{placeholder}</span>}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {options.map((option, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
