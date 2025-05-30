// src/components/form/OptionGrid.tsx
import type { ReactNode } from 'react';

/** Anything with an id can sit in the grid   */
export interface BaseSelectOption {
  id: string;
}

export interface OptionGridProps<T extends BaseSelectOption> {
  options: T[];
  selected: string;
  onSelect: (id: string) => void;
  renderOption: (option: T) => ReactNode;
  ariaLabel: string;
  /** Radio-group name (must be stable per grid) */
  name: string;
}

/**
 * Reusable “cards as radio buttons” grid.
 */
export default function OptionGrid<T extends BaseSelectOption>({
  options,
  selected,
  onSelect,
  renderOption,
  ariaLabel,
  name,
}: OptionGridProps<T>) {
  return (
    <fieldset className="space-y-4" aria-label={ariaLabel}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const optionSpecificId = `${name}-${option.id}`;
          return (
            <label key={option.id} className="cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={selected === option.id}
                onChange={() => onSelect(option.id)}
                className="sr-only"
                aria-labelledby={optionSpecificId}
              />
              <div
                id={optionSpecificId}
                className={`p-4 border-2 rounded-lg text-left transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 ${
                  selected === option.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                role="radio"
                aria-checked={selected === option.id}
                tabIndex={0}
                onClick={() => onSelect(option.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(option.id);
                  }
                }}
              >
                {renderOption(option)}
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
