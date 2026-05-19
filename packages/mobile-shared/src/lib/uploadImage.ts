export type UploadImageOptions = {
  bucket: string;
  path: string;
  uri: string;
  contentType?: string;
};

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      upload: (path: string, body: Blob, opts: { upsert: boolean; contentType: string }) => Promise<{ error: Error | null }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

/** Upload local file URI to Supabase Storage; returns public URL if bucket is public. */
export async function uploadImageFromUri(
  client: StorageClient,
  { bucket, path, uri, contentType = "image/jpeg" }: UploadImageOptions
): Promise<string> {
  const res = await fetch(uri);
  const blob = await res.blob();
  const { error } = await client.storage.from(bucket).upload(path, blob, {
    upsert: true,
    contentType,
  });
  if (error) throw error;
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
