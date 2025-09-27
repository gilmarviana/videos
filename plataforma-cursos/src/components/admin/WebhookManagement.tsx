'use client';

import { useState, useEffect } from 'react';
import { Webhook, WebhookLog } from '@/lib/db/repositories/webhook.repository';

interface WebhookFormData {
  name: string;
  url: string;
  eventType: 'site_visit' | 'trial_generated' | 'module_completed' | 'certificate_generated';
  headers: Record<string, string>;
  isActive: boolean;
}

export default function WebhookManagement() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  
  const [formData, setFormData] = useState<WebhookFormData>({
    name: '',
    url: '',
    eventType: 'site_visit',
    headers: {},
    isActive: true
  });

  const [headerInput, setHeaderInput] = useState({ key: '', value: '' });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
  };

  const fetchWebhookLogs = async (webhookId?: string) => {
    try {
      const url = webhookId ? `/api/webhooks/${webhookId}/logs` : '/api/webhooks/logs';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = selectedWebhook ? `/api/webhooks/${selectedWebhook.id}` : '/api/webhooks';
      const method = selectedWebhook ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchWebhooks();
        resetForm();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to save webhook');
      }
    } catch (error) {
      console.error('Error saving webhook:', error);
      alert('Failed to save webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchWebhooks();
      } else {
        alert('Failed to delete webhook');
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Failed to delete webhook');
    }
  };

  const handleTest = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' });
      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [id]: data.testResult || data.error
      }));
      
      // Refresh logs after test
      if (selectedWebhook?.id === id) {
        await fetchWebhookLogs(id);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      setTestResults(prev => ({
        ...prev,
        [id]: { success: false, error: 'Failed to test webhook' }
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      eventType: 'site_visit',
      headers: {},
      isActive: true
    });
    setSelectedWebhook(null);
    setHeaderInput({ key: '', value: '' });
  };

  const editWebhook = (webhook: Webhook) => {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      eventType: webhook.eventType,
      headers: webhook.headers,
      isActive: webhook.isActive
    });
    setSelectedWebhook(webhook);
    setShowForm(true);
  };

  const addHeader = () => {
    if (headerInput.key && headerInput.value) {
      setFormData(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [headerInput.key]: headerInput.value
        }
      }));
      setHeaderInput({ key: '', value: '' });
    }
  };

  const removeHeader = (key: string) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const viewLogs = async (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setShowLogs(true);
    await fetchWebhookLogs(webhook.id);
  };

  const eventTypeLabels = {
    site_visit: 'Site Visit',
    trial_generated: 'Trial Generated',
    module_completed: 'Module Completed',
    certificate_generated: 'Certificate Generated'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Webhook Management</h1>
        <div className="space-x-2">
          <button
            onClick={() => fetchWebhookLogs()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            View All Logs
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Webhook
          </button>
        </div>
      </div>

      {/* Webhook List */}
      {!showForm && !showLogs && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {webhooks.map((webhook) => (
                <tr key={webhook.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {webhook.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="truncate max-w-xs block" title={webhook.url}>
                      {webhook.url}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {eventTypeLabels[webhook.eventType]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      webhook.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleTest(webhook.id)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => viewLogs(webhook)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Logs
                    </button>
                    <button
                      onClick={() => editWebhook(webhook)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="p-4 bg-gray-50 border-t">
              <h3 className="text-lg font-medium mb-2">Test Results</h3>
              {Object.entries(testResults).map(([webhookId, result]) => {
                const webhook = webhooks.find(w => w.id === webhookId);
                return (
                  <div key={webhookId} className="mb-2 p-2 bg-white rounded border">
                    <div className="font-medium">{webhook?.name}</div>
                    <div className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success 
                        ? `Success: ${result.status} - ${result.body?.substring(0, 100)}...`
                        : `Failed: ${result.error}`
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Webhook Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedWebhook ? 'Edit Webhook' : 'Add Webhook'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  eventType: e.target.value as WebhookFormData['eventType']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headers
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Header name"
                    value={headerInput.key}
                    onChange={(e) => setHeaderInput(prev => ({ ...prev, key: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Header value"
                    value={headerInput.value}
                    onChange={(e) => setHeaderInput(prev => ({ ...prev, value: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addHeader}
                    className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Add
                  </button>
                </div>
                
                {Object.entries(formData.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">
                      <strong>{key}:</strong> {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHeader(key)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (selectedWebhook ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs View */}
      {showLogs && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">
              {selectedWebhook ? `Logs for ${selectedWebhook.name}` : 'All Webhook Logs'}
            </h2>
            <button
              onClick={() => setShowLogs(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.triggeredAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.responseStatus && log.responseStatus >= 200 && log.responseStatus < 300
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.responseStatus || 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <pre className="text-xs max-w-xs overflow-hidden">
                        {JSON.stringify(log.payload, null, 2).substring(0, 100)}...
                      </pre>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="max-w-xs block truncate">
                        {log.responseBody?.substring(0, 100)}...
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}