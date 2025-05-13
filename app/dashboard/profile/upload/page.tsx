"use client";
import React, { useState } from "react";
import Cropper from "react-easy-crop";

export default function ProfileAvatarUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropping, setCropping] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setCroppedImage(null);
    setCropping(!!f);
  }

  async function getCroppedImg(imageSrc: string, crop: any) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    return canvas.toDataURL("image/jpeg");
  }

  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", error => reject(error));
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });
  }

  async function handleCropComplete(_: any, croppedAreaPixels: any) {
    setCroppedAreaPixels(croppedAreaPixels);
  }

  async function handleCropSave() {
    if (!preview || !croppedAreaPixels) return;
    const cropped = await getCroppedImg(preview, croppedAreaPixels);
    setCroppedImage(cropped);
    setCropping(false);
  }

  async function handleUpload() {
    if (!croppedImage) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // base64 -> Blob
      const res = await fetch(croppedImage);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");
      // TODO: 유저/서버 정보 추가
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("업로드 실패");
      const data = await uploadRes.json();
      setSuccess("업로드 성공!");
      // 업로드된 이미지 URL을 상태에 저장 (프로필 카드 연동용)
      if (data.url) setCroppedImage(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-md mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">🖼️ 아바타 업로드/크롭</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      {preview && cropping && (
        <div className="relative w-full h-64 bg-gray-100 mb-4">
          <Cropper
            image={preview}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
          <button className="btn bg-yellow-500 text-white mt-2" onClick={handleCropSave}>크롭 적용</button>
        </div>
      )}
      {croppedImage && (
        <div className="mb-4">
          <div className="mb-2">크롭된 미리보기:</div>
          <img src={croppedImage} alt="cropped" className="rounded-full w-32 h-32 object-cover mx-auto" />
        </div>
      )}
      <button className="btn bg-blue-600 text-white mb-4" onClick={handleUpload} disabled={loading || !croppedImage}>
        {loading ? "업로드 중..." : "업로드"}
      </button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <style jsx>{`
        .btn {
          @apply px-3 py-1 rounded font-semibold;
        }
      `}</style>
    </section>
  );
} 