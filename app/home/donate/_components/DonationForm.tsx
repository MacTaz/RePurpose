'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function DonationForm() {
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    category: '',
    description: '',
    deliveryPreference: 'pickup'
  }); //

  const [imageFile, setImageFile] = useState<File | null>(null); //
  const [uploading, setUploading] = useState(false); //
  const [preview, setPreview] = useState<string | null>(null); //
  const [isDragging, setIsDragging] = useState(false); //

  // Validation state
  const [errors, setErrors] = useState<Record<string, boolean>>({}); //
  const [showErrorMsg, setShowErrorMsg] = useState(false); //

  const fileInputRef = useRef<HTMLInputElement>(null); //
  const router = useRouter(); //

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }

    if (name === 'quantity') {
      const cleanValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }; //

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file); //
      setPreview(URL.createObjectURL(file)); //
      if (errors.image) setErrors(prev => ({ ...prev, image: false }));
    }
  }; //

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }; //

  const onDragLeave = () => setIsDragging(false); //

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }; //

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.itemName.trim()) newErrors.itemName = true;
    if (!formData.quantity.trim() || parseInt(formData.quantity) <= 0) newErrors.quantity = true;
    if (!formData.category) newErrors.category = true;
    if (!formData.description.trim()) newErrors.description = true;
    if (!imageFile) newErrors.image = true;

    setErrors(newErrors);
    const hasErrors = Object.keys(newErrors).length > 0;
    setShowErrorMsg(hasErrors);
    return !hasErrors;
  }; //

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setUploading(true);
    try {
      const supabase = createClient(); //
      const { data: { user } } = await supabase.auth.getUser(); //

      if (!user) {
        alert('Please log in to continue.');
        router.push('/login');
        return;
      }

      if (imageFile) {
        const { error: uploadError } = await supabase.storage
          .from('donations')
          .upload(`${user.id}/temp/current.jpg`, imageFile, {
            upsert: true,
            contentType: imageFile.type,
            cacheControl: '3600'
          }); //

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          alert(`Image upload failed: ${uploadError.message}`);
          setUploading(false);
          return;
        }
      }

      const params = new URLSearchParams({
        category: formData.category,
        quantity: formData.quantity,
        itemName: formData.itemName,
        description: formData.description,
        pref: formData.deliveryPreference,
        hasImage: 'true'
      }); //

      router.push(`/home/donate/match?${params.toString()}`); //
    } catch (err: any) {
      console.error('Submit Error:', err);
      alert('An error occurred while preparing your donation.');
      setUploading(false);
    }
  }; //

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 lg:p-8 font-['Inter'] font-normal flex flex-col">
      <div className="w-full flex-1 bg-[#9dbcd4] rounded-[40px] p-6 lg:p-10 shadow-inner flex flex-col">
        <div className="bg-white rounded-full py-2 px-10 shadow-sm mb-6 lg:mb-10 border border-gray-200 self-center">
          <h2 className="text-xl lg:text-2xl font-bold text-[#30496E] text-center">
            RePurpose Donation Form
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch flex-1">
          {/* Left Column: Image Upload Section */}
          <div className="w-full lg:w-1/3 flex flex-col">
            <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-200 flex-1 flex flex-col transition-colors`}>
              <h3 className="text-center text-[#30496E] mb-6 border-b-4 border-[#304674] pb-2 text-xl font-bold">
                Donation Item Image
              </h3>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              />

              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden min-h-[300px]
                  ${isDragging ? 'border-[#304674] bg-blue-50' : 'border-[#9dbcd4] bg-gray-50'} 
                  ${preview ? 'p-0 bg-gray-100' : 'p-10'}
                  ${errors.image ? 'border-red-500' : 'border-[#9dbcd4]'}`} /* Updated only the dashed box border color here */
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <div className="mb-2">
                      <img src="/DropIMG_Icon.png" alt="Upload Icon" className="w-16 h-16 object-contain" />
                    </div>
                    <p className="font-medium text-[#98BAD5]">Drop your image here</p>
                    <p className="text-xs text-[#98BAD5]">(.jpg, .jpeg, .png)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Form Section */}
          <div className="w-full lg:w-2/3 flex flex-col">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-200 flex-1 flex flex-col">
              <h3 className="text-center text-[#30496E] mb-6 border-b-4 border-[#304674] pb-2 text-xl font-bold">
                Donation Item Details
              </h3>
              <form className="space-y-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#30496E] mb-1">Item Name</label>
                    <input
                      type="text"
                      name="itemName"
                      placeholder="Enter Item Name Here"
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 outline-none transition-colors ${errors.itemName ? 'border-red-500 bg-red-50' : 'border-gray-400'}`}
                      value={formData.itemName}
                      onChange={handleChange} />
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-[#30496E] mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      placeholder="0"
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 outline-none transition-colors ${errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-400'}`}
                      value={formData.quantity}
                      onChange={handleChange}
                      onKeyDown={(e) => { if (['-', 'e', '.'].includes(e.key)) e.preventDefault(); }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#30496E] mb-1">Item Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md bg-white appearance-none focus:ring-2 focus:ring-blue-300 outline-none text-[#30496E] transition-colors ${errors.category ? 'border-red-500 bg-red-50' : 'border-gray-400'}`}
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}>
                    <option value="">Select Item Category</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Food">Food</option>
                    <option value="Water">Water</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#30496E] mb-1">Item Description / Comments</label>
                  <textarea
                    name="description"
                    rows={8}
                    placeholder="Describe Your Item Here"
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300 outline-none resize-none transition-colors ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-400'}`}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#30496E] mb-3">Item Delivery Preference</label>
                  <div className="flex gap-8 text-[#30496E]">
                    <label className="flex items-center gap-3 cursor-pointer text-lg font-medium">
                      <input
                        type="radio"
                        name="deliveryPreference"
                        value="pickup"
                        checked={formData.deliveryPreference === 'pickup'}
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#2d4373]" />
                      Pickup
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-lg font-medium">
                      <input
                        type="radio"
                        name="deliveryPreference"
                        value="delivery"
                        checked={formData.deliveryPreference === 'delivery'}
                        onChange={handleChange}
                        className="w-5 h-5 accent-[#2d4373]" />
                      Delivery Service
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 lg:mt-12 text-center max-w-2xl mx-auto w-full">
          <div className="border-t-2 border-dashed border-white mb-6 lg:mb-8 w-full"></div>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="block w-full bg-[#2d4373] text-white py-4 rounded-full text-xl lg:text-2xl font-black shadow-lg hover:bg-[#1e2e4f] transition-all uppercase tracking-wide disabled:opacity-50"
          >
            {uploading ? 'Preparing...' : 'Match'}
          </button>

          {showErrorMsg && (
            <p className="text-red-600 font-bold mt-4 text-lg bg-white/80 py-2 px-4 rounded-full inline-block">
              Please fill out the form first before proceeding.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}