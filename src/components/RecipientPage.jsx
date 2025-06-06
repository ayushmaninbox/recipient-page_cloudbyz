import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ChevronDown, Trash2, GripVertical, FileText, 
  Mail, Plus, CheckCircle2, XCircle, X 
} from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`fixed top-20 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 h-14 px-6 flex justify-between items-center">
      <img src="/images/cloudbyz.png" alt="Cloudbyz Logo" className="h-8 object-contain" />
      <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
        <User className="w-5 h-5 text-slate-600" />
      </div>
    </nav>
  );
};

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
  onAddTempReason,
  onDragStart,
  onDrop,
  onDragOver
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
  const [selectedReasonIndex, setSelectedReasonIndex] = useState(-1);
  const [tempInputValue, setTempInputValue] = useState('');
  
  const userInputRef = useRef(null);
  const userDropdownRef = useRef(null);
  const reasonInputRef = useRef(null);
  const reasonDropdownRef = useRef(null);
  const selectedUserRef = useRef(null);
  const selectedReasonRef = useRef(null);

  const filteredUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

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
        if (isCustomReason && tempInputValue.trim()) {
          handleSaveCustomReason();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCustomReason, tempInputValue]);

  useEffect(() => {
    if (selectedUserRef.current && userDropdownRef.current) {
      const dropdownRect = userDropdownRef.current.getBoundingClientRect();
      const selectedRect = selectedUserRef.current.getBoundingClientRect();
      
      if (selectedRect.bottom > dropdownRect.bottom) {
        userDropdownRef.current.scrollTop += selectedRect.bottom - dropdownRect.bottom;
      } else if (selectedRect.top < dropdownRect.top) {
        userDropdownRef.current.scrollTop -= dropdownRect.top - selectedRect.top;
      }
    }
  }, [selectedUserIndex]);

  useEffect(() => {
    if (selectedReasonRef.current && reasonDropdownRef.current) {
      const dropdownRect = reasonDropdownRef.current.getBoundingClientRect();
      const selectedRect = selectedReasonRef.current.getBoundingClientRect();
      
      if (selectedRect.bottom > dropdownRect.bottom) {
        reasonDropdownRef.current.scrollTop += selectedRect.bottom - dropdownRect.bottom;
      } else if (selectedRect.top < dropdownRect.top) {
        reasonDropdownRef.current.scrollTop -= dropdownRect.top - selectedRect.top;
      }
    }
  }, [selectedReasonIndex]);

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
      setTempInputValue('');
      setCustomReason('');
      updateRecipient(index, { ...recipient, reason: '' });
    } else {
      setIsCustomReason(false);
      updateRecipient(index, { ...recipient, reason });
    }
    setShowReasonDropdown(false);
    setSelectedReasonIndex(-1);
  };

  const handleSaveCustomReason = () => {
    if (tempInputValue.trim()) {
      const finalValue = tempInputValue.trim();
      setCustomReason(finalValue);
      onAddTempReason(finalValue);
      updateRecipient(index, { ...recipient, reason: finalValue });
    }
  };

  useEffect(() => {
    if (isCustomReason && customReason.trim()) {
      onAddTempReason(customReason.trim());
      updateRecipient(index, { ...recipient, reason: customReason.trim() });
    }
  }, [customReason]);

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
    setTempInputValue(value);
  };

  const handleCustomReasonBlur = () => {
    if (tempInputValue.trim()) {
      handleSaveCustomReason();
    }
  };

  return (
    <motion.div
      className="relative mb-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-visible transition-all hover:shadow-xl"
      style={{ zIndex: showUserDropdown || showReasonDropdown ? 50 - index : 10 }}
      draggable={showOrder}
      onDragStart={(e) => onDragStart(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragOver={onDragOver}
      initial={false}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
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
            <GripVertical size={18} className="ml-2 text-gray-400" />
          </div>
        )}

        <div className="relative flex-1 min-w-0">
          <div 
            ref={userInputRef}
            className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-CloudbyzBlue focus-within:ring-1 focus-within:ring-CloudbyzBlue bg-white transition-all"
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
                    ref={selectedUserIndex === i ? selectedUserRef : null}
                    className={`px-4 py-2 hover:bg-CloudbyzBlue/10 cursor-pointer flex items-center ${
                      selectedUserIndex === i ? 'bg-CloudbyzBlue/10' : ''
                    }`}
                    onClick={() => handleUserSelect(user)}
                    onMouseEnter={() => setSelectedUserIndex(i)}
                  >
                    <div className="w-8 h-8 rounded-full bg-CloudbyzBlue/20 text-CloudbyzBlue flex items-center justify-center mr-3 flex-shrink-0">
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
            <Mail size={18} className="text-gray-500 mr-2 flex-shrink-0" />
            <input
              type="email"
              value={recipient.email}
              onChange={handleEmailChange}
              placeholder="Enter email"
              className={`flex-1 outline-none text-sm min-w-0 truncate ${
                recipient.email && !recipient.email.includes('@') ? 'text-red-500' : ''
              }`}
            />
          </div>
        </div>

        <div className="relative flex-1 min-w-0">
          <div 
            ref={reasonInputRef}
            className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-CloudbyzBlue focus-within:ring-1 focus-within:ring-CloudbyzBlue bg-white transition-all"
            onClick={() => !isCustomReason && setShowReasonDropdown(true)}
          >
            <FileText size={18} className="text-gray-500 mr-2 flex-shrink-0" />
            {isCustomReason ? (
              <input
                type="text"
                placeholder="Enter custom reason"
                className="flex-1 outline-none text-sm min-w-0 truncate"
                value={tempInputValue}
                onChange={handleCustomReasonChange}
                onKeyDown={handleReasonKeyDown}
                onBlur={handleCustomReasonBlur}
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
                  ref={selectedReasonIndex === i ? selectedReasonRef : null}
                  className={`px-4 py-2 hover:bg-CloudbyzBlue/10 cursor-pointer ${
                    selectedReasonIndex === i ? 'bg-CloudbyzBlue/10' : ''
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
                  ref={selectedReasonIndex === reasonOptions.length + i ? selectedReasonRef : null}
                  className={`px-4 py-2 hover:bg-CloudbyzBlue/10 cursor-pointer ${
                    selectedReasonIndex === reasonOptions.length + i ? 'bg-CloudbyzBlue/10' : ''
                  }`}
                  onClick={() => handleReasonSelect(reason)}
                  onMouseEnter={() => setSelectedReasonIndex(reasonOptions.length + i)}
                >
                  <span className="text-sm">{reason}</span>
                </div>
              ))}

              <div
                ref={selectedReasonIndex === reasonOptions.length + otherReasons.length ? selectedReasonRef : null}
                className={`px-4 py-2 hover:bg-CloudbyzBlue/10 cursor-pointer border-t ${
                  selectedReasonIndex === reasonOptions.length + otherReasons.length ? 'bg-CloudbyzBlue/10' : ''
                }`}
                onClick={() => handleReasonSelect('Other')}
                onMouseEnter={() => setSelectedReasonIndex(reasonOptions.length + otherReasons.length)}
              >
                <span className="text-sm font-medium text-CloudbyzBlue">Other reason...</span>
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
    </motion.div>
  );
};

