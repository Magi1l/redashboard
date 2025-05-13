import React from "react";
import Image from "next/image";

interface ShopItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock?: number;
}

interface ShopItemCardProps {
  item: ShopItem;
  points: number|null;
  purchased: boolean;
  onPreview: () => void;
  onBuy: () => void;
  onApply: () => void;
  buying?: boolean;
}

const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, points, purchased, onPreview, onBuy, onApply, buying }) => {
  const canBuy = !purchased && (points !== null && points >= item.price);
  const buyDisabled = buying || !canBuy;
  const buyMsg = points !== null && points < item.price ? "포인트 부족" : "구매";

  return (
    <div className="border rounded p-4 flex flex-col items-center">
      {item.image && (
        <Image src={item.image} alt={item.name} width={80} height={80} className="rounded mb-2 object-cover cursor-pointer" onClick={onPreview} />
      )}
      <div className="font-bold text-lg mb-1">{item.name}</div>
      <div className="text-gray-600 mb-2">{item.description}</div>
      <div className="mb-2">가격: {item.price}P</div>
      <div className="mb-2">재고: {item.stock ?? '무제한'}</div>
      <div className="flex gap-2 w-full">
        <button className="btn bg-yellow-500 text-white flex-1" onClick={onPreview}>미리보기</button>
        {purchased ? (
          <button className="btn bg-blue-600 text-white flex-1" onClick={onApply}>적용</button>
        ) : (
          <button className="btn bg-green-600 text-white flex-1" onClick={onBuy} disabled={buyDisabled} title={buyDisabled ? buyMsg : undefined}>
            {buying ? "구매 중..." : (buyDisabled ? buyMsg : "구매")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ShopItemCard; 