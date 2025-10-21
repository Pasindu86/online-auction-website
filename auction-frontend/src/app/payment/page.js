'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Banknote, Check, X, Truck, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getCurrentUser } from '../../lib/api';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  // Form data
  const [paymentMethod, setPaymentMethod] = useState('CreditCard');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';

  const fetchOrderDetails = useCallback(async (orderId, auctionId) => {
    try {
      setLoading(true);
      
      const url = orderId 
        ? `${API_URL}/orders/${orderId}`
        : `${API_URL}/orders/create-from-auction/${auctionId}`;
      
      const method = orderId ? 'GET' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
      });
      
      if (!response.ok) throw new Error('Failed to load order details');
      
      const orderData = await response.json();
      setOrder(orderData);
      setError('');
    } catch (error) {
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const orderId = searchParams.get('orderId');
    const auctionId = searchParams.get('auctionId');
    
    if (!orderId && !auctionId) {
      setError('No order or auction specified');
      setLoading(false);
      return;
    }

    fetchOrderDetails(orderId, auctionId);
  }, [searchParams, router, fetchOrderDetails]);

  const validateForm = () => {
    if (!shippingAddress.trim()) return 'Please enter a shipping address';
    
    if (paymentMethod === 'CreditCard') {
      if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
        return 'Please fill in all card details';
      }
      if (cardNumber.replace(/\s/g, '').length < 13) {
        return 'Please enter a valid card number';
      }
    }
    return null;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!order) return setError('Order not found');
    
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    try {
      setProcessing(true);
      setError('');

      const paymentData = {
        paymentMethod,
        shippingAddress,
        ...(paymentMethod === 'CreditCard' && { cardNumber: cardNumber.replace(/\s/g, '') })
      };

      const response = await fetch(`${API_URL}/orders/${order.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }

      const result = await response.json();
      setTransactionId(result.transactionId);
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardExpiry(value);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-mono text-sm font-medium">{transactionId}</p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => router.push('/my-auctions')} className="w-full">
              View My Orders
            </Button>
            <Button variant="outline" onClick={() => router.push('/main')} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/main')}>Go Back to Home</Button>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">You won this auction! Complete your payment to receive your item.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="CreditCard"
                        checked={paymentMethod === 'CreditCard'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      <CreditCard className="w-5 h-5 mr-2" />
                      Credit Card
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="BankTransfer"
                        checked={paymentMethod === 'BankTransfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      <Banknote className="w-5 h-5 mr-2" />
                      Bank Transfer
                    </label>
                  </div>

                  {paymentMethod === 'CreditCard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength="19"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                        <input
                          type="text"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength="4"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'BankTransfer' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Bank Transfer Instructions</h3>
                      <p className="text-sm text-blue-700">
                        You will receive bank transfer details after confirming your order. 
                        Payment must be completed within 24 hours.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your complete shipping address..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={processing} 
                className="w-full py-3 text-lg !bg-blue-600 hover:!bg-blue-700 !text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing Payment...' : `Pay Rs. ${order?.finalPrice?.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {order && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.auction?.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{order.auction?.description}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Winning Bid</span>
                      <span className="font-medium">Rs. {order.finalPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-semibold text-blue-600">
                          Rs. {order.finalPrice?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-700 font-medium">Secure Payment Protected</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}