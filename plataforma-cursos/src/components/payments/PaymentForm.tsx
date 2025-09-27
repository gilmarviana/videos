'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface PaymentFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe não carregou');
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: cardData.number.replace(/\s/g, ''),
          exp_month: parseInt(cardData.expiry.split('/')[0]),
          exp_year: parseInt('20' + cardData.expiry.split('/')[1]),
          cvc: cardData.cvc,
        },
        billing_details: {
          name: cardData.name,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Create subscription
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao processar pagamento');
      }

      // Handle 3D Secure if needed
      if (result.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret);
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error('Payment error:', error);
      onError?.(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome no Cartão
        </label>
        <input
          type="text"
          id="name"
          value={cardData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="João Silva"
          required
        />
      </div>

      <div>
        <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
          Número do Cartão
        </label>
        <input
          type="text"
          id="number"
          value={cardData.number}
          onChange={(e) => handleInputChange('number', formatCardNumber(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
            Validade
          </label>
          <input
            type="text"
            id="expiry"
            value={cardData.expiry}
            onChange={(e) => handleInputChange('expiry', formatExpiry(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="MM/AA"
            maxLength={5}
            required
          />
        </div>

        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            value={cardData.cvc}
            onChange={(e) => handleInputChange('cvc', e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123"
            maxLength={4}
            required
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Assinatura Mensal:</span>
          <span className="font-semibold">R$ 30,00</span>
        </div>
        <p className="text-sm text-gray-500">
          Cobrança recorrente mensal. Cancele a qualquer momento.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Processando...' : 'Assinar por R$ 30,00/mês'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Seus dados de pagamento são protegidos com criptografia SSL.
      </p>
    </form>
  );
}