'use client';

import { useState, useEffect } from 'react';

interface TestDetails {
  status: string;
  message: string;
  [key: string]: unknown;
}

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<TestDetails | null>(null);

  useEffect(() => {
    const checkEnv = async () => {
      try {
        const response = await fetch('/api/test-env');
        const data = await response.json() as TestDetails;
        
        setStatus(data.status === 'success' ? 'success' : 'error');
        setMessage(data.message);
        setDetails(data);
      } catch (error) {
        setStatus('error');
        setMessage('Failed to check environment variables');
        setDetails(error as TestDetails);
      }
    };

    checkEnv();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Environment Variables Check
            </h3>
            
            <div className="mt-4">
              <div className={`p-4 rounded-md ${
                status === 'loading' ? 'bg-blue-50' :
                status === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {status === 'loading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                    )}
                    {status === 'success' && (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {status === 'error' && (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      status === 'loading' ? 'text-blue-800' :
                      status === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {message}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {details && (
              <div className="mt-4">
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 