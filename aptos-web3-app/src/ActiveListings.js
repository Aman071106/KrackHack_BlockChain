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
    maxWidth: '1900px', // Increased container width to fit the table
    width: '100%',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '1rem',
    background: 'linear-gradient(90deg, #00ff88, #00bfff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
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
    width: '100%',
    marginBottom: '1rem',
  },
  error: {
    color: '#ff4d4d',
    marginTop: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  table: {
    width: '100%',
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

const ActiveListings = () => {
  const [creator, setCreator] = useState('');
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);

  const fetchActiveListings = async () => {
    try {
      setError(null);
      setListings([]);

      // Normalize module address and creator address (ensure they include "0x")
      const moduleAddress = process.env.REACT_APP_MODULE_ADDRESS || "";
      const normalizedModuleAddress = moduleAddress.startsWith("0x")
        ? moduleAddress
        : "0x" + moduleAddress;
      const normalizedCreator = creator.trim().startsWith("0x")
        ? creator.trim()
        : "0x" + creator.trim();

      const payload = {
        function: `${normalizedModuleAddress}::BlockChain_Ticketing_v2::get_active_listings`,
        type_arguments: [],
        arguments: [normalizedCreator],
      };

      const response = await client.view(payload);
      console.log("Response from Aptos (ActiveListings):", response[0]);

      let resultArray = [];
      if (response) {
        if (response[0]) {
          resultArray = response[0];
        } else if (Array.isArray(response)) {
          resultArray = response;
        }
      }

      if (resultArray && Array.isArray(resultArray) && resultArray.length > 0) {
        setListings(resultArray);
      } else {
        setError("No active listings found for the given creator.");
      }
    } catch (err) {
      console.error("Error fetching active listings:", err);
      setError("Error fetching active listings. See console for details.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Active Listings</h2>
      <input
        style={styles.input}
        placeholder="Enter creator's wallet address"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
      />
      <button style={styles.button} onClick={fetchActiveListings}>
        Fetch Active Listings
      </button>
      {error && <div style={styles.error}>{error}</div>}
      {listings.length > 0 && (
        <div>
          <h3 style={{ marginTop: '1rem', color: '#ffffff', textAlign: 'center' }}>
            Formatted Active Listings:
          </h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event ID</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Max Resale Price</th>
                <th style={styles.th}>Seller</th>
                <th style={styles.th}>Property Version</th>
                <th style={styles.th}>Collection</th>
                {/* <th style={styles.th}>Token Creator</th> */}
                <th style={styles.th}>Token Name</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, index) => (
                <tr key={index}>
                  <td style={styles.td}>{listing.event_id || "N/A"}</td>
                  <td style={styles.td}>{listing.price || "N/A"}</td>
                  <td style={styles.td}>{listing.max_resale_price || "N/A"}</td>
                  <td style={styles.td}>{listing.seller || "N/A"}</td>
                  <td style={styles.td}>
                    {listing.token_id && listing.token_id.property_version
                      ? listing.token_id.property_version
                      : "N/A"}
                  </td>
                  <td style={styles.td}>
                    {listing.token_id &&
                    listing.token_id.token_data_id &&
                    listing.token_id.token_data_id.collection
                      ? listing.token_id.token_data_id.collection
                      : "N/A"}
                  </td>
                  {/* <td style={styles.td}>
                    {listing.token_id &&
                    listing.token_id.token_data_id &&
                    listing.token_id.token_data_id.creator
                      ? listing.token_id.token_data_id.creator
                      : "N/A"}
                  </td> */}
                  <td style={styles.td}>
                    {listing.token_id &&
                    listing.token_id.token_data_id &&
                    listing.token_id.token_data_id.name
                      ? listing.token_id.token_data_id.name
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveListings;
