'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload to Cloudinary');
      }

      onChange(data.url);
      setLocalPreview(null);
      toast.success('Image successfully uploaded to Cloudinary!');
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast.error(err.message || 'Image upload failed. Please try again.');
      setLocalPreview(null);
      onChange('');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setLocalPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeImage = localPreview || value;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {activeImage ? (
        <div className="relative group rounded-2xl overflow-hidden border border-[#E8E8E8] bg-[#F7F7F5] aspect-video max-h-64 flex items-center justify-center">
          <img
            src={activeImage}
            alt="Product"
            className="w-full h-full object-contain"
          />

          {uploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#3F46D8]" />
              <p className="text-xs font-bold tracking-wide">Uploading to Cloudinary...</p>
            </div>
          )}

          {!uploading && (
            <>
              {/* Cloudinary verification badge */}
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <CheckCircle className="h-3 w-3" /> Cloudinary CDN
              </div>

              {/* Action overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-[#111111] text-xs font-bold rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Change
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-[#3F46D8] bg-indigo-50/50 scale-[1.01]'
              : 'border-[#E8E8E8] bg-[#FDFDFD] hover:border-[#3F46D8] hover:bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-7 w-7 text-[#3F46D8]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#111111]">
              Click to upload <span className="text-[#6B6B6B] font-normal">or drag and drop</span>
            </p>
            <p className="text-xs text-[#888888]">
              PNG, JPG, WEBP up to 10MB (Automatically optimized via Cloudinary)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
