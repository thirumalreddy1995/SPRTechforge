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
    <div className={`relative w-full ${containerClassName}`}>
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
          className="absolute right-2 top-0 bottom-0 flex items-center p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-all h-full"
          title="Clear search"
        >
          <div className="hover:bg-gray-100 p-1 rounded-md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
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

export interface SearchableSelectOption {
  value: string;
  label: string;
  group?: string;
  meta?: string; // small helper text shown below label
}

export const SearchableSelect: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
  containerClassName?: string;
}> = ({ label, value, onChange, options, placeholder = 'Select...', required, hint, containerClassName = 'mb-4' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value);

  const filtered = search.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        (o.group && o.group.toLowerCase().includes(search.toLowerCase())) ||
        (o.meta && o.meta.toLowerCase().includes(search.toLowerCase()))
      )
    : options;

  // Build grouped structure preserving order
  const groupOrder: string[] = [];
  const groups: Record<string, SearchableSelectOption[]> = {};
  const ungrouped: SearchableSelectOption[] = [];
  filtered.forEach(o => {
    if (o.group) {
      if (!groups[o.group]) { groups[o.group] = []; groupOrder.push(o.group); }
      groups[o.group].push(o);
    } else {
      ungrouped.push(o);
    }
  });
  const uniqueGroupOrder = [...new Set(groupOrder)];

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${containerClassName}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left text-gray-900 focus:border-spr-accent focus:ring-1 focus:ring-spr-accent outline-none transition-colors shadow-sm flex items-center justify-between gap-2 min-h-[42px]"
      >
        <span className={`truncate text-sm ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); handleSelect(''); }}
              className="text-gray-300 hover:text-gray-500 p-0.5 rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Type to search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && setIsOpen(false)}
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-spr-accent outline-none bg-white"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto overscroll-contain">
            {/* Empty / clear option */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-50 transition-colors ${!value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {placeholder}
            </button>

            {ungrouped.map(o => (
              <button key={o.value} type="button" onClick={() => handleSelect(o.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === o.value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-700'}`}>
                {o.label}
                {o.meta && <span className="ml-1 text-[10px] text-gray-400">{o.meta}</span>}
              </button>
            ))}

            {uniqueGroupOrder.map(group => (
              <div key={group}>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border-t border-gray-100 sticky top-0">
                  {group}
                </div>
                {groups[group].map(o => (
                  <button key={o.value} type="button" onClick={() => handleSelect(o.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === o.value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-800 hover:bg-indigo-50 hover:text-indigo-700'}`}>
                    {o.label}
                    {o.meta && <div className="text-[10px] text-gray-400">{o.meta}</div>}
                  </button>
                ))}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-400 text-center">
                No results for "<span className="font-medium">{search}</span>"
              </div>
            )}
          </div>
        </div>
      )}

      {hint && <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">{hint}</p>}
    </div>
  );
};

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

export const Logo: React.FC<{ size?: 'sm' | 'lg'; inverse?: boolean }> = ({ size = 'sm', inverse = false }) => {
  const isLg = size === 'lg';
  const uid = isLg ? 'lg' : 'sm'; // unique gradient IDs per size to avoid SVG ID collision

  return (
    <div className={`flex items-center ${isLg ? 'gap-4' : 'gap-2.5'} select-none`}>
      {/* Icon mark */}
      <svg
        width={isLg ? 72 : 44}
        height={isLg ? 72 : 44}
        viewBox="0 0 72 72"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`bgGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={inverse ? '#3b82f6' : '#1e3a8a'} />
            <stop offset="100%" stopColor={inverse ? '#1d4ed8' : '#0f172a'} />
          </linearGradient>
          <linearGradient id={`arcGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id={`textGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={inverse ? '#bfdbfe' : '#93c5fd'} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx="36" cy="36" r="34" fill={`url(#bgGrad-${uid})`} />

        {/* Orbit arc — top half, wraps over text */}
        <path
          d="M10 34 A26 26 0 0 1 62 34"
          stroke={`url(#arcGrad-${uid})`}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* SPR text */}
        <text
          x="36"
          y="47"
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fontStyle="italic"
          fill={`url(#textGrad-${uid})`}
          fontFamily="'Arial Black', Arial, sans-serif"
        >
          SPR
        </text>

        {/* Bottom accent swoosh */}
        <path
          d="M12 50 Q36 62 60 50"
          stroke={`url(#arcGrad-${uid})`}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* Wordmark */}
      <div className={`flex flex-col leading-none ${isLg ? 'gap-1' : 'gap-0.5'}`}>
        <span
          className={`font-black tracking-tight ${isLg ? 'text-3xl' : 'text-xl'} ${inverse ? 'text-white' : 'text-spr-900'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          SPR
        </span>
        <span
          className={`font-bold tracking-[0.18em] uppercase ${isLg ? 'text-base' : 'text-[10px]'} ${inverse ? 'text-blue-200' : 'text-spr-600'}`}
        >
          Techforge
        </span>
      </div>
    </div>
  );
};