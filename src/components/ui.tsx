import React from 'react';

export const Card = ({ children, className = '', onClick, ...props }: { children: React.ReactNode, className?: string, onClick?: () => void, [key: string]: any }) => (
  <div 
    {...props}
    onClick={onClick}
    className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden ${className} ${onClick ? 'cursor-pointer hover:bg-white/10 transition-all duration-300' : ''}`}
  >
    {children}
  </div>
);

export const Button = ({ children, className = '', onClick, type = 'button', variant = 'primary', size = 'md', disabled = false, isLoading = false, title }: { 
  children: React.ReactNode, 
  className?: string, 
  onClick?: () => void, 
  type?: 'button' | 'submit',
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
  size?: 'sm' | 'md' | 'lg',
  disabled?: boolean,
  isLoading?: boolean,
  title?: string
}) => {
  const variants = {
    primary: 'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-lg shadow-accent-blue/20',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    danger: 'bg-accent-red text-white hover:bg-accent-red/90 shadow-lg shadow-accent-red/20',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5'
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm rounded-lg',
    md: 'px-6 py-2.5 rounded-xl text-base',
    lg: 'px-8 py-3.5 rounded-2xl text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title}
      className={`font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

export const Input = ({ label, className = '', ...props }: { label?: string, className?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-sm font-medium text-text-secondary ml-1">{label}</label>}
    <input
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all ${className}`}
      {...props}
    />
  </div>
);

export const Badge = ({ children, variant = 'info' }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'danger' | 'info' }) => {
  const variants = {
    success: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    warning: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    danger: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const Alert = ({ children, variant = 'info', icon: Icon }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'danger' | 'info', icon?: any }) => {
  const variants = {
    success: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
    warning: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
    danger: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${variants[variant]}`}>
      {Icon && <Icon className="w-5 h-5 shrink-0 mt-0.5" />}
      <div className="text-sm font-medium leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title?: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-secondary-bg border border-white/10 rounded-2xl w-full max-w-md p-8 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
        {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
};
