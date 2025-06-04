import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import RecipientRow from './RecipientRow';
import { ArrowLeft, Plus } from 'lucide-react';

const Recipients = () => {
  const [showSignInOrder, setShowSignInOrder] = useState(false);
  const [recipients, setRecipients] = useState([
    { name: '', email: '', reason: '' }
  ]);
  const [users, setUsers] = useState([]);
  const [signatureReasons, setSignatureReasons] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/data')
      .then(response => response.json())
      .then(data => {
        setUsers(data.users);
        setSignatureReasons(data.signatureReasons);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Different colors for recipient indicators
  const recipientColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F97316', // orange
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#EF4444', // red
  ];

  // Update recipient data
  const updateRecipient = (index, newData) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index] = newData;
    setRecipients(updatedRecipients);
  };

  // Delete a recipient
  const deleteRecipient = (index) => {
    if (recipients.length > 1) {
      const updatedRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(updatedRecipients);
    }
  };

  // Add a new recipient
  const addNewRecipient = () => {
    setRecipients([...recipients, { name: '', email: '', reason: '' }]);
  };

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(recipients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRecipients(items);
  };

  // Handle next button click
  const handleNext = () => {
    console.log('Proceeding with recipients:', recipients);
  };

  // Handle back button click
  const handleBack = () => {
    console.log('Going back');
  };

  const recipientsList = (
    <div className="space-y-4">
      {recipients.map((recipient, index) => (
        <RecipientRow
          key={`recipient-${index}`}
          index={index}
          recipient={recipient}
          updateRecipient={updateRecipient}
          deleteRecipient={deleteRecipient}
          users={users}
          reasonOptions={signatureReasons}
          showOrder={showSignInOrder}
          colors={recipientColors}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 pt-14">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="font-bold text-gray-800">Setup the Signature:</div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {/* Sign in order checkbox */}
          <div className="mb-4 flex items-center">
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

          {/* Recipients list */}
          {showSignInOrder ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="recipients">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {recipientsList}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            recipientsList
          )}

          {/* Add new recipient button */}
          <div className="mt-4">
            <button
              onClick={addNewRecipient}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Add Another Recipient
            </button>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default Recipients;