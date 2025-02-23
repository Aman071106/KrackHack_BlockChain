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

const ListForSale = () => {
  const [saleInfo, setSaleInfo] = useState({
    creator: '',
    collectionName: '',
    tokenName: '',
    propertyVersion: '',
    price: '',
    eventId: '',
    maxResalePrice: '',
  });

  const checkWallet = () => {
    if ('aptos' in window) {
      return true;
    }
    alert('Please install Petra Wallet');
    return false;
  };

  const listForSale = async () => {
    if (!checkWallet()) return;

    try {
      const payload = {
        type: 'entry_function_payload',
        function: `${process.env.REACT_APP_MODULE_ADDRESS}::BlockChain_Ticketing_v2::list_for_sale`,
        type_arguments: [],
        arguments: [
          saleInfo.creator,
          saleInfo.collectionName,
          saleInfo.tokenName,
          parseInt(saleInfo.propertyVersion),
          parseInt(saleInfo.price),
          parseInt(saleInfo.eventId),
          parseInt(saleInfo.maxResalePrice),
        ],
      };

      const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
      console.log('List for sale pending transaction:', pendingTransaction);

      // Clear the form after a successful submission
      setSaleInfo({
        creator: '',
        collectionName: '',
        tokenName: '',
        propertyVersion: '',
        price: '',
        eventId: '',
        maxResalePrice: '',
      });
    } catch (error) {
      console.error('Error listing ticket for sale:', error);
      alert('Failed to list ticket for sale. Check console for details.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>List Ticket for Sale</h2>
      <input
        style={styles.input}
        placeholder="Creator Address"
        value={saleInfo.creator}
        onChange={(e) => setSaleInfo({ ...saleInfo, creator: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Collection Name"
        value={saleInfo.collectionName}
        onChange={(e) => setSaleInfo({ ...saleInfo, collectionName: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Token Name"
        value={saleInfo.tokenName}
        onChange={(e) => setSaleInfo({ ...saleInfo, tokenName: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Property Version"
        type="number"
        value={saleInfo.propertyVersion}
        onChange={(e) => setSaleInfo({ ...saleInfo, propertyVersion: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Price"
        type="number"
        value={saleInfo.price}
        onChange={(e) => setSaleInfo({ ...saleInfo, price: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Event ID"
        type="number"
        value={saleInfo.eventId}
        onChange={(e) => setSaleInfo({ ...saleInfo, eventId: e.target.value })}
      />
      <input
        style={styles.input}
        placeholder="Max Resale Price"
        type="number"
        value={saleInfo.maxResalePrice}
        onChange={(e) => setSaleInfo({ ...saleInfo, maxResalePrice: e.target.value })}
      />
      <button style={styles.button} onClick={listForSale}>
        List Ticket for Sale
      </button>
    </div>
  );
};

export default ListForSale;
