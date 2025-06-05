import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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

// Toast component remains unchanged
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
        style={{ zIndex: 1000 }}
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

// Navbar component remains unchanged
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 h-14 px-6 flex justify-between items-center">
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

// RecipientRow component update - only changing z-index values
const RecipientRow = ({ 
  // ... props remain the same
}) => {
  // ... existing code remains the same

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  // ... rest of the component remains the same, but update dropdown z-index
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative mb-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-visible transition-all hover:shadow-xl"
      layout
      transition={{
        layout: { duration: 0.2 },
        opacity: { duration: 0.2 }
      }}
    >
      {/* ... existing JSX ... */}
      
      {showUserDropdown && (
        <div 
          ref={userDropdownRef} 
          className="absolute z-[100] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {/* ... dropdown content ... */}
        </div>
      )}

      {showReasonDropdown && !isCustomReason && (
        <div 
          ref={reasonDropdownRef} 
          className="absolute z-[100] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {/* ... dropdown content ... */}
        </div>
      )}
      
      {/* ... rest of the JSX ... */}
    </motion.div>
  );
};

const Recipients = () => {
  // ... existing state and hooks ...

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

  const containerRef = useRef(null);

  // ... rest of the component remains the same until DndContext

  return (
    <div className="min-h-screen bg-gradient-to-br from-CloudbyzBlue/10 via-indigo-50 to-purple-50 pt-14">
      <header className="bg-gradient-to-r from-CloudbyzBlue/10 via-white/70 to-CloudbyzBlue/10 backdrop-blur-sm shadow-sm px-6 py-3 flex items-center fixed top-14 left-0 right-0 z-40">
        {/* ... header content ... */}
      </header>

      <main className="container mx-auto px-4 py-24 max-w-5xl" ref={containerRef}>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="mb-6 flex items-center">
            {/* ... checkbox content ... */}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[
              (args) => {
                if (!containerRef.current) return args;
                const containerRect = containerRef.current.getBoundingClientRect();
                const { transform } = args;
                return {
                  ...args,
                  transform: {
                    ...transform,
                    y: Math.max(
                      Math.min(
                        transform.y,
                        containerRect.bottom - 100
                      ),
                      containerRect.top
                    ),
                  },
                };
              },
            ]}
          >
            {/* ... rest of the component remains the same ... */}
          </DndContext>
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

// ... rest of the file remains the same ...

export default RecipientPage;