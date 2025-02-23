import React, { useState } from 'react';
import CreateEvent from './CreateEvent';
import PurchaseTicket from './PurchaseTicket';
import ListForSale from './ListForSale';
import GetEventDetails from './GetEventDetails';
import BuyTicket from './BuyTicket';
import MyTickets from './MyTickets';
import ActiveListings from './ActiveListings';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', // Dark gradient background
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    color: '#ffffff',
    overflow: 'hidden',
  },
  mainContent: {
    maxWidth: '1900px',
    margin: '0 auto',
    paddingLeft: '300px', // Add padding to account for the side menu
    paddingTop: '50px',
  },
  mainContentShort: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingLeft: '300px', // Add padding to account for the side menu
    paddingTop: '70px',
  },
  mainContentVeryShort: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingLeft: '300px', // Add padding to account for the side menu
    paddingTop: '100px',
  },
  mainContentMedium: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingLeft: '200px', // Add padding to account for the side menu
    paddingTop: '0px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem 1rem 1rem 300px', // Add left padding to account for the side menu
    background: 'rgba(15, 12, 41, 0.8)', // Semi-transparent dark background matching the gradient
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    animation: 'fadeInDown 0.5s ease-in-out',
    backdropFilter: 'blur(10px)', // Blur effect for a modern look
    border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border for depth
    position: 'fixed', // Fix the header at the top
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // Ensure the header is above other content
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    background: 'linear-gradient(90deg, #00ff88, #00bfff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  walletInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  walletAddress: {
    fontSize: '0.875rem',
    color: '#ffffff',
    background: 'rgba(61, 61, 61, 0.8)', // Semi-transparent dark background
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    transition: 'background 0.3s ease',
    backdropFilter: 'blur(5px)', // Blur effect
    border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #00ff88, #00bfff)',
    color: '#000000',
    boxShadow: '0 4px 6px rgba(0, 255, 136, 0.2)',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 6px 8px rgba(0, 255, 136, 0.3)',
    },
  },
  buttonDanger: {
    background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
    color: '#ffffff',
    boxShadow: '0 4px 6px rgba(255, 77, 77, 0.2)',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 6px 8px rgba(255, 77, 77, 0.3)',
    },
  },
  sideMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '250px',
    height: '100vh',
    background: 'rgba(15, 12, 41, 0.8)', // Semi-transparent dark background matching the gradient
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.3s ease',
    zIndex: 1000,
    backdropFilter: 'blur(10px)', // Blur effect
    borderRight: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border for depth
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
  },
  menuTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    background: 'linear-gradient(90deg, #00ff88, #00bfff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  menuItem: {
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#ffffff',
    borderLeft: '3px solid transparent', // Add a border for hover effect
    '&:hover': {
      background: 'rgba(61, 61, 61, 0.8)', // Semi-transparent dark background on hover
      borderLeft: '3px solid #00ff88', // Highlight border on hover
      transform: 'translateX(5px)', // Slight movement on hover
    },
  },
  activeMenuItem: {
    background: 'rgba(61, 61, 61, 0.8)', // Semi-transparent dark background for active item
    borderLeft: '3px solid #00ff88', // Highlight border for active item
    transform: 'translateX(5px)', // Slight movement for active item
  },
};

const IntroPage = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('createEvent');
  const [account, setAccount] = useState(null);

  const checkWallet = () => {
    if ('aptos' in window) {
      return true;
    }
    alert('Please install Petra Wallet');
    return false;
  };

  const connectWallet = async () => {
    if (!checkWallet()) return;
    try {
      const response = await window.aptos.connect();
      setAccount(response.address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    if (!checkWallet()) return;
    try {
      await window.aptos.disconnect();
      setAccount(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>BlockOPS</h1>
        <div style={styles.walletInfo}>
          {account ? (
            <>
              <span style={styles.walletAddress}>
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </span>
              <button
                onClick={disconnectWallet}
                style={{ ...styles.button, ...styles.buttonDanger }}
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={connectWallet}
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Side Menu */}
      <div style={styles.sideMenu}>
        <div style={styles.menuHeader}>
          <span style={styles.menuTitle}>Menu</span>
        </div>
        <div
          style={{
            ...styles.menuItem,
            ...(activeMenuItem === 'createEvent' && styles.activeMenuItem),
          }}
          onClick={() => handleMenuItemClick('createEvent')}
        >
          Create Event
        </div>
        <div
          style={{
            ...styles.menuItem,
            ...(activeMenuItem === 'purchaseTicket' && styles.activeMenuItem),
          }}
          onClick={() => handleMenuItemClick('purchaseTicket')}
        >
          Purchase Ticket
        </div>
        <div
          style={{
            ...styles.menuItem,
            ...(activeMenuItem === 'viewEvents' && styles.activeMenuItem),
          }}
          onClick={() => handleMenuItemClick('viewEvents')}
        >
          View Events
        </div>
        <div
          style={{
            ...styles.menuItem,
            ...(activeMenuItem === 'listTicket' && styles.activeMenuItem),
          }}
          onClick={() => handleMenuItemClick('listTicket')}
        >
          List Ticket for Sale
        </div>
        <div
          style={{
            ...styles.menuItem,
            ...(activeMenuItem === 'myTickets' && styles.activeMenuItem),
          }}
          onClick={() => handleMenuItemClick('myTickets')}
        >
          My Tickets
        </div>
        <div
          style={{
            ...styles.menuItem,
            ...(activeMenuItem === 'buyfromuser' && styles.activeMenuItem),
          }}
          onClick={() => handleMenuItemClick('buyfromuser')}
        >
          Buy from user
        </div>
        <div
          style={{
            ...styles.menuItem,
            ...(activeMenuItem === 'viewlistings' && styles.activeMenuItem),
          }}
          onClick={() => handleMenuItemClick('viewlistings')}
        >
          View listed tickets
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {activeMenuItem === 'createEvent' && <CreateEvent />}
        {activeMenuItem === 'listTicket' && <ListForSale />}
        {activeMenuItem === 'buyfromuser' && <BuyTicket />}
        {activeMenuItem === 'viewlistings' && <ActiveListings />}
        {activeMenuItem === 'myTickets' && <MyTickets />}
        {activeMenuItem === 'viewEvents' && <GetEventDetails />}
        {activeMenuItem === 'purchaseTicket' && <PurchaseTicket />}
      </div>
    </div>
  );
};

export default IntroPage;