const Recipients = () => {
  const [showSignInOrder, setShowSignInOrder] = useState(false);
  const [recipients, setRecipients] = useState([
    { id: 'recipient-1', name: '', email: '', reason: '' }
  ]);
  const [users, setUsers] = useState([]);
  const [signatureReasons, setSignatureReasons] = useState([]);
  const [otherReasons, setOtherReasons] = useState([]);
  const [tempReasons, setTempReasons] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const recipientsContainerRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/data')
      .then(response => response.json())
      .then(data => {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setSignatureReasons(Array.isArray(data.signatureReasons) ? data.signatureReasons : []);
        setOtherReasons(Array.isArray(data.otherReasons) ? data.otherReasons : []);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setUsers([]);
        setSignatureReasons([]);
        setOtherReasons([]);
      });
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const recipientColors = [
    '#009edb', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6', '#EF4444',
  ];

  const updateRecipient = (index, newData) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index] = { ...newData, id: recipients[index].id };
    setRecipients(updatedRecipients);
  };

  const deleteRecipient = (index) => {
    if (recipients.length > 1) {
      const updatedRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(updatedRecipients);
    }
  };

  const addNewRecipient = () => {
    const newId = `recipient-${recipients.length + 1}`;
    setRecipients([...recipients, { id: newId, name: '', email: '', reason: '' }]);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index.toString());
    const draggedElement = e.target;
    draggedElement.style.opacity = '0.5';
    draggedElement.style.transform = 'scale(1.02)';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'), 10);
    const draggedElement = document.querySelector(`[draggable="true"]`);
    if (draggedElement) {
      draggedElement.style.opacity = '1';
      draggedElement.style.transform = 'none';
    }
    
    if (dragIndex !== targetIndex) {
      const items = Array.from(recipients);
      const [reorderedItem] = items.splice(dragIndex, 1);
      items.splice(targetIndex, 0, reorderedItem);
      setRecipients(items);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const draggedElement = document.querySelector(`[draggable="true"][style*="opacity: 0.5"]`);
    if (draggedElement) {
      const containerRect = recipientsContainerRef.current.getBoundingClientRect();
      const { clientY } = e;
      
      if (clientY < containerRect.top + 20) {
        recipientsContainerRef.current.scrollTop -= 10;
      } else if (clientY > containerRect.bottom - 20) {
        recipientsContainerRef.current.scrollTop += 10;
      }
    }
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    e.target.style.transform = 'none';
  };

  const addTempReason = (reason) => {
    if (!tempReasons.includes(reason)) {
      setTempReasons([...tempReasons, reason]);
    }
  };

  const handleNext = async () => {
    const hasInvalidEmail = recipients.some(recipient => 
      recipient.email && !recipient.email.includes('@')
    );

    if (hasInvalidEmail) {
      showToast('Please enter valid email addresses', 'error');
      return;
    }

    for (const reason of tempReasons) {
      try {
        await fetch('http://localhost:3000/api/reasons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            reason,
            addToSignatureReasons: true
          }),
        });
      } catch (error) {
        console.error('Error saving reason:', error);
      }
    }

    if (tempReasons.length > 0) {
      showToast('Successfully saved all new reasons', 'success');
    }

    console.log('Proceeding with recipients:', recipients);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-CloudbyzBlue/10 via-indigo-50 to-purple-50 pt-14">
      <header className="bg-gradient-to-r from-CloudbyzBlue/10 via-white/70 to-CloudbyzBlue/10 backdrop-blur-sm shadow-sm px-6 py-3 flex items-center fixed top-14 left-0 right-0 z-20">
        <div className="flex items-center w-1/3">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-semibold text-CloudbyzBlue">Setup the Signature</h1>
        </div>
        <div className="w-1/3 flex justify-end">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-CloudbyzBlue hover:text-white bg-white hover:bg-CloudbyzBlue rounded-lg transition-all duration-200 border border-CloudbyzBlue hover:border-transparent"
          >
            Add Bulk Signees
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-24 max-w-5xl">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="signInOrder"
              checked={showSignInOrder}
              onChange={() => setShowSignInOrder(!showSignInOrder)}
              className="rounded border-gray-300 text-CloudbyzBlue focus:ring-CloudbyzBlue"
            />
            <label htmlFor="signInOrder" className="ml-2 text-sm font-medium text-gray-700">
              Sign in order?
            </label>
          </div>

          <div 
            ref={recipientsContainerRef}
            className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto"
          >
            {recipients.map((recipient, index) => (
              <RecipientRow
                key={recipient.id}
                index={index}
                recipient={recipient}
                updateRecipient={updateRecipient}
                deleteRecipient={deleteRecipient}
                users={users}
                reasonOptions={[...signatureReasons, ...tempReasons]}
                otherReasons={otherReasons}
                showOrder={showSignInOrder}
                colors={recipientColors}
                onAddTempReason={addTempReason}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={addNewRecipient}
              className="flex items-center bg-CloudbyzBlue hover:bg-CloudbyzBlue/90 active:bg-CloudbyzBlue text-white px-5 py-2.5 rounded-lg transition-colors shadow-md shadow-CloudbyzBlue/20"
            >
              <Plus size={18} className="mr-2" />
              Add Another Recipient
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-900 px-8 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-amber-400/20"
          >
            Next
          </button>
        </div>
      </main>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

const RecipientPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Recipients />
    </div>
  );
};

export default RecipientPage;