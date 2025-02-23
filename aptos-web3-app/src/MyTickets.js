import React, { useState, useEffect } from 'react';
import { AptosClient } from 'aptos';
import TicketQRCode from './TicketQRCode';

const NODE_URL = "https://fullnode.testnet.aptoslabs.com"; // Testnet endpoint
const client = new AptosClient(NODE_URL);

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
  ticketCard: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    background: 'rgba(61, 61, 61, 0.8)', // Semi-transparent dark background
  },
  error: {
    color: '#ff4d4d',
    marginTop: '1rem',
    fontSize: 'rem',
  },
  ticket_un:{
    marginTop:"1rem",
  },
};

const MyTickets = () => {
  const [userAddress, setUserAddress] = useState('');
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    try {
      setError(null);
      setTickets([]);

      // Normalize the module address and user address to ensure they include "0x"
      const moduleAddress = process.env.REACT_APP_MODULE_ADDRESS || "";
      const normalizedModuleAddress = moduleAddress.startsWith("0x")
        ? moduleAddress
        : "0x" + moduleAddress;
      const normalizedUserAddress = userAddress.trim().startsWith("0x")
        ? userAddress.trim()
        : "0x" + userAddress.trim();

      const payload = {
        function: `${normalizedModuleAddress}::BlockChain_Ticketing_v2::get_purchase_history_by_address`,
        type_arguments: [],
        arguments: [normalizedUserAddress],
      };

      const response = await client.view(payload);
      console.log("Response from Aptos (MyTickets):", response);
      // Log to check the desired output:
      console.log("Desired object:", response[0] && response[0][0]); // should log the object with fields: buyer, event_id, purchase_time, quantity

      // Extract the resultArray:
      let resultArray = [];
      if (response) {
        if (response.vec) {
          resultArray = response.vec;
        } else if (Array.isArray(response) && response.length > 0 && Array.isArray(response[0])) {
          resultArray = response[0]; // Use the inner array
        } else if (Array.isArray(response)) {
          resultArray = response;
        }
      }

      if (resultArray && Array.isArray(resultArray) && resultArray.length > 0) {
        setTickets(resultArray);
      } else {
        setError("No tickets found for this address.");
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Error fetching tickets. See console for details.");
    }
  };

  // Optionally, auto-fetch tickets if userAddress is provided.
  useEffect(() => {
    if (userAddress) {
      fetchTickets();
    }
  }, [userAddress]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>My Tickets</h2>
      <input
        style={styles.input}
        placeholder="Enter your wallet address"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)}
      />
      <button style={styles.button} onClick={fetchTickets}>
        Fetch My Tickets
      </button>
      {error && <div style={styles.error}>{error}</div>}
      {tickets.length > 0 ? (
        tickets.map((ticket, index) => {
          // Use the purchase record as our ticket data.
          // You may add more fields if available.
          const ticketData = {
            buyer: ticket.buyer,
            event_id: ticket.event_id,
            purchase_time: ticket.purchase_time,
            quantity: ticket.quantity,
          };
          return (
            <div key={index} style={styles.ticketCard}>
              <p><strong>Event ID:</strong> {ticket.event_id}</p>
              <p><strong>Purchase Time:</strong> {ticket.purchase_time}</p>
              <p><strong>Quantity:</strong> {ticket.quantity}</p>
              <TicketQRCode ticketData={ticketData} />
            </div>
          );
        })
      ) : (
        
        !error && <div style={styles.ticket_un}>No tickets available.</div>
       
      )}
    </div>
  );
};

export default MyTickets;