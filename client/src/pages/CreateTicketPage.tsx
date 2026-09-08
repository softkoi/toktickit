import React, { useState } from 'react';
import { TicketForm } from '../components/TicketForm';
import { CheckCircle } from 'lucide-react';

interface CreateTicketPageProps {
  onNavigateToTickets?: () => void;
  onCancel?: () => void;
}

export const CreateTicketPage: React.FC<CreateTicketPageProps> = ({ onNavigateToTickets, onCancel }) => {
  const [created, setCreated] = useState<boolean>(false);

  if (created) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center', background: '#FFF', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle size={32} color="#006B3C" />
        </div>
        <h2 style={{ fontSize: '22px', color: '#1A2D23', marginBottom: '8px' }}>Ticket Created Successfully!</h2>
        <p style={{ color: '#5C6B73', marginBottom: '24px' }}>Your issue ticket has been submitted to the IT support team.</p>
        <button
          className="btn btn-primary"
          onClick={onNavigateToTickets}
          style={{ padding: '10px 24px', borderRadius: '8px', background: '#006B3C', color: '#FFF', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          View My Tickets
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 16px' }}>
      <TicketForm
        onSuccess={() => setCreated(true)}
        onCancel={onCancel}
      />
    </div>
  );
};
