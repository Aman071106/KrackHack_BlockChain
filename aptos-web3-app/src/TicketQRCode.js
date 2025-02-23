import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const TicketQRCode = ({ ticketData }) => {
  const qrValue = JSON.stringify(ticketData);
  
  return (
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
      <QRCodeCanvas value={qrValue} size={128} level="H" includeMargin={true} />
    </div>
  );
};

export default TicketQRCode;
