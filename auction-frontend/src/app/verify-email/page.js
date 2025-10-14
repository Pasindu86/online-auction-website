'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { verifyEmail } from '../../lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setVerifying(false);
      setError('Invalid verification link');
    }
  }, [token]);

  const handleVerification = async () => {
    try {
      await verifyEmail(token);
      setSuccess(true);
      setVerifying(false);
    } catch (err) {
      setError(
        err?.response?.data?.message || 
        'Verification failed. The link may be invalid or expired.'
      );
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        {verifying && (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="text-blue-600 animate-spin" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Your Email...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {!verifying && success && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-8">
              Your email has been successfully verified. You can now login to your account.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          </>
        )}

        {!verifying && error && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-8">
              {error}
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/register')}
                className="w-full"
              >
                Register Again
              </Button>
              <button
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
