import { put, del, list } from '@vercel/blob';

// 업로드 함수
export async function uploadToVercelBlob(file: File | Blob, path: string) {
  return await put(path, file, {
    access: 'public',
    token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
  });
}

// 다운로드 함수 (URL 반환)
export function getVercelBlobUrl(path: string) {
  return `https://blob.vercel-storage.com/${path}`;
}

// 삭제 함수
export async function deleteFromVercelBlob(path: string) {
  return await del(path, {
    token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
  });
}

// 파일 리스트 조회
export async function listVercelBlobs(prefix = '') {
  return await list({
    prefix,
    token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
  });
} 