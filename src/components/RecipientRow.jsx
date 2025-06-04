import React, { useState, useRef, useEffect } from 'react';
import { User, X, ChevronDown, Trash2, GripVertical } from 'lucide-react';

const RecipientRow = ({ 
  index, 
  recipient, 
  updateRecipient, 
  deleteRecipient, 
  users,
  reasonOptions,
  showOrder,
  colors
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [showCustomReasonModal, setShowCustomReasonModal] = useState(false);
  const [customReason, setCustomReason] = useState('');
  
  const userInputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const reasonDropdownRef = useRef(null);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target) && 
          userInputRef.current && !userInputRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      
      if (reasonDropdownRef.current && !reasonDropdownRef.current.contains(event.target)) {
        setShowReasonDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user selection
  const handleUserSelect = (user) => {
    updateRecipient(index, { 
      ...recipient, 
      name: user.name, 
      email: user.email 
    });
    setShowUserDropdown(false);
    setSearchTerm('');
  };

  // Handle enter key in user input
  const handleUserInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredUsers.length > 0) {
        handleUserSelect(filteredUsers[0]);
      }
    }
  };

  // Handle reason selection
  const handleReasonSelect = (reason) => {
    if (reason === 'Other') {
      setShowCustomReasonModal(true);
    } else {
      updateRecipient(index, { ...recipient, reason });
    }
    setShowReasonDropdown(false);
  };

  // Handle custom reason submission
  const handleCustomReasonSubmit = () => {
    if (customReason.trim()) {
      updateRecipient(index, { ...recipient, reason: customReason });
    }
    setShowCustomReasonModal(false);
    setCustomReason('');
  };

  // Get background color for the indicator
  const indicatorColor = colors[index % colors.length];

  return (
    <div className="relative mb-4 bg-white rounded-lg shadow overflow-visible">
      {/* Left color indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5" 
        style={{ backgroundColor: indicatorColor }}
      />

      <div className="flex items-center px-4 py-3">
        {/* Order number */}
        {showOrder && (
          <div className="flex items-center mr-2">
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
              {index + 1}
            </span>
            <GripVertical size={18} className="ml-2 text-gray-400 cursor-move" />
          </div>
        )}

        {/* User selection */}
        <div className="relative flex-1 min-w-0">
          <div 
            ref={userInputRef}
            className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
            onClick={() => setShowUserDropdown(true)}
          >
            <User size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Select a user"
              className="flex-1 outline-none text-sm"
              value={searchTerm !== '' ? searchTerm : recipient.name}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowUserDropdown(true)}
              onKeyDown={handleUserInputKeyDown}
            />
            <ChevronDown size={16} className="text-gray-500" />
          </div>

          {/* User dropdown */}
          {showUserDropdown && (
            <div 
              ref={userDropdownRef} 
              className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                    onClick={() => handleUserSelect(user)}
                  >
                    <User size={16} className="text-gray-500 mr-2" />
                    <div>
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({user.email})</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No users found</div>
              )}
            </div>
          )}
        </div>

        {/* Email field */}
        <div className="relative flex-1 min-w-0 mx-2">
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
            <input
              type="email"
              value={recipient.email}
              placeholder="Recipient Email"
              className="flex-1 outline-none text-sm"
              readOnly
            />
          </div>
        </div>

        {/* Reason selection */}
        <div className="relative flex-1 min-w-0">
          <div
            className="flex items-center border border-gray-300 rounded-lg px-3 py-2 cursor-pointer"
            onClick={() => setShowReasonDropdown(true)}
            ref={reasonDropdownRef}
          >
            <input
              type="text"
              placeholder="Select reason to sign"
              className="flex-1 outline-none text-sm cursor-pointer"
              value={recipient.reason}
              readOnly
            />
            <ChevronDown size={16} className="text-gray-500" />
          </div>

          {/* Reason dropdown */}
          {showReasonDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
              {reasonOptions.map((reason, i) => (
                <div
                  key={i}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  onClick={() => handleReasonSelect(reason)}
                >
                  {reason}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete button */}
        <button 
          className="ml-2 text-red-500 hover:text-red-700 transition-colors p-1"
          onClick={() => deleteRecipient(index)}
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Custom reason modal */}
      {showCustomReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Please give the new Reason for Signature!</h2>
              <button 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => setShowCustomReasonModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter your input..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              autoFocus
            />
            <button
              className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
              onClick={handleCustomReasonSubmit}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientRow;