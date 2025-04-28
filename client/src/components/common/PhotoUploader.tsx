import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { handleImageActions } from '../../hooks/dbHooks';

interface PhotoUploaderProps {
  multiple?: boolean;
  type:string;
  id:string;
  onUpload?:(icon:string[], full:string[])=>void
}

interface CompressedImage {
  preview: string;
  normal: File;
  icon: File;

}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ type, id, multiple = false, onUpload }) => {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const fileArray = multiple ? Array.from(files) : [files[0]];
      const compressedImages = await Promise.all(fileArray.map(file => compressFile(file)));

      setImages(prev => multiple ? [...prev, ...compressedImages] : compressedImages);
    } catch (error) {
      console.error('Image compression error:', error);
    }
  };

  const compressFile = async (file: File) => {
    const commonOptions = {
      maxSizeMB: 0.5,
      useWebWorker: true,
      fileType: 'image/webp',
    };

    const normalOptions = { ...commonOptions, maxWidthOrHeight: 900 };
    const iconOptions = { ...commonOptions, maxWidthOrHeight: 100 };

    const normalImage = await imageCompression(file, normalOptions);
    const iconImage = await imageCompression(file, iconOptions);

    const previewUrl = await imageCompression.getDataUrlFromFile(normalImage);

    return {
      preview: previewUrl,
      normal: new File([normalImage], 'normal.webp', { type: 'image/webp' }),
      icon: new File([iconImage], 'icon.webp', { type: 'image/webp' }),
    };
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const handleSave = async () => {
    if (!images.length) return alert('No images to upload!');
    setLoading(true);

    try {
      const formData = new FormData();
      images.forEach((image) => {
        console.log(image);
        formData.append('normal', image.normal);
        formData.append('icon', image.icon);
      });

      const formDataEntries = formData.entries();
      let next = formDataEntries.next();
      while (!next.done) {
        console.log(next.value[0], next.value[1]);
        next = formDataEntries.next();
      }

      console.log(formData);
      formData.append('page',type);
      formData.append('id',id);
      const res = await handleImageActions({ type: 'users', body: formData, action: 'upload' });
      if(res.data && res.data.normalImages){
        onUpload && onUpload(res.data.iconImages, res.data.normalImages);
      }

      console.log('Upload success:', res);
      alert('Images uploaded successfully!');
      setImages([]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-4 mb-4 border-2 rounded-lg border-dashed border-blue-300 cursor-pointer hover:bg-blue-50 transition"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        multiple={multiple}
      />

      <div className="text-center text-gray-500">
        Drag and drop your image here, or{' '}
        <span className="text-blue-500 underline" onClick={handleClick}>
          click to upload
        </span>
      </div>

      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center">
          {images.map((image, index) => (
            <div key={index} className="relative mr-4 mb-4">
              <img
                src={image.preview}
                alt="Preview"
                className="w-[130px] h-auto rounded-lg border-2 border-white shadow-md"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute w-5 h-5 top-0 right-0 bg-red-500 text-white rounded-full text-xs flex justify-center items-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-500 text-white rounded-lg mt-4"
        >
          {loading ? 'Uploading...' : 'Save Images'}
        </button>
      )}
    </div>
  );
};

export default PhotoUploader;
