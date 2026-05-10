'use client';

import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function DepositButton() {
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const amount = window.prompt("Enter deposit amount (Minimum ₦100):", "1000");
    
    if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
      alert("Please enter a valid amount (Min ₦100)");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/payments/initialize", {
        amount: Number(amount)
      });

      const { authorization_url } = response.data;
      
      if (authorization_url) {
        window.location.href = authorization_url;
      } else {
        throw new Error("Failed to get checkout URL");
      }
    } catch (error) {
      console.error(error);
      alert("Payment initialization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDeposit}
      disabled={loading}
      className="btn-fun btn-pink flex-1 md:flex-none py-3 px-8 text-sm disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      Deposit
    </button>
  );
}
