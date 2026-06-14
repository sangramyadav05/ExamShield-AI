import React from 'react';

const Card = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`glass-card p-6 rounded-2xl ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
