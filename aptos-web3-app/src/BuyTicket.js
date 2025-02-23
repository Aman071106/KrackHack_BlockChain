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
    error: {
      color: '#ff4d4d',
      marginTop: '1rem',
      fontSize: '0.9rem',
    },
  };

const BuyTicket = () => {
  const [ticketInfo, setTicketInfo] = useState({
    seller: '',
    collectionName: '',
    tokenName: '',
    propertyVersion: '',
  });
  const [error, setError] = useState(null);

  const checkWallet = () => {
    if ('aptos' in window) {
      return true;
    }
    alert('Please install Petra Wallet');
    return false;
  };

  const buyTicket = async () => {
    if (!checkWallet()) return;

    try {
      setError(null);
      const payload = {
        type: 'entry_function_payload',
        function: `${process.env.REACT_APP_MODULE_ADDRESS}::BlockChain_Ticketing_v2::buy_ticket`,
        type_arguments: [],
        // Order must match the contract: creator, seller, collection_name, token_name, property_version
        arguments: [
          ticketInfo.seller.trim(),
          ticketInfo.collectionName.trim(),
          ticketInfo.tokenName.trim(),
           ticketInfo.propertyVersion
        ],
      };

      const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
      console.log('Buy ticket pending transaction:', pendingTransaction);

      // Clear the form after successful submission
      setTicketInfo({
        seller: '',
        collectionName: '',
        tokenName: '',
        propertyVersion: '',
      });
    } catch (err) {
      console.error('Error buying ticket:', err);
      setError('Failed to buy ticket. Check console for details.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Buy Ticket</h2>
      <input
        style={styles.input}
        placeholder="Seller Address"
        value={ticketInfo.seller}
        onChange={(e) => setTicketInfo({ ...ticketInfo, seller: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Collection Name"
        value={ticketInfo.collectionName}
        onChange={(e) => setTicketInfo({ ...ticketInfo, collectionName: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Token Name"
        value={ticketInfo.tokenName}
        onChange={(e) => setTicketInfo({ ...ticketInfo, tokenName: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Property Version"
        type="number"
        value={ticketInfo.propertyVersion}
        onChange={(e) => setTicketInfo({ ...ticketInfo, propertyVersion: e.target.value })}
      />
      {error && <div style={styles.error}>{error}</div>}
      <button style={styles.button} onClick={buyTicket}>
        Buy Ticket
      </button>
    </div>
  );
};

export default BuyTicket;
