export async function uploadToSupabase(file: File, folder = 'store-uploads'): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dmtpmnqwbxaqtrktycid.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_OvUyxok5w4i1WsTWVBR62A_I8SnNIAj';

  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(rawExt) ? rawExt : 'jpg';
  const randomName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${safeExt}`;
  const filePath = `${folder}/${randomName}`;

  const response = await fetch(`${supabaseUrl}/storage/v1/object/products/${filePath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'x-upsert': 'true',
      'Content-Type': file.type || `image/${safeExt}`,
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Yükleme başarısız (${response.status}): ${errorText}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/products/${filePath}`;
}
