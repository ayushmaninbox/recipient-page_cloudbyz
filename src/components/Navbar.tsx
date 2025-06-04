import React from 'react';
import { User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 h-14 px-6 flex justify-between items-center">
      <img src="/images/cloudbyz.png" alt="Cloudbyz Logo" className="h-8 object-contain" />
      <a 
        href="https://www.google.com" 
        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
      >
        <User className="w-5 h-5 text-slate-600" />
      </a>
    </nav>
  );
};

export default Navbar;