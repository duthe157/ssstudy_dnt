"use client";

import { useState, useRef, useEffect } from "react";
import "./searchable-select.css";

interface Option {
    _id: string;
    name?: string;
    fullname?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    nameKey?: 'name' | 'fullname';
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Chọn...",
    className = "",
    nameKey = 'name'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Lấy tên hiển thị của option
    const getOptionName = (option: Option): string => {
        return nameKey === 'fullname' ? (option.fullname || '') : (option.name || '');
    };

    // Tìm option được chọn
    const selectedOption = options.find(opt => opt._id === value);
    const selectedText = selectedOption ? getOptionName(selectedOption) : placeholder;

    // Filter options dựa trên search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option => {
                const optionName = getOptionName(option).toLowerCase();
                const search = searchTerm.toLowerCase();
                
                // Tìm kiếm gần đúng: bao gồm cả tìm kiếm theo từng từ
                return optionName.includes(search) || 
                       search.split(' ').every(term => optionName.includes(term.trim()));
            });
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, nameKey]);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus vào input khi mở dropdown
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm("");
        }
    };

    const handleOptionClick = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm("");
        } else if (e.key === 'Enter' && filteredOptions.length > 0) {
            // Chọn option đầu tiên khi nhấn Enter
            const firstOption = filteredOptions[0];
            if (firstOption && firstOption._id !== value) {
                handleOptionClick(firstOption._id);
            }
        }
    };

    return (
        <div className={`searchable-select ${className}`} ref={containerRef}>
            <div 
                className={`select-trigger ${isOpen ? 'open' : ''}`}
                onClick={handleToggle}
            >
                <span className="select-text">{selectedText}</span>
                <span className={`select-arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
            </div>

            {isOpen && (
                <div className="select-dropdown">
                    <div className="search-container">
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    
                    <div className="options-container">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option._id}
                                    className={`select-option ${option._id === value ? 'selected' : ''}`}
                                    onClick={() => handleOptionClick(option._id)}
                                >
                                    {getOptionName(option)}
                                </div>
                            ))
                        ) : (
                            <div className="no-options">Không tìm thấy kết quả</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
