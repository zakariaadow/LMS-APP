import React from 'react'

const Button = ({ children, variant = 'primary', onClick, className = '', type = 'button' }) => {
  const variants = {
    primary: 'bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium',
    secondary: 'bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium',
    outline: 'border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-medium'
  }
  
  return (
    <button 
      type={type}
      className={`${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button