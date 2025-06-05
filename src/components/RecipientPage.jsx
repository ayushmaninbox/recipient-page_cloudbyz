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

// ... (Toast component remains unchanged)

// ... (Navbar component remains unchanged)

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
  // ... (existing state and refs remain unchanged)

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

  // ... (existing handlers and effects remain unchanged)

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