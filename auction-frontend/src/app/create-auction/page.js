'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import FormInput from '@/components/auth/FormInput';
import { getCurrentUser } from '@/lib/api';

export default function CreateAuction() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    imageFile: null
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
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          imageFile: 'Please select a valid image file (JPEG, PNG, GIF)'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imageFile: 'File size must be less than 5MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
      
      // Clear error if valid file
      if (errors.imageFile) {
        setErrors(prev => ({
          ...prev,
          imageFile: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.startingPrice || parseFloat(formData.startingPrice) < 0) {
      newErrors.startingPrice = 'Starting price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createAuction = async (auctionData) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';
    
    try {
      const response = await fetch(`${API_BASE_URL}/auctions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auctionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create auction error:', error);
      throw error;
    }
  };

  const uploadImage = async (file) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed! status: ${response.status}`);
      }

      const result = await response.json();
      return result.url; // Return the URL directly
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if user is logged in
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
      
      // Upload image first if provided
      if (formData.imageFile) {
        try {
          imageUrl = await uploadImage(formData.imageFile);
        } catch (uploadError) {
          console.warn('Image upload failed:', uploadError);
          setError('Image upload failed, but you can continue without an image.');
          // Continue anyway - we can create auction without image
        }
      }

      // Prepare auction data with image URL
      const auctionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startingPrice: parseFloat(formData.startingPrice),
        ownerId: currentUser.id,
        imageUrl: imageUrl // Include the uploaded image URL
      };

      // Create auction with image URL
      const createdAuction = await createAuction(auctionData);

      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/main/auctions');
      }, 2000);

    } catch (error) {
      console.error('Error creating auction:', error);
      setError('Failed to create auction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Auction Created Successfully!</h2>
          <p className="text-gray-600 mb-4">Your auction has been created and is now live.</p>
          <p className="text-sm text-gray-500">Redirecting to auctions page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Auction</h1>
            <p className="mt-2 text-gray-600">List your item for auction</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <FormInput
              label="Auction Title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={errors.title}
              placeholder="Enter auction title"
              required
            />

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item in detail..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.description && (
                <p className="text-red-600 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Starting Price */}
            <FormInput
              label="Starting Price ($)"
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleInputChange}
              error={errors.startingPrice}
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">
                Product Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="imageFile"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
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
                    <p className="text-sm text-green-600 font-medium">{formData.imageFile.name}</p>
                  )}
                </div>
              </div>
              {errors.imageFile && (
                <p className="text-red-600 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.imageFile}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating Auction...' : 'Create Auction'}
              </Button>
            </div>

            {/* Cancel Button */}
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/main/auctions')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
