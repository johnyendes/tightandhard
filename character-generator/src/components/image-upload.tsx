'use client';

import { ImagePlus, X } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/field';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export function ImageUpload({ value, onChange, disabled, label = 'Image', hint }: ImageUploadProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'tightandhard_models';

  return (
    <div className='space-y-3'>
      {value ? (
        <div className='relative w-full max-w-xs aspect-square rounded-md overflow-hidden border'>
          <Image src={value} alt={label} fill className='object-cover' />
          <button
            type='button'
            onClick={() => onChange('')}
            className='absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80'
            aria-label='Remove image'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset={uploadPreset}
          onUpload={(result: any) => {
            const url = result?.info?.secure_url;
            if (typeof url === 'string') onChange(url);
          }}
          options={{
            sources: ['local', 'url', 'camera'],
            maxFiles: 1,
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            maxFileSize: 10_000_000,
          }}
        >
          {({ open }) => (
            <Button
              type='button'
              variant='secondary'
              disabled={disabled}
              onClick={() => open?.()}
              className='w-full md:w-auto'
            >
              <ImagePlus className='w-4 h-4 mr-2' />
              Upload {label.toLowerCase()}
            </Button>
          )}
        </CldUploadWidget>
      )}
      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
    </div>
  );
}
