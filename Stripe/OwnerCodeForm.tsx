// src/components/OwnerCodeForm.tsx
import React, { useState } from 'react';
import { PaymentService } from '../services/PaymentService';

const OwnerCodeForm = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const paymentService = new PaymentService();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const isValid = await paymentService.verifyOwnerCode(code);
      if (isValid) {
        // Grant access to owner features
      } else {
        setError('Invalid owner code');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Owner Code:
        <input type="text" value={code} onChange={(event) => setCode(event.target.value)} />
      </label>
      <button type="submit">Verify</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};
