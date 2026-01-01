import React, { useState } from 'react';

// Define the types for the component's props
interface CheckboxProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  disabled = false,
  className = "",
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <label className={`flex items-center space-x-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className="form-checkbox h-4 w-4 text-blue-600 rounded"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};
