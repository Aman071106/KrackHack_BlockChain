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

const PurchaseTicket = () => {
  const [ticketInfo, setTicketInfo] = useState({
    creator: '',
    eventId: '',
    seatNumber: '',
    maxResalePrice: '',
    ticketType: '',
    perks: '', // Comma-separated perks
  });

  const checkWallet = () => {
    if ('aptos' in window) {
      return true;
    }
    alert('Please install Petra Wallet');
    return false;
  };

  const mintTicket = async () => {
    if (!checkWallet()) return;
    try {
      // Convert comma-separated perks into an array of strings
      const perksArray = ticketInfo.perks
        .split(',')
        .map((perk) => perk.trim())
        .filter((perk) => perk !== '');
      
      const payload = {
        type: 'entry_function_payload',
        function: `${process.env.REACT_APP_MODULE_ADDRESS}::BlockChain_Ticketing_v2::mint_ticket`,
        type_arguments: [],
        arguments: [
          ticketInfo.creator,
          parseInt(ticketInfo.eventId),
          ticketInfo.seatNumber,
          parseInt(ticketInfo.maxResalePrice),
          ticketInfo.ticketType,
          perksArray,
        ],
      };

      const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
      console.log('Mint ticket pending transaction:', pendingTransaction);

      // Clear the form after a successful mint
      setTicketInfo({
        creator: '',
        eventId: '',
        seatNumber: '',
        maxResalePrice: '',
        ticketType: '',
        perks: '',
      });
    } catch (error) {
      console.error('Error minting ticket:', error);
      alert('Failed to mint ticket. Check console for details.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Purchase Ticket</h2>
      <input
        style={styles.input}
        placeholder="Creator Address"
        value={ticketInfo.creator}
        onChange={(e) => setTicketInfo({ ...ticketInfo, creator: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Event ID"
        type="number"
        value={ticketInfo.eventId}
        onChange={(e) => setTicketInfo({ ...ticketInfo, eventId: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Seat Number"
        value={ticketInfo.seatNumber}
        onChange={(e) => setTicketInfo({ ...ticketInfo, seatNumber: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Max Resale Price"
        type="number"
        value={ticketInfo.maxResalePrice}
        onChange={(e) => setTicketInfo({ ...ticketInfo, maxResalePrice: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Ticket Type"
        value={ticketInfo.ticketType}
        onChange={(e) => setTicketInfo({ ...ticketInfo, ticketType: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Perks (comma-separated)"
        value={ticketInfo.perks}
        onChange={(e) => setTicketInfo({ ...ticketInfo, perks: e.target.value })}
      />
      <button style={styles.button} onClick={mintTicket}>
        Purchase Ticket
      </button>
    </div>
  );
};

export default PurchaseTicket;
