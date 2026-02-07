import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentSalonId } from '@/lib/auth';

const BUCKET = 'salon-assets';

/**
 * POST /api/settings/upload-logo
 * Accepts multipart/form-data with a "file" field
 * Uploads to Supabase Storage and updates salons.logo_url
 */
export async function POST(request: NextRequest) {
  let salonId: string;
  try {
    salonId = await getCurrentSalonId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'png';
  const path = `${salonId}/logo_${Date.now()}.${ext}`;

  // Try uploading
  let uploadError = null;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    // Try creating bucket first
    await supabase.storage.createBucket(BUCKET, { public: true });
    const { error: retryError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    uploadError = retryError;
  }

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = urlData?.publicUrl ?? null;

  if (!publicUrl) {
    return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 });
  }

  // Update salon logo_url
  const { error: updateError } = await supabase
    .from('salons')
    .update({ logo_url: publicUrl })
    .eq('id', salonId);

  if (updateError) {
    console.error('[SETTINGS] Logo URL update error:', updateError.message);
  }

  return NextResponse.json({ success: true, url: publicUrl });
}
