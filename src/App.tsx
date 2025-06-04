import React from 'react';
import Recipients from './components/Recipients.jsx';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Recipients />
    </div>
  );
}

export default App;