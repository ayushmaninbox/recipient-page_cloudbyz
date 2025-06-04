import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import RecipientRow from './RecipientRow';
import Toast from './Toast';
import { ArrowLeft, Plus } from 'lucide-react';

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
    '#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6', '#EF4444',
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(recipients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRecipients(items);
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

  const handleBack = () => {
    console.log('Going back');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-14">
      <header className="bg-white/70 backdrop-blur-sm shadow-sm px-6 py-3 flex items-center justify-between fixed top-14 left-0 right-0 z-20">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Setup the Signature</h1>
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
              className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="signInOrder" className="ml-2 text-sm font-medium text-gray-700">
              Sign in order?
            </label>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="recipients">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
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
                      />
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-6">
            <button
              onClick={addNewRecipient}
              className="flex items-center bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-md shadow-blue-500/20"
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

export default Recipients;