import { uploadImageFromUri } from "@stos/mobile-shared";
import { db } from "./db";

export async function uploadAvatar(uri: string, userId: string) {
  const path = `${userId}/avatar.webp`;
  const url = await uploadImageFromUri(db, { bucket: "avatars", path, uri, contentType: "image/webp" });
  await db.from("residents").update({ avatar_url: url }).eq("user_id", userId);
  return url;
}

export async function uploadIncidentPhoto(uri: string, incidentId: string) {
  const path = `${incidentId}/${Date.now()}.webp`;
  return uploadImageFromUri(db, { bucket: "incident-attachments", path, uri, contentType: "image/webp" });
}
