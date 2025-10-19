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
    } else if (new Date(formData.startTime) <= new Date()) {
      newErrors.startTime = 'Start time must be in the future';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else if (formData.startTime) {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      if (endDate <= startDate) {
        newErrors.endTime = 'End time must be after start time';
      } else if (endDate - startDate < 3600000) {
        newErrors.endTime = 'Auction must run for at least 1 hour';
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

  // Get current date-time in local timezone for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
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
        <div className="min-h-screen bg-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          {/* Success Notification at Top */}
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
            <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 flex items-center gap-3 min-w-[320px]">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Success!</h3>
                <p className="text-sm text-gray-600">Your auction has been created.</p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
              <p className="text-gray-600">Redirecting to auctions page...</p>
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
                        <span className="text-gray-500 font-semibold">$</span>
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
                        className={`w-full pl-8 pr-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all ${
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
                    <Clock size={20} className="text-purple-600" />
                    <h2>Auction Schedule</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div className="space-y-2">
                      <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700">
                        Start Time <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        id="startTime"
                        name="startTime"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        min={getCurrentDateTime()}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all ${
                          errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        required
                      />
                      {errors.startTime && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <ErrorIcon />
                          {errors.startTime}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">When bidding begins</p>
                    </div>

                    {/* End Time */}
                    <div className="space-y-2">
                      <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700">
                        End Time <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        id="endTime"
                        name="endTime"
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        min={formData.startTime || getCurrentDateTime()}
                        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all ${
                          errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        required
                      />
                      {errors.endTime && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <ErrorIcon />
                          {errors.endTime}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">Min. 1 hour duration</p>
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
