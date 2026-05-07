import React from 'react';

const SymbolicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden opacity-[0.03] select-none">
      {/* Abstract Math & Geometric Symbols */}
      <svg width="100%" height="100%" className="w-full h-full">
        <pattern id="symbol-pattern" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
          {/* Pi symbol */}
          <text x="50" y="100" fontSize="40" fill="black" fontFamily="serif">π</text>
          {/* Integral */}
          <text x="250" y="150" fontSize="60" fill="black" fontFamily="serif">∫</text>
          {/* Summation */}
          <text x="100" y="300" fontSize="50" fill="black" fontFamily="serif">Σ</text>
          {/* Delta */}
          <text x="320" y="50" fontSize="30" fill="black" fontFamily="serif">Δ</text>
          {/* Geometric shapes */}
          <circle cx="200" cy="200" r="80" stroke="black" strokeWidth="1" fill="none" />
          <rect x="150" y="150" width="100" height="100" stroke="black" strokeWidth="0.5" fill="none" transform="rotate(45 200 200)" />
          {/* Constellation-like dots */}
          <circle cx="40" cy="40" r="1.5" fill="black" />
          <circle cx="120" cy="180" r="1" fill="black" />
          <circle cx="350" cy="350" r="1.2" fill="black" />
          <path d="M40 40 L120 180 L350 350" stroke="black" strokeWidth="0.5" strokeDasharray="4 4" fill="none" />
          
          {/* Infinity */}
          <text x="300" y="280" fontSize="40" fill="black" fontFamily="serif">∞</text>
        </pattern>
        <rect width="100%" height="100%" fill="url(#symbol-pattern)" />
      </svg>
      
      {/* Large faint geometric accents */}
      <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] border border-black/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] border border-black/5 rounded-full blur-3xl" />
    </div>
  );
};

export default SymbolicBackground;
