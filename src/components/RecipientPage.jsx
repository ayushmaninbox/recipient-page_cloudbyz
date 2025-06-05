import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ChevronDown, Trash2, GripVertical, FileText, 
  Mail, Plus, CheckCircle2, XCircle, X, ChevronUp 
} from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
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
      <a 
        href="https://www.google.com" 
        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
      >
        <User className="w-5 h-5 text-slate-600" />
      </a>
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
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: recipient.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative mb-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-visible transition-all hover:shadow-xl"
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
            <div className="ml-2 flex flex-col">
              <button
                onClick={() => onMoveUp(index)}
                disabled={isFirst}
                className={`p-0.5 hover:bg-gray-100 rounded ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <ChevronUp size={16} className="text-gray-500" />
              </button>
              <button
                onClick={() => onMoveDown(index)}
                disabled={isLast}
                className={`p-0.5 hover:bg-gray-100 rounded ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <ChevronDown size={16} className="text-gray-500" />
              </button>
            </div>
            <div {...listeners} className="ml-2 cursor-move">
              <GripVertical size={18} className="text-gray-400" />
            </div>
          </div>
        )}

        {/* ... (rest of the component remains unchanged) */}
      </div>
    </div>
  );
};

const Recipients = () => {
  // ... (existing state and hooks remain unchanged)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const moveRecipientUp = (index) => {
    if (index > 0) {
      setRecipients((prev) => arrayMove(prev, index, index - 1));
    }
  };

  const moveRecipientDown = (index) => {
    if (index < recipients.length - 1) {
      setRecipients((prev) => arrayMove(prev, index, index + 1));
    }
  };

  // ... (existing handlers remain unchanged)

  return (
    <div className="min-h-screen bg-gradient-to-br from-CloudbyzBlue/10 via-indigo-50 to-purple-50 pt-14">
      {/* ... (header remains unchanged) */}

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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={recipients.map(r => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
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
                    onMoveUp={moveRecipientUp}
                    onMoveDown={moveRecipientDown}
                    isFirst={index === 0}
                    isLast={index === recipients.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* ... (rest of the component remains unchanged) */}
        </div>
      </main>

      {/* ... (toast remains unchanged) */}
    </div>
  );
};

// ... (rest of the file remains unchanged)

export default Recipients