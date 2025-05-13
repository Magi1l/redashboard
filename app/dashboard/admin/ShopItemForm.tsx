"use client";
import React from "react";
import { useState } from "react";

interface ShopItemFormProps {
  onSave: (item: any) => void;
  initial?: any;
}

export default function ShopItemForm({ onSave, initial }: ShopItemFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price || 0);
  const [image, setImage] = useState(initial?.image || "");
  const [stock, setStock] = useState(initial?.stock || 0);
  const [type, setType] = useState(initial?.type || "background");

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={e => {
        e.preventDefault();
        onSave({ name, description, price, image, stock, type });
      }}
    >
      <input className="input" placeholder="이름" value={name} onChange={e => setName(e.target.value)} required />
      <input className="input" placeholder="설명" value={description} onChange={e => setDescription(e.target.value)} />
      <input className="input" type="number" placeholder="가격" value={price} onChange={e => setPrice(Number(e.target.value))} required />
      <input className="input" placeholder="이미지 URL" value={image} onChange={e => setImage(e.target.value)} />
      <input className="input" type="number" placeholder="재고" value={stock} onChange={e => setStock(Number(e.target.value))} />
      <select className="input" value={type} onChange={e => setType(e.target.value)} required>
        <option value="background">배경</option>
        <option value="avatar">아바타</option>
        <option value="other">기타</option>
      </select>
      <button className="btn mt-2" type="submit">저장</button>
    </form>
  );
} 