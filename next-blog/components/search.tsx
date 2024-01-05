import React from 'react';

export default function Search({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md text-black">
        <h1 className="mb-4">Search</h1>
        <p>The search functionality is under construction 🚧 .</p>
        <button onClick={onClose} className="mt-4 p-2 bg-blue-500 text-white">Close</button>
      </div>
    </div>
  );
}