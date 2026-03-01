'use client';

import React, { useState, useRef } from 'react';

export default function DonationForm() {
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    category: '',
    description: '',
    deliveryPreference: 'pickup'
  });
  
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      const cleanValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  {/* - Link break so i dont get lost ------------------------------------------------------------------------------------------- */}

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 pb-10 font-['Inter'] font-normal">
      {/* Title Header */}
      <div className="bg-white rounded-full py-2 px-10 shadow-sm mb-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-700 text-center">
          RePurpose Donation Form
        </h2>
      </div>

      {/* Image Upload Section - working */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-200">
        <h3 className="text-center text-gray-600 mb-6 border-b-4 border-[#304674] pb-2 text-xl font-bold">
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
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden
            ${isDragging ? 'border-[#304674] bg-blue-50' : 'border-[#9dbcd4] bg-gray-50'} 
            ${preview ? 'p-0 bg-gray-100' : 'p-10'}`}
        >
          {preview ? (
            /* this should cater to all image resolutions, portrait landscape or box */
            <img 
                src={preview} 
                alt="Preview" 
                className="w-full max-h-[500px] object-contain" 
            />
          ) : (
            <>
              <div className="mb-2">
                <img src="/DropIMG_Icon.png" alt="Upload Icon" className="w-16 h-16 object-contain" />
              </div>
              <p className="font-medium text-[#98BAD5]">Drop your image here</p>
              {/* I didnt add any file limiters but technically nothing should happen 
              if anything other than image files are inputted, though .gif works since its still an image*/}
              <p className="text-xs text-[#98BAD5]">(.jpg, .jpeg, .png)</p>
            </>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h3 className="text-center text-gray-600 mb-6 border-b-4 border-[#304674] pb-2 text-xl font-bold">
          Donation Form
        </h3>
          
          {/* Item Name */}
        <form className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Item Name</label>
              <input 
                type="text" 
                name="itemName"
                placeholder="Enter Item Name Here"
                className="w-full p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
                value={formData.itemName}
                onChange={handleChange}/>
            </div>
            
          {/* Quantity */}
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
              <input 
                type="number" 
                name="quantity"
                min="1"
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                onKeyDown={(e) => { if (['-', 'e', '.'].includes(e.key)) e.preventDefault(); }}
                className="w-full p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"/>
            </div>
          </div>
          
          {/* Item Category */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Item Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-400 rounded-md bg-white appearance-none focus:ring-2 focus:ring-blue-300 outline-none"
              /* the long style code below is just the dropdown arrow thing lol, can be replaced with an image icon if preferred */
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}>
              
              {/* Categories, add more if you come up with new ones --------------------------------------- */}
              <option value="">Select Item Category</option>
              <option value="clothing">Clothing</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="books">Books</option>
              <option value="toys">Toys/Games</option>
              <option value="appliances">Kitchen Appliances</option>
              <option value="others">Others: Please Specify</option>
            </select>
          </div>

            {/* Item Description*/}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Item Description / Comments</label>
            <textarea 
              name="description"
              rows={5}
              placeholder="Describe Your Item Here"
              className="w-full p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-300 outline-none resize-none"
              value={formData.description}
              onChange={handleChange}>
              </textarea>
          </div>

            {/* Delifery Pref */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Item Delivery Preference</label>
            <div className="flex gap-6 text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="deliveryPreference" 
                  value="pickup" 
                  checked={formData.deliveryPreference === 'pickup'} 
                  onChange={handleChange} 
                  className="w-4 h-4 accent-[#2d4373]"/>
                Pickup
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="deliveryPreference" 
                  value="delivery" 
                  checked={formData.deliveryPreference === 'delivery'} 
                  onChange={handleChange} 
                  className="w-4 h-4 accent-[#2d4373]"/>
                Delivery Service
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Save Button, no funtionality as of now */}
      <div className="mt-8 border-t-4 border-dashed border-white pt-6">
        <button className="w-full bg-[#2d4373] text-white py-3 rounded-full text-xl font-bold shadow-lg hover:bg-[#1e2e4f] transition-colors uppercase tracking-wide">
          Save
        </button>
      </div>
    </div>
  );
}