'use client';

import { useRef, useState } from 'react';
import { Camera, X, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSalonId } from '@/components/providers/AuthProvider';
const BUCKET = 'sterilization';

interface PhotoCaptureProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  label?: string;
  maxPhotos?: number;
  disabled?: boolean;
  /** Cycle ID for storage path — if not set, uses temp path */
  cycleId?: string;
  /** Step name for storage path (e.g. 'before', 'after', 'azopyramine') */
  step?: string;
}

async function getSupabaseClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key);
}

async function uploadToStorage(
  file: File,
  cycleId: string | undefined,
  step: string,
  salonId: string
): Promise<string | null> {
  try {
    const supabase = await getSupabaseClient();
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const folder = cycleId || 'temp';
    const path = `${salonId}/${folder}/${step}_${timestamp}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('[PhotoCapture] Upload error:', error.message);
      // Fallback: try to create bucket and retry
      if (error.message.includes('not found') || error.message.includes('Bucket')) {
        // Bucket doesn't exist — try creating
        await supabase.storage.createBucket(BUCKET, { public: true });
        const { error: retryError } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (retryError) {
          console.error('[PhotoCapture] Retry upload error:', retryError.message);
          return null;
        }
      } else {
        return null;
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return urlData?.publicUrl ?? null;
  } catch (err) {
    console.error('[PhotoCapture] Upload exception:', err);
    return null;
  }
}

export function PhotoCapture({
  photos,
  onChange,
  label = 'Фото',
  maxPhotos = 5,
  disabled = false,
  cycleId,
  step = 'photo',
}: PhotoCaptureProps) {
  const salonId = useSalonId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      setUploadProgress(`${i + 1}/${files.length}`);

      // Upload to Supabase Storage
      const publicUrl = await uploadToStorage(file, cycleId, step, salonId);

      if (publicUrl) {
        newUrls.push(publicUrl);
      } else {
        // Fallback to base64 if storage upload fails
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newUrls.push(dataUrl);
      }
    }

    onChange([...photos, ...newUrls].slice(0, maxPhotos));
    setLoading(false);
    setUploadProgress('');

    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-muted-foreground text-xs font-medium">{label}</p>}

      <div className="flex flex-wrap gap-2">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--glass-border)]"
          >
            <img src={photo} alt={`Фото ${i + 1}`} className="h-full w-full object-cover" />
            {!disabled && (
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {photos.length < maxPhotos && !disabled && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className={cn(
              'flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors',
              'hover:border-primary/40 hover:bg-primary/5 border-[var(--glass-border)]'
            )}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-0.5">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                {uploadProgress && (
                  <span className="text-muted-foreground text-[9px]">{uploadProgress}</span>
                )}
              </div>
            ) : (
              <>
                <Camera className="text-muted-foreground h-5 w-5" />
                <span className="text-muted-foreground text-[9px]">
                  {photos.length > 0 ? <Plus className="h-3 w-3" /> : 'Фото'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
