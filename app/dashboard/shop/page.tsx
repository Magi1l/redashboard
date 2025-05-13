"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ShopItemCard from "@/components/ShopItemCard";

interface ShopItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock?: number;
}

interface Purchase {
  _id: string;
  item: ShopItem;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

export default function ShopPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showPurchases, setShowPurchases] = useState(false);
  const [previewBg, setPreviewBg] = useState<string|null>(null);
  const [showModal, setShowModal] = useState(false);
  const purchasedItemIds = purchases.map(p => p.item._id);
  const [points, setPoints] = useState<number|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [category, setCategory] = useState<string>("background");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("price-asc");
  const [buying, setBuying] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseSort, setPurchaseSort] = useState<string>("date-desc");
  const [purchasePage, setPurchasePage] = useState(1);
  const PURCHASES_PER_PAGE = 5;

  useEffect(() => {
    if (!session?.user) return;
    const discordId = (session.user as { id?: string }).id;
    if (!discordId) return;
    fetch(`/api/profile/points?discordId=${discordId}`)
      .then(res => res.json())
      .then(data => setPoints(data.points ?? 0));
  }, [session]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/shop/items?category=${category}&search=${search}&sort=${sort}`)
      .then((res) => res.json())
      .then((data) => { setItems(data.items); setLoading(false); })
      .catch(e => { setError("상점 데이터를 불러오지 못했습니다."); setLoading(false); });
  }, [category, search, sort]);

  useEffect(() => {
    if (!session?.user) return;
    const discordId = (session.user as { id?: string }).id;
    if (!discordId) return;
    fetch(`/api/shop/purchases?discordId=${discordId}`)
      .then(res => res.json())
      .then(data => setPurchases(data.purchases || []));
  }, [session]);

  // 아이템 목록 갱신 함수
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/shop/items?category=${category}&search=${search}&sort=${sort}`);
      const data = await res.json();
      setItems(data.items);
    } catch (e) {
      setError("상점 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 포인트 갱신 함수
  const fetchPoints = async () => {
    if (!session?.user) return;
    const discordId = (session.user as { id?: string }).id;
    if (!discordId) return;
    const res = await fetch(`/api/profile/points?discordId=${discordId}`);
    const data = await res.json();
    setPoints(data.points ?? 0);
  };

  // 구매내역 갱신 함수
  const fetchPurchases = async () => {
    if (!session?.user) return;
    const discordId = (session.user as { id?: string }).id;
    if (!discordId) return;
    const res = await fetch(`/api/shop/purchases?discordId=${discordId}`);
    const data = await res.json();
    setPurchases(data.purchases || []);
  };

  // 구매 핸들러
  const handleBuy = async (itemId: string) => {
    if (!session?.user) return;
    setBuying(itemId);
    setToast(null);
    try {
      const discordId = (session.user as { id?: string }).id;
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordId, itemId }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: "구매 성공!" });
        await fetchItems();
        await fetchPoints();
        await fetchPurchases();
      } else {
        setToast({ type: "error", message: data.error || "구매 실패" });
      }
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "구매 처리 중 오류" });
    } finally {
      setBuying(null);
    }
  };

  // 프로필 배경 적용 함수
  async function handleApply(item: ShopItem) {
    if (!session?.user) return alert("로그인 필요");
    const discordId = (session.user as { id?: string }).id;
    const res = await fetch("/api/profile/background", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordId, bgUrl: item.image }),
    });
    const data = await res.json();
    if (data.success) {
      alert("프로필 배경이 적용되었습니다!");
    } else {
      alert(data.error || "적용 실패");
    }
  }

  // 상품 목록에서 type: 'background'만 필터링
  const backgroundItems = items.filter(item => (item as any).type === 'background');

  // 구매내역 필터/정렬/검색 적용
  const filteredPurchases = purchases
    .filter(p => p.item.name.toLowerCase().includes(purchaseSearch.toLowerCase()))
    .sort((a, b) => {
      if (purchaseSort === "date-desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (purchaseSort === "date-asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (purchaseSort === "price-desc") return b.totalPrice - a.totalPrice;
      if (purchaseSort === "price-asc") return a.totalPrice - b.totalPrice;
      return 0;
    });
  const totalPages = Math.ceil(filteredPurchases.length / PURCHASES_PER_PAGE);
  const pagedPurchases = filteredPurchases.slice((purchasePage-1)*PURCHASES_PER_PAGE, purchasePage*PURCHASES_PER_PAGE);

  return (
    <section className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">상점</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="font-semibold">내 포인트: {points !== null ? `${points}P` : "-"}</div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded px-2 py-1">
          <option value="background">배경</option>
          <option value="theme">테마</option>
          {/* 확장 가능 */}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색" className="border rounded px-2 py-1" />
        <select value={sort} onChange={e => setSort(e.target.value)} className="border rounded px-2 py-1">
          <option value="price-asc">가격↑</option>
          <option value="price-desc">가격↓</option>
          <option value="name-asc">이름↑</option>
          <option value="name-desc">이름↓</option>
        </select>
      </div>
      <div className="mb-4 flex gap-2">
        <button className={`btn ${!showPurchases ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setShowPurchases(false)}>상점</button>
        <button className={`btn ${showPurchases ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setShowPurchases(true)}>내 구매내역</button>
      </div>
      {loading ? (
        <div className="text-center py-10">로딩 중...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : !showPurchases ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {backgroundItems.map((item) => (
            <ShopItemCard
              key={item._id}
              item={item}
              points={points}
              purchased={purchasedItemIds.includes(item._id)}
              onPreview={() => { setPreviewBg(item.image!); setShowModal(true); }}
              onBuy={() => handleBuy(item._id)}
              onApply={() => handleApply(item)}
              buying={buying === item._id}
            />
          ))}
        </div>
      ) : (
        <div>
          <h3 className="font-bold mb-2">구매내역</h3>
          <div className="flex gap-2 mb-2">
            <input value={purchaseSearch} onChange={e => { setPurchaseSearch(e.target.value); setPurchasePage(1); }} placeholder="아이템명 검색" className="border rounded px-2 py-1" />
            <select value={purchaseSort} onChange={e => { setPurchaseSort(e.target.value); setPurchasePage(1); }} className="border rounded px-2 py-1">
              <option value="date-desc">구매일↓</option>
              <option value="date-asc">구매일↑</option>
              <option value="price-desc">가격↓</option>
              <option value="price-asc">가격↑</option>
            </select>
          </div>
          {pagedPurchases.length === 0 ? (
            <div className="text-gray-500">구매내역이 없습니다. 원하는 아이템을 상점에서 구매해보세요!</div>
          ) : (
            <ul className="space-y-2">
              {pagedPurchases.map((p) => (
                <li key={p._id} className="border rounded p-3 flex items-center gap-3">
                  {p.item.image && (
                    <Image src={p.item.image} alt={p.item.name} width={48} height={48} className="rounded object-cover cursor-pointer" onClick={() => { setPreviewBg(p.item.image!); setShowModal(true); }} />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{p.item.name}</div>
                    <div className="text-xs text-gray-500">수량: {p.quantity} / 총액: {p.totalPrice}P</div>
                    <div className="text-xs text-gray-400">구매일: {new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                  <button className="btn bg-blue-600 text-white" onClick={() => handleApply(p.item)}>적용</button>
                  <button className="btn bg-yellow-500 text-white" onClick={() => { setPreviewBg(p.item.image!); setShowModal(true); }}>미리보기</button>
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center mt-4">
              <button className="btn px-2" disabled={purchasePage === 1} onClick={() => setPurchasePage(purchasePage-1)}>이전</button>
              <span>{purchasePage} / {totalPages}</span>
              <button className="btn px-2" disabled={purchasePage === totalPages} onClick={() => setPurchasePage(purchasePage+1)}>다음</button>
            </div>
          )}
        </div>
      )}
      {/* 배경 미리보기 모달 */}
      {showModal && previewBg && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 relative max-w-md w-full flex flex-col items-center">
            <div className="mb-4 font-bold">배경 미리보기</div>
            <div className="w-64 h-40 rounded overflow-hidden mb-4 border">
              <img src={previewBg} alt="배경 미리보기" className="object-cover w-full h-full" />
            </div>
            <button className="btn bg-gray-500 text-white" onClick={() => setShowModal(false)}>닫기</button>
          </div>
        </div>
      )}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.message}
        </div>
      )}
    </section>
  );
} 