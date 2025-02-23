import React, { useState } from 'react';
import { AptosClient } from 'aptos';

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
    width: '95%',
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
  table: {
    width: '95%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },
  th: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px',
    textAlign: 'left',
    background: 'rgba(61, 61, 61, 0.8)', // Semi-transparent dark background
    color: '#ffffff',
  },
  td: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px',
    color: '#ffffff',
  },
};

const GetEventDetails = () => {
  const [creator, setCreator] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [error, setError] = useState(null);

  const getEventDetails = async () => {
    try {
      setError(null);
      setEventDetails(null);

      // Normalize module address and creator address to ensure they start with "0x"
      const moduleAddress = process.env.REACT_APP_MODULE_ADDRESS || "";
      const normalizedModuleAddress = moduleAddress.startsWith("0x")
        ? moduleAddress
        : "0x" + moduleAddress;
      const normalizedCreator = creator.trim().startsWith("0x")
        ? creator.trim()
        : "0x" + creator.trim();

      const payload = {
        function: `${normalizedModuleAddress}::BlockChain_Ticketing_v2::get_event_details`,
        type_arguments: [],
        arguments: [normalizedCreator, eventId.trim()],
      };

      console.log("Sending payload:", payload);
      const response = await client.view(payload);
      console.log("Response from Aptos:", response);
      // Use response[0]["vec"][0] as the required event details output.
      const requiredData =
        response &&
        Array.isArray(response) &&
        response.length > 0 &&
        response[0].vec &&
        Array.isArray(response[0].vec) &&
        response[0].vec.length > 0
          ? response[0].vec[0]
          : null;

      if (requiredData) {
        setEventDetails(requiredData);
      } else {
        setError("No event found for the given creator and event ID.");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Error fetching event details. See console for details.");
    }
  };

  // If eventDetails is an array (tuple) map it to keys, otherwise use as object.
  const decodedDetails = Array.isArray(eventDetails)
    ? {
        event_id: eventDetails[0],
        name: eventDetails[1],
        description: eventDetails[2],
        date: eventDetails[3],
        venue: eventDetails[4],
        total_seats: eventDetails[5],
        available_seats: eventDetails[6],
        base_price: eventDetails[7],
        creator: eventDetails[8],
        is_active: eventDetails[9],
        royalty_percentage: eventDetails[10],
        purchase_limit_per_user: eventDetails[11],
        purchase_time_window: eventDetails[12],
      }
    : eventDetails;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Get Event Details</h2>
      <input
        style={styles.input}
        placeholder="Creator Address"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Event ID"
        type="text"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
      />
      <button style={styles.button} onClick={getEventDetails}>
        Get Event Details
      </button>
      {error && <div style={styles.error}>{error}</div>}
      {eventDetails && (
        <div>
          <h3 style={{ marginTop: '1rem', color: '#ffffff' }}>Formatted Event Data:</h3>
          <table style={styles.table}>
            <tbody>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Value</th>
              </tr>
              <tr>
                <td style={styles.td}>Event ID</td>
                <td style={styles.td}>{decodedDetails.event_id || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Name</td>
                <td style={styles.td}>{decodedDetails.name || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Description</td>
                <td style={styles.td}>{decodedDetails.description || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Date</td>
                <td style={styles.td}>{decodedDetails.date || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Venue</td>
                <td style={styles.td}>{decodedDetails.venue || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Total Seats</td>
                <td style={styles.td}>{decodedDetails.total_seats || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Available Seats</td>
                <td style={styles.td}>{decodedDetails.available_seats || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Base Price</td>
                <td style={styles.td}>{decodedDetails.base_price || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Creator</td>
                <td style={styles.td}>{decodedDetails.creator || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Is Active</td>
                <td style={styles.td}>{decodedDetails.is_active ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Royalty Percentage</td>
                <td style={styles.td}>{decodedDetails.royalty_percentage || "N/A"}%</td>
              </tr>
              <tr>
                <td style={styles.td}>Purchase Limit per User</td>
                <td style={styles.td}>{decodedDetails.purchase_limit_per_user || "N/A"}</td>
              </tr>
              <tr>
                <td style={styles.td}>Purchase Time Window</td>
                <td style={styles.td}>{decodedDetails.purchase_time_window || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetEventDetails;