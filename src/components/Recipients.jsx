import React, { useState } from 'react';
import RecipientRow from './RecipientRow';
import { ArrowLeft, Plus } from 'lucide-react';

// Sample user data for demonstration
const sampleUsers = [
  { name: 'John Doe', email: 'john.doe@example.com' },
  { name: 'Jane Doe', email: 'jane.doe@example.com' },
  { name: 'Adam Smith', email: 'adam@gmail.com' },
  { name: 'Charlie Brown', email: 'charlie.b@example.com' },
  { name: 'Charlie Brown', email: 'charlie.brown2@different.com' }, // Same name, different email
  { name: 'Emma Watson', email: 'emma@example.com' },
  { name: 'Michael Johnson', email: 'michael@example.com' },
];

// Predefined reason options
const reasonOptions = [
  'Approval',
  'Review',
  'Signature Required',
  'For Information',
  'Legal Requirement',
  'Other'
];

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

const Recipients = () => {
  const [showSignInOrder, setShowSignInOrder] = useState(false);
  const [recipients, setRecipients] = useState([
    { name: '', email: '', reason: '' }
  ]);

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

  // Handle next button click
  const handleNext = () => {
    console.log('Proceeding with recipients:', recipients);
    // Add navigation logic here
  };

  // Handle back button click
  const handleBack = () => {
    console.log('Going back');
    // Add navigation logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200">
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
          <div className="space-y-4">
            {recipients.map((recipient, index) => (
              <RecipientRow
                key={index}
                index={index}
                recipient={recipient}
                updateRecipient={updateRecipient}
                deleteRecipient={deleteRecipient}
                users={sampleUsers}
                reasonOptions={reasonOptions}
                showOrder={showSignInOrder}
                colors={recipientColors}
              />
            ))}
          </div>

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