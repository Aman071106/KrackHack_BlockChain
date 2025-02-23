import React, { useState } from 'react';

const styles = {
    container: {
      padding: '2rem',
      background: 'rgba(15, 12, 41, 0.8)', // Semi-transparent dark background
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)', // Blur effect
      border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '1rem',
      background: 'linear-gradient(90deg, #00ff88, #00bfff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      background: 'rgba(61, 61, 61, 0.8)', // Semi-transparent dark background
      border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border 0.3s ease',
      '&:focus': {
        border: '1px solid #00ff88', // Highlight border on focus
      },
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(135deg, #00ff88, #00bfff)',
      color: '#000000',
      boxShadow: '0 4px 6px rgba(0, 255, 136, 0.2)',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 6px 8px rgba(0, 255, 136, 0.3)',
      },
    },
  };
  

const CreateEvent = () => {
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    totalSeats: '',
    basePrice: '',
    royaltyPercentage: '',
    purchaseLimitPerUser: '',
    purchaseTimeWindow: 3600,
  });

  const checkWallet = () => {
    if ('aptos' in window) {
      return true;
    }
    alert('Please install Petra Wallet');
    return false;
  };

  const createEvent = async () => {
    if (!checkWallet()) return;
    // Optionally, you might check if the user’s wallet is connected

    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${process.env.REACT_APP_MODULE_ADDRESS}::BlockChain_Ticketing_v2::create_event`,
        type_arguments: [],
        arguments: [
          newEvent.name,
          newEvent.description,
          newEvent.date,
          newEvent.venue,
          parseInt(newEvent.totalSeats),
          parseInt(newEvent.basePrice),
          parseInt(newEvent.royaltyPercentage),
          parseInt(newEvent.purchaseLimitPerUser),
          parseInt(newEvent.purchaseTimeWindow),
        ],
      };

      const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
      console.log('Pending transaction:', pendingTransaction);

      // Clear the form after a successful submission
      setNewEvent({
        name: '',
        description: '',
        date: '',
        venue: '',
        totalSeats: 0,
        basePrice: 0,
        royaltyPercentage: 0,
        purchaseLimitPerUser: 1,
        purchaseTimeWindow: 3600,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Check console for details.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create New Event</h2>
      <div style={styles.grid}>
        <input
          style={styles.input}
          placeholder="Event Name"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Description"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
        />
        <input
          style={styles.input}
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Venue"
          value={newEvent.venue}
          onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Total Seats"
          value={newEvent.totalSeats}
          onChange={(e) => setNewEvent({ ...newEvent, totalSeats: e.target.value })}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Base Price (APT)"
          value={newEvent.basePrice}
          onChange={(e) => setNewEvent({ ...newEvent, basePrice: e.target.value })}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Royalty Percentage"
          value={newEvent.royaltyPercentage}
          onChange={(e) => setNewEvent({ ...newEvent, royaltyPercentage: e.target.value })}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Purchase Limit Per User"
          value={newEvent.purchaseLimitPerUser}
          onChange={(e) => setNewEvent({ ...newEvent, purchaseLimitPerUser: e.target.value })}
        />
      </div>
      <button style={styles.button} onClick={createEvent}>
        Create Event
      </button>
    </div>
  );
};

export default CreateEvent;