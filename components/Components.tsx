import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }> = ({ children, className = '', title, action }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        {title && <h3 className="text-lg font-bold text-gray-800">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6 text-gray-600">{children}</div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white shadow-sm";
  const variants = {
    primary: "bg-spr-accent hover:bg-spr-accent_hover text-white focus:ring-blue-500",
    secondary: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-200",
    danger: "bg-spr-danger hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-spr-success hover:bg-emerald-700 text-white focus:ring-emerald-500",
    outline: "bg-transparent border border-white text-white hover:bg-white/10",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>
      {children}
    </button>
  );
};

export const BackButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)} 
      className={`flex items-center text-gray-500 hover:text-gray-800 transition-colors ${className}`}
      title="Go Back"
    >
      <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span className="text-sm font-medium">Back</span>
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; numericOnly?: boolean }> = ({ label, numericOnly, className = '', onChange, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  // Determine display value: if focused, type is number, and value is 0, show empty string
  const getDisplayValue = () => {
    if (props.type === 'number' && isFocused && Number(props.value) === 0) {
      return '';
    }
    return props.value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (numericOnly) {
      // Remove any non-digit characters
      const sanitized = e.target.value.replace(/[^0-9]/g, '');
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input 
        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-spr-accent focus:ring-1 focus:ring-spr-accent outline-none transition-colors shadow-sm ${className}`} 
        {...props}
        onChange={handleChange}
        value={getDisplayValue()}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus && props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur && props.onBlur(e);
        }}
      />
    </div>
  );
};

export const SearchInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { onClear: () => void; containerClassName?: string }> = ({ onClear, value, className = '', containerClassName = '', ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <input 
        {...props}
        ref={inputRef}
        value={value}
        className={`w-full bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-gray-900 placeholder-gray-400 focus:border-spr-accent focus:ring-1 focus:ring-spr-accent outline-none transition-colors shadow-sm ${className}`} 
      />
      {value && (
        <button 
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all"
          title="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select 
      className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-spr-accent focus:ring-1 focus:ring-spr-accent outline-none transition-colors shadow-sm ${className}`} 
      {...props} 
    >
      {children}
    </select>
  </div>
);

export const Pagination: React.FC<{ 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button 
        variant="secondary" 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 text-sm"
      >
        Prev
      </Button>
      <span className="text-gray-600 text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <Button 
        variant="secondary" 
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 text-sm"
      >
        Next
      </Button>
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-lg',
    'lg': 'max-w-2xl',
    'xl': 'max-w-4xl',
    '2xl': 'max-w-6xl',
    'full': 'max-w-[95vw]'
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-white border border-gray-200 rounded-xl shadow-2xl w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto transform transition-all scale-100 flex flex-col`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10 shrink-0">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 text-gray-600 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ConfirmationModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}> = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="space-y-4">
      <p className="text-gray-600">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
      </div>
    </div>
  </Modal>
);

export const ToastOverlay: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const bg = toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  
  const icon = toast.type === 'success' 
    ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 
    : toast.type === 'error'
    ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-fade-in">
       <div className={`${bg} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px]`}>
          <div className="shrink-0">{icon}</div>
          <span className="font-medium text-sm">{toast.message}</span>
       </div>
    </div>
  );
};

// Precisely Recreated SPR Logo SVG based on provided actual logo image
export const Logo: React.FC<{ size?: 'sm' | 'lg'; inverse?: boolean }> = ({ size = 'sm', inverse = false }) => {
  const width = size === 'lg' ? 240 : 160;
  const height = size === 'lg' ? 100 : 70;
  
  return (
    <div className={`flex items-center gap-2 ${size === 'lg' ? 'flex-col' : ''}`}>
      <svg width={width} height={height} viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoTextGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={inverse ? "#FFFFFF" : "#4fa8ff"} />
            <stop offset="100%" stopColor={inverse ? "#e0e7ff" : "#1e40af"} />
          </linearGradient>
          <linearGradient id="logoOrbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="logoBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={inverse ? "#93c5fd" : "#1e40af"} />
            <stop offset="100%" stopColor={inverse ? "#3b82f6" : "#0f172a"} />
          </linearGradient>
          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            <feOffset dx="1" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Bottom Dark Blue Base Swoosh - Solid and Bold */}
        <path 
          d="M30 55 C 50 72, 130 75, 175 50 C 150 70, 70 85, 30 55" 
          fill="url(#logoBaseGradient)" 
          opacity="1"
        />

        {/* 2. Main Gold/Orange Orbit Ring (Passes behind first letter) */}
        <ellipse 
          cx="102" cy="42" rx="88" ry="24" 
          stroke="url(#logoOrbitGradient)" 
          strokeWidth="7" 
          fill="none" 
          transform="rotate(-5, 102, 42)"
          strokeLinecap="round"
        />

        {/* 3. The SPR Text - Precise Bold Italic Styling */}
        <text 
          x="100" y="55" 
          textAnchor="middle" 
          fontSize="52" 
          fontWeight="900" 
          fontStyle="italic" 
          fill="url(#logoTextGradient)" 
          fontFamily="'Arial Black', sans-serif"
          style={{ letterSpacing: '-3px', filter: 'url(#logoShadow)' }}
        >
          SPR
        </text>

        {/* 4. Top Overlay Part of Orbit (to create the wrapping effect over the S and P) */}
        <path 
          d="M14 42 C 14 30, 60 25, 100 25" 
          stroke="url(#logoOrbitGradient)" 
          strokeWidth="7" 
          fill="none" 
          transform="rotate(-5, 102, 42)"
          strokeLinecap="round"
        />
      </svg>
      {size === 'lg' && (
        <div className={`font-black tracking-[0.25em] text-2xl uppercase -mt-4 drop-shadow-sm ${inverse ? 'text-white' : 'text-spr-900'}`}>
          Techforge
        </div>
      )}
    </div>
  );
};
