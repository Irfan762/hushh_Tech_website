import React from 'react';
import { Link } from 'react-router-dom';

const playfair = { fontFamily: "'Playfair Display', serif" };

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] bg-black text-white flex flex-col items-center justify-center p-6 text-center antialiased rounded-3xl mx-4 my-8 md:mx-auto md:max-w-4xl shadow-2xl border border-gray-800">
      <div className="max-w-md w-full flex flex-col items-center">
        <h1 className="text-[6rem] md:text-[8rem] font-light tracking-tighter text-gray-500 mb-2 leading-none" style={playfair}>
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-normal mb-4 tracking-tight" style={playfair}>
          Page Not Found
        </h2>
        <p className="text-gray-400 font-light mb-10 text-sm md:text-base leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          to="/"
          className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors duration-200 shadow-md"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
