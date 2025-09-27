'use client';

import { useState, useEffect } from 'react';

interface SubscriptionStatus {
  isActive: boolean;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export function SubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/subscription-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) {
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchSubscriptionStatus();
        alert('Assinatura cancelada com sucesso. Você manterá acesso até o fim do período pago.');
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Erro ao cancelar assinatura');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assinatura</h3>
        <p className="text-gray-600 mb-4">Você não possui uma assinatura ativa.</p>
        <button
          onClick={() => window.location.href = '/subscription'}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Assinar Agora
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-yellow-600 bg-yellow-100';
      case 'past_due':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'cancelled':
        return 'Cancelada';
      case 'past_due':
        return 'Pagamento Pendente';
      default:
        return 'Inativa';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Assinatura</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
            {getStatusText(subscription.status)}
          </span>
        </div>

        {subscription.currentPeriodEnd && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              {subscription.cancelAtPeriodEnd ? 'Expira em:' : 'Próxima cobrança:'}
            </span>
            <span className="text-gray-900">
              {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Valor:</span>
          <span className="text-gray-900 font-medium">R$ 30,00/mês</span>
        </div>
      </div>

      {subscription.isActive && !subscription.cancelAtPeriodEnd && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancelSubscription}
            disabled={cancelling}
            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
          >
            {cancelling ? 'Cancelando...' : 'Cancelar Assinatura'}
          </button>
        </div>
      )}

      {subscription.cancelAtPeriodEnd && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            Sua assinatura foi cancelada e expirará em {subscription.currentPeriodEnd?.toLocaleDateString('pt-BR')}.
            Você pode reativar a qualquer momento.
          </p>
        </div>
      )}

      {subscription.status === 'past_due' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm mb-2">
            Há um problema com seu pagamento. Atualize suas informações para manter o acesso.
          </p>
          <button
            onClick={() => window.location.href = '/subscription/update-payment'}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
          >
            Atualizar Pagamento
          </button>
        </div>
      )}
    </div>
  );
}