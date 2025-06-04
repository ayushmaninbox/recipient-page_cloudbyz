import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Trash2, GripVertical } from 'lucide-react';

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
  
  const userInputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const reasonDropdownRef = useRef(null);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

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

  // Handle user input change
  const handleUserInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateRecipient(index, { ...recipient, name: value });
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    updateRecipient(index, { ...recipient, email: value });
  };

  // Handle reason selection
  const handleReasonSelect = (reason) => {
    updateRecipient(index, { ...recipient, reason });
    setShowReasonDropdown(false);
  };

  return (
    <div className="relative mb-4 bg-white rounded-lg shadow overflow-visible">
      {/* Left color indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5" 
        style={{ backgroundColor: colors[index % colors.length] }}
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
            <User size={18} className="text-gray-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Select or type a name"
              className="flex-1 outline-none text-sm min-w-0 truncate"
              value={searchTerm || recipient.name}
              onChange={handleUserInputChange}
              onFocus={() => setShowUserDropdown(true)}
            />
            <ChevronDown size={16} className="text-gray-500 flex-shrink-0 ml-2" />
          </div>

          {/* User dropdown */}
          {showUserDropdown && (
            <div 
              ref={userDropdownRef} 
              className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{user.name}</span>
                      <span className="text-xs text-gray-500 truncate">{user.email}</span>
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
              onChange={handleEmailChange}
              placeholder="Enter email"
              className="flex-1 outline-none text-sm min-w-0 truncate"
            />
          </div>
        </div>

        {/* Reason selection */}
        <div className="relative flex-1 min-w-0">
          <div
            ref={reasonDropdownRef}
            className="flex items-center border border-gray-300 rounded-lg px-3 py-2 cursor-pointer"
            onClick={() => setShowReasonDropdown(!showReasonDropdown)}
          >
            <input
              type="text"
              placeholder="Select reason to sign"
              className="flex-1 outline-none text-sm cursor-pointer min-w-0 truncate"
              value={recipient.reason}
              readOnly
            />
            <ChevronDown size={16} className="text-gray-500 flex-shrink-0 ml-2" />
          </div>

          {/* Reason dropdown */}
          {showReasonDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="max-h-48 overflow-y-auto py-1">
                {reasonOptions.map((reason, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm truncate"
                    onClick={() => handleReasonSelect(reason)}
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delete button */}
        <button 
          className="ml-2 text-red-500 hover:text-red-700 transition-colors p-1 flex-shrink-0"
          onClick={() => deleteRecipient(index)}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default RecipientRow;