import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const normalizeOptions = (options = []) => {
  return options
    .filter(Boolean)
    .map((option) => {
      if (typeof option === "string" || typeof option === "number") {
        return { value: option, label: option };
      }

      return {
        value: option.value,
        label: option.label || option.name || option.title || option.value,
        disabled: option.disabled,
      };
    })
    .filter((option) => option.value !== undefined && option.value !== null);
};

const SelectBox = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Chọn",
  allLabel = "Chọn tất cả",
  selectedSuffix = "đã chọn",
  selectedText,
  disabled = false,
  className = "",
  style = {},
  dropdownStyle = {},
  maxDropdownHeight = 320,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const items = useMemo(() => normalizeOptions(options), [options]);
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const enabledItems = items.filter((item) => !item.disabled);
  const enabledValues = enabledItems.map((item) => item.value);
  const selectedEnabledCount = enabledValues.filter((itemValue) => selectedValues.includes(itemValue)).length;
  const isAllSelected = enabledItems.length > 0 && selectedEnabledCount === enabledItems.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emitChange = (nextValue) => {
    if (onChange) {
      onChange(nextValue);
    }
  };

  const toggleValue = (itemValue) => {
    if (selectedValues.includes(itemValue)) {
      emitChange(selectedValues.filter((valueItem) => valueItem !== itemValue));
      return;
    }

    emitChange([...selectedValues, itemValue]);
  };

  const toggleAll = () => {
    if (isAllSelected) {
      emitChange(selectedValues.filter((itemValue) => !enabledValues.includes(itemValue)));
      return;
    }

    const nextValue = [...selectedValues];
    enabledValues.forEach((itemValue) => {
      if (!nextValue.includes(itemValue)) {
        nextValue.push(itemValue);
      }
    });
    emitChange(nextValue);
  };

  const renderLabel = () => {
    if (selectedText) return selectedText;
    if (selectedValues.length === 0) return placeholder;
    return `Đã chọn ${selectedValues.length} ${selectedSuffix}`;
  };

  return (
    <div
      ref={rootRef}
      className={`select-box ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`}
      style={style}
    >
      <button
        type="button"
        className="select-box__trigger"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={`select-box__placeholder ${selectedValues.length > 0 ? "is-selected" : ""}`}>
          {renderLabel()}
        </span>
        <span className="select-box__counter">
          {selectedValues.length}/{items.length}
        </span>
        <ChevronDown size={18} className="select-box__arrow" />
      </button>

      {open && (
        <div className="select-box__dropdown" style={{ maxHeight: maxDropdownHeight, ...dropdownStyle }}>
          <button
            type="button"
            className="select-box__option select-box__option--all"
            onClick={toggleAll}
            disabled={enabledItems.length === 0}
          >
            <span className={`select-box__checkbox ${isAllSelected ? "is-checked" : ""}`}>
              {isAllSelected && <Check size={11} strokeWidth={3} />}
            </span>
            <span className="select-box__option-label">{allLabel}</span>
            <span className="select-box__selected-count">
              {selectedValues.length}/{items.length} {selectedSuffix}
            </span>
          </button>

          <div className="select-box__divider" />

          <div className="select-box__list">
            {items.map((item) => {
              const checked = selectedValues.includes(item.value);
              return (
                <button
                  type="button"
                  key={item.value}
                  className={`select-box__option ${item.disabled ? "is-disabled" : ""}`}
                  disabled={item.disabled}
                  onClick={() => toggleValue(item.value)}
                >
                  <span className={`select-box__checkbox ${checked ? "is-checked" : ""}`}>
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="select-box__option-label">{item.label}</span>
                </button>
              );
            })}

            {items.length === 0 && (
              <div className="select-box__empty">Không có dữ liệu</div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .select-box {
          position: relative;
          width: 100%;
          min-width: 160px;
          font-family: inherit;
        }

        .select-box__trigger {
          width: 100%;
          height: 36px;
          border: 1px solid #d6dce5;
          border-radius: 4px;
          background: #fff;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 8px 0 12px;
          box-shadow: none;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .select-box__trigger:hover,
        .select-box.is-open .select-box__trigger {
          border-color: #b8c2d1;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.08);
        }

        .select-box__trigger:disabled {
          cursor: not-allowed;
          background: #f7f9fc;
          color: #9aa5b1;
        }

        .select-box__placeholder {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.3;
          color: #7a8493;
        }

        .select-box__placeholder.is-selected {
          color: #4a5568;
        }

        .select-box__counter {
          min-width: 36px;
          height: 22px;
          border-radius: 999px;
          background: #f1f4f8;
          color: #4a5568;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          line-height: 1;
        }

        .select-box__arrow {
          flex: 0 0 auto;
          color: #263d66;
          transition: transform 0.15s ease;
        }

        .select-box.is-open .select-box__arrow {
          transform: rotate(180deg);
        }

        .select-box__dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 1000;
          overflow: auto;
          border: 1px solid #e3e8ef;
          border-radius: 4px;
          background: #fff;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
          padding: 10px 12px;
        }

        .select-box__option {
          width: 100%;
          min-height: 30px;
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
          color: #2d3748;
          cursor: pointer;
          text-align: left;
        }

        .select-box__option:hover .select-box__option-label {
          color: #1f2937;
        }

        .select-box__option:disabled,
        .select-box__option.is-disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .select-box__option--all {
          padding-top: 0;
          padding-bottom: 8px;
        }

        .select-box__checkbox {
          width: 16px;
          height: 16px;
          flex: 0 0 16px;
          border: 2px solid #c9d2df;
          border-radius: 4px;
          background: #fff;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
        }

        .select-box__checkbox.is-checked {
          border-color: #3b82f6;
          background: #3b82f6;
        }

        .select-box__option-label {
          flex: 1;
          min-width: 0;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.35;
          color: #303948;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .select-box__selected-count {
          color: #5a6473;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }

        .select-box__divider {
          height: 1px;
          background: #e5e9f0;
          margin-bottom: 6px;
        }

        .select-box__list {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .select-box__empty {
          padding: 12px 0 4px;
          color: #7a8493;
          font-size: 15px;
        }
      `}</style>
    </div>
  );
};

export default SelectBox;
