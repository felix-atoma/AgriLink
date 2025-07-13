import React from 'react';
import PropTypes from 'prop-types';

const Input = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 border rounded-md shadow-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:outline-none focus:ring-green-500 focus:border-green-500`}
        {...props}
      />
      {error?.message && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  error: PropTypes.object,
  className: PropTypes.string
};

export default Input;
