import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Trash2, GripVertical, FileText, X } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';

const RecipientRow = ({ 
  index, 
  recipient, 
  updateRecipient, 
  deleteRecipient, 
  users,
  showOrder,
  colors,
  reasonOptions,
  otherReasons,
  onDeleteReason,
  onReasonSaved,
  onReasonSaveFailed
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
  const [selectedReasonIndex, setSelectedReasonIndex] = useState(-1);
  
  const userInputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const reasonInputRef = useRef(null);
  const reasonDropdownRef = useRef(null);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target) && 
          userInputRef.current && !userInputRef.current.contains(event.target)) {
        setShowUserDropdown(false);
        setSelectedUserIndex(-1);
      }
      if (reasonDropdownRef.current && !reasonDropdownRef.current.contains(event.target) && 
          reasonInputRef.current && !reasonInputRef.current.contains(event.target)) {
        setShowReasonDropdown(false);
        setSelectedReasonIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserKeyDown = (e) => {
    if (!showUserDropdown || filteredUsers.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedUserIndex(prev => 
          prev < filteredUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedUserIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedUserIndex >= 0) {
          handleUserSelect(filteredUsers[selectedUserIndex]);
        } else {
          const matchedUser = users.find(
            user => user.name.toLowerCase() === searchTerm.toLowerCase()
          );
          if (matchedUser) {
            handleUserSelect(matchedUser);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleReasonKeyDown = (e) => {
    if (isCustomReason) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveCustomReason();
      }
      return;
    }

    if (!showReasonDropdown || reasonOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedReasonIndex(prev => 
          prev < reasonOptions.length + otherReasons.length ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedReasonIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedReasonIndex >= 0) {
          if (selectedReasonIndex === reasonOptions.length + otherReasons.length) {
            handleReasonSelect('Other');
          } else {
            const allReasons = [...reasonOptions, ...otherReasons];
            handleReasonSelect(allReasons[selectedReasonIndex]);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleUserSelect = (user) => {
    updateRecipient(index, { 
      ...recipient,
      name: user.name, 
      email: user.email 
    });
    setShowUserDropdown(false);
    setSearchTerm('');
    setSelectedUserIndex(-1);
  };

  const handleReasonSelect = (reason) => {
    if (reason === 'Other') {
      setIsCustomReason(true);
      setCustomReason('');
      updateRecipient(index, { ...recipient, reason: '' });
    } else {
      setIsCustomReason(false);
      updateRecipient(index, { ...recipient, reason });
    }
    setShowReasonDropdown(false);
    setSelectedReasonIndex(-1);
  };

  const handleSaveCustomReason = async () => {
    if (customReason.trim()) {
      try {
        const response = await fetch('http://localhost:3000/api/reasons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: customReason.trim() }),
        });
        
        if (response.ok) {
          updateRecipient(index, { ...recipient, reason: customReason.trim() });
          setIsCustomReason(false);
          onReasonSaved();
        }
      } catch (error) {
        console.error('Failed to save custom reason:', error);
        onReasonSaveFailed();
      }
    }
  };

  const handleUserInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedUserIndex(-1);
    updateRecipient(index, { ...recipient, name: value });
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    updateRecipient(index, { ...recipient, email: value });
  };

  const handleCustomReasonChange = (e) => {
    const value = e.target.value;
    setCustomReason(value);
    updateRecipient(index, { ...recipient, reason: value });
  };

  const content = (
    <div className="relative mb-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-visible transition-all hover:shadow-xl" style={{ zIndex: showUserDropdown || showReasonDropdown ? 50 - index : 10 }}>
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" 
        style={{ backgroundColor: colors[index % colors.length] }}
      />

      <div className="flex items-center px-6 py-4">
        {showOrder && (
          <div className="flex items-center mr-3">
            <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
              {index + 1}
            </span>
            <GripVertical size={18} className="ml-2 text-gray-400 cursor-move" />
          </div>
        )}

        <div className="relative flex-1 min-w-0">
          <div 
            ref={userInputRef}
            className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white transition-all"
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
              onKeyDown={handleUserKeyDown}
            />
            <ChevronDown size={16} className="text-gray-500 flex-shrink-0 ml-2" />
          </div>

          {showUserDropdown && (
            <div 
              ref={userDropdownRef} 
              className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => (
                  <div
                    key={i}
                    className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${
                      selectedUserIndex === i ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleUserSelect(user)}
                    onMouseEnter={() => setSelectedUserIndex(i)}
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

        <div className="relative flex-1 min-w-0 mx-2">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-white">
            <input
              type="email"
              value={recipient.email}
              onChange={handleEmailChange}
              placeholder="Enter email"
              className="flex-1 outline-none text-sm min-w-0 truncate"
            />
          </div>
        </div>

        <div className="relative flex-1 min-w-0">
          <div 
            ref={reasonInputRef}
            className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white transition-all"
            onClick={() => !isCustomReason && setShowReasonDropdown(true)}
          >
            <FileText size={18} className="text-gray-500 mr-2 flex-shrink-0" />
            {isCustomReason ? (
              <input
                type="text"
                placeholder="Enter custom reason"
                className="flex-1 outline-none text-sm min-w-0 truncate"
                value={customReason}
                onChange={handleCustomReasonChange}
                onKeyDown={handleReasonKeyDown}
              />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Select reason to sign"
                  className="flex-1 outline-none text-sm min-w-0 truncate cursor-pointer"
                  value={recipient.reason}
                  readOnly
                  onClick={() => setShowReasonDropdown(true)}
                  onKeyDown={handleReasonKeyDown}
                />
                <ChevronDown size={16} className="text-gray-500 flex-shrink-0 ml-2" />
              </>
            )}
          </div>

          {showReasonDropdown && !isCustomReason && (
            <div 
              ref={reasonDropdownRef} 
              className="absolute z-[60] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {reasonOptions.map((reason, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${
                    selectedReasonIndex === i ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleReasonSelect(reason)}
                  onMouseEnter={() => setSelectedReasonIndex(i)}
                >
                  <span className="text-sm">{reason}</span>
                </div>
              ))}

              {otherReasons.map((reason, i) => (
                <div
                  key={`custom-${i}`}
                  className={`px-4 py-2 hover:bg-blue-50 cursor-pointer group flex items-center justify-between ${
                    selectedReasonIndex === reasonOptions.length + i ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleReasonSelect(reason)}
                  onMouseEnter={() => setSelectedReasonIndex(reasonOptions.length + i)}
                >
                  <span className="text-sm">{reason}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReason(reason);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1 hover:bg-red-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              <div
                className={`px-4 py-2 hover:bg-blue-50 cursor-pointer border-t ${
                  selectedReasonIndex === reasonOptions.length + otherReasons.length ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleReasonSelect('Other')}
                onMouseEnter={() => setSelectedReasonIndex(reasonOptions.length + otherReasons.length)}
              >
                <span className="text-sm font-medium text-blue-600">Other reason...</span>
              </div>
            </div>
          )}
        </div>

        <button 
          className="ml-2 text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
          onClick={() => deleteRecipient(index)}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <Draggable 
      draggableId={recipient.id}
      index={index}
      isDragDisabled={!showOrder}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(showOrder ? provided.dragHandleProps : {})}
        >
          {content}
        </div>
      )}
    </Draggable>
  );
};

export default RecipientRow;