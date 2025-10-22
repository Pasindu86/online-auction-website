'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import FormInput from '@/components/auth/FormInput';
import { getCurrentUser } from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { ArrowLeft, ImagePlus, DollarSign, Clock, FileText } from 'lucide-react';

export default function CreateAuction() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    imageFile: null,
    startTime: '',
    endTime: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        imageFile: 'Please select a valid image file (JPEG, PNG, GIF)'
      }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        imageFile: 'File size must be less than 5MB'
      }));
      return;
    }
    
    setFormData(prev => ({ ...prev, imageFile: file }));
    if (errors.imageFile) {
      setErrors(prev => ({ ...prev, imageFile: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startingPrice || parseFloat(formData.startingPrice) < 0) {
      newErrors.startingPrice = 'Starting price must be a positive number';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const now = new Date();
      const minStartTime = new Date(now.getTime() + 60000); // 1 minute from now
      const startDate = new Date(formData.startTime);
      
      if (startDate < minStartTime) {
        newErrors.startTime = 'Start time must be at least 1 minute from now';
      }
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime) {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      if (endDate <= startDate) {
        newErrors.endTime = 'End time must be after start time';
      } else if (endDate - startDate < 300000) {
        newErrors.endTime = 'Auction must run for at least 5 minutes';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createAuction = async (auctionData) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';
    
    const response = await fetch(`${API_BASE_URL}/auctions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auctionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  const uploadImage = async (file) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Upload failed! status: ${response.status}`);
    
    const result = await response.json();
    return result.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('You must be logged in to create an auction');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let imageUrl = null;
      
      if (formData.imageFile) {
        try {
          imageUrl = await uploadImage(formData.imageFile);
        } catch (uploadError) {
          setError('Image upload failed, but you can continue without an image.');
        }
      }

      const auctionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startingPrice: parseFloat(formData.startingPrice),
        ownerId: currentUser.id,
        imageUrl,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      await createAuction(auctionData);
      setSuccess(true);
      
      setTimeout(() => router.push('/main/auctions'), 2000);
    } catch (error) {
      setError(`Failed to create auction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current date-time + 1 minute in local timezone for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 1); // Add 1 minute
    return now.toISOString().slice(0, 16);
  };

  const ErrorIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Main Success Card */}
            <div className="relative">
              {/* Animated Background Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              
              {/* Card Content */}
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Success Header with Gradient */}
                <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-10 text-center">
                  {/* Animated Checkmark */}
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                    <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                      <svg className="w-14 h-14 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-2">Auction Created Successfully!</h2>
                  <p className="text-green-100 text-lg">Your item is now ready for bidding</p>
                </div>

                {/* Loading Section */}
                <div className="px-8 py-12 text-center">
                  {/* Custom Loading Spinner */}
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-800 border-r-blue-800 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-indigo-600 border-r-indigo-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
                  </div>

                  <p className="text-gray-700 text-lg font-semibold mb-2">Redirecting to auctions page</p>
                  <p className="text-gray-500 text-sm">Please wait a moment...</p>

                  {/* Progress Dots */}
                  <div className="flex justify-center gap-2 mt-6">
                    <div className="w-3 h-3 bg-blue-800 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-3 h-3 bg-blue-800 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-3 h-3 bg-blue-800 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>

                {/* Bottom Gradient Accent */}
                <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-700">Live & Visible</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-700">Ready for Bids</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-700">Fully Tracked</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-800 font-medium mb-6 transition-all hover:gap-3"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <ImagePlus size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Create New Auction</h1>
                  <p className="text-blue-100 mt-1">List your item and start receiving bids</p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              {/* Error Message */}
              {error && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Auction Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg border-b border-gray-200 pb-2">
                    <FileText size={20} className="text-blue-800" />
                    <h2>Auction Details</h2>
                  </div>

                  {/* Title */}
                  <FormInput
                    label="Auction Title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={errors.title}
                    placeholder="E.g., Vintage Camera, Gaming Laptop, Collectible Watch"
                    required
                  />

                  {/* Description */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                      Description <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide a detailed description of your item including condition, features, specifications, and any other relevant information..."
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all ${
                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      required
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <ErrorIcon />
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg border-b border-gray-200 pb-2">
                    <DollarSign size={20} className="text-green-600" />
                    <h2>Pricing</h2>
                  </div>

                  {/* Starting Price */}
                  <div className="space-y-2">
                    <label htmlFor="startingPrice" className="block text-sm font-semibold text-gray-700">
                      Starting Price <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-semibold">Rs.</span>
                      </div>
                      <input
                        id="startingPrice"
                        name="startingPrice"
                        type="number"
                        value={formData.startingPrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all ${
                          errors.startingPrice ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        required
                      />
                    </div>
                    {errors.startingPrice && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <ErrorIcon />
                        {errors.startingPrice}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Set the minimum bid amount</p>
                  </div>
                </div>

                {/* Timing Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg border-b border-gray-200 pb-2">
                    <Clock size={20} className="text-blue-800" />
                    <h2>Auction Schedule</h2>
                  </div>

                  {/* Redesigned Time Picker Cards */}
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Start Time Card */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
                      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <label htmlFor="startTime" className="text-white font-bold text-base">
                                Start Time <span className="text-yellow-300">*</span>
                              </label>
                              <p className="text-blue-100 text-xs font-medium">When bidding begins</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <input
                              id="startTime"
                              name="startTime"
                              type="datetime-local"
                              value={formData.startTime}
                              onChange={handleInputChange}
                              min={getCurrentDateTime()}
                              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 font-semibold text-base ${
                                errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300 bg-gray-50'
                              }`}
                              required
                            />
                          </div>
                          {errors.startTime && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                              <ErrorIcon />
                              <span className="font-medium">{errors.startTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* End Time Card */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur"></div>
                      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <label htmlFor="endTime" className="text-white font-bold text-base">
                                End Time <span className="text-yellow-300">*</span>
                              </label>
                              <p className="text-orange-100 text-xs font-medium">Min. 10 minutes duration</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <input
                              id="endTime"
                              name="endTime"
                              type="datetime-local"
                              value={formData.endTime}
                              onChange={handleInputChange}
                              min={formData.startTime || getCurrentDateTime()}
                              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-800 font-semibold text-base ${
                                errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-orange-300 bg-gray-50'
                              }`}
                              required
                            />
                          </div>
                          {errors.endTime && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                              <ErrorIcon />
                              <span className="font-medium">{errors.endTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duration Info Banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm mb-1">Auction Duration Requirements</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Your auction must run for at least <span className="font-bold text-blue-800">10 minutes</span>. Choose times that give bidders enough opportunity to participate.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg border-b border-gray-200 pb-2">
                    <ImagePlus size={20} className="text-orange-600" />
                    <h2>Product Image</h2>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="imageFile" className="block text-sm font-semibold text-gray-700">
                      Upload Image
                    </label>
                    <div className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl hover:border-blue-800 transition-colors bg-gray-50 hover:bg-blue-50 ${
                      errors.imageFile ? 'border-red-300' : 'border-gray-300'
                    }`}>
                      <div className="space-y-2 text-center">
                        <div className="mx-auto h-16 w-16 text-gray-400 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <ImagePlus size={32} />
                        </div>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="imageFile"
                            className="relative cursor-pointer bg-white rounded-md font-semibold text-blue-800 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 transition-colors"
                          >
                            <span>Upload a file</span>
                            <input
                              id="imageFile"
                              name="imageFile"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        {formData.imageFile && (
                          <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {formData.imageFile.name}
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.imageFile && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <ErrorIcon />
                        {errors.imageFile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 space-y-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 hover:from-blue-900 hover:via-indigo-900 hover:to-blue-700 shadow-lg shadow-blue-800/30"
                  >
                    {isLoading ? 'Creating Auction...' : 'Create Auction'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => router.push('/main/auctions')}
                    disabled={isLoading}
                    className="w-full py-4 text-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
