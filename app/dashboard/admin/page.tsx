"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import ShopItemForm from "./ShopItemForm";
import UserPointForm from "./UserPointForm";

interface ShopItem {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState("shop");
  const [items, setItems] = useState<ShopItem[]>([]);
  const [editItem, setEditItem] = useState<ShopItem | null>(null);
  const userPointFormRef = useRef<any>(null);
  const [showBackgroundOnly, setShowBackgroundOnly] = useState(false);
  const [purchaseTab, setPurchaseTab] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [purchaseFilters, setPurchaseFilters] = useState({ userId: '', itemId: '', from: '', to: '' });
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchItems = async () => {
    const res = await fetch("/api/admin/shop");
    const data = await res.json();
    setItems(data);
  };
  useEffect(() => { if (tab === "shop") fetchItems(); }, [tab]);

  const fetchPurchases = async () => {
    setPurchaseLoading(true);
    const params = new URLSearchParams();
    if (purchaseFilters.userId) params.append('userId', purchaseFilters.userId);
    if (purchaseFilters.itemId) params.append('itemId', purchaseFilters.itemId);
    if (purchaseFilters.from) params.append('from', purchaseFilters.from);
    if (purchaseFilters.to) params.append('to', purchaseFilters.to);
    const res = await fetch(`/api/admin/purchase?${params.toString()}`);
    const data = await res.json();
    setPurchases(data);
    setPurchaseLoading(false);
  };
  useEffect(() => { if (tab === "purchase") fetchPurchases(); }, [tab, purchaseFilters]);

  const fetchStats = async () => {
    setStatsLoading(true);
    const res = await fetch('/api/admin/purchase');
    const purchases = await res.json();
    // 유저별 누적 구매/포인트 랭킹
    const userMap: Record<string, number> = {};
    const itemMap: Record<string, { count: number; total: number }> = {};
    let totalAmount = 0;
    purchases.forEach((p: any) => {
      userMap[p.userId] = (userMap[p.userId] || 0) + p.quantity;
      itemMap[p.itemId] = itemMap[p.itemId] || { count: 0, total: 0 };
      itemMap[p.itemId].count += p.quantity;
      itemMap[p.itemId].total += p.quantity; // 가격 정보는 별도 fetch 필요
      totalAmount += p.quantity; // 가격 정보는 별도 fetch 필요
    });
    setStats({ userMap, itemMap, totalAmount });
    setStatsLoading(false);
  };
  useEffect(() => { if (tab === "stats") fetchStats(); }, [tab]);

  const handleSaveShopItem = async (item: any) => {
    if (editItem) {
      await fetch("/api/admin/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editItem, ...item }),
      });
      setEditItem(null);
    } else {
      await fetch("/api/admin/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
    fetchItems();
  };
  const handleDeleteShopItem = async (_id: string) => {
    await fetch("/api/admin/shop", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    fetchItems();
  };
  const handleEditShopItem = (item: ShopItem) => setEditItem(item);
  const handleSaveUserPoint = async (data: any) => {
    await fetch("/api/admin/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (userPointFormRef.current) {
      userPointFormRef.current.handleFetch();
    }
  };
  const handleDeletePurchase = async (_id: string) => {
    await fetch("/api/admin/purchase", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    fetchPurchases();
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-4">관리자 페이지</h2>
      <div className="flex gap-4 mb-6">
        <button className={tab === "shop" ? "btn-active" : "btn"} onClick={() => setTab("shop")}>상점 관리</button>
        <button className={tab === "user" ? "btn-active" : "btn"} onClick={() => setTab("user")}>유저 관리</button>
        <button className={tab === "purchase" ? "btn-active" : "btn"} onClick={() => setTab("purchase")}>구매 내역</button>
        <button className={tab === "stats" ? "btn-active" : "btn"} onClick={() => setTab("stats")}>통계/랭킹</button>
      </div>
      {tab === "shop" && (
        <section>
          <h3 className="font-bold mb-2">상점 아이템 관리</h3>
          <ShopItemForm onSave={handleSaveShopItem} initial={editItem || undefined} />
          <div className="mt-6">
            <div className="font-bold mb-2 flex items-center gap-2">
              아이템 목록
              <button className="btn text-xs" onClick={() => setShowBackgroundOnly(v => !v)}>
                {showBackgroundOnly ? "전체 보기" : "배경만 보기"}
              </button>
            </div>
            <ul className="space-y-2">
              {(showBackgroundOnly ? items.filter(i => (i as any).type === 'background') : items).map((item) => (
                <li key={item._id} className="flex items-center gap-2">
                  <span>{item.name} ({item.price}P, 재고:{item.stock}, 종류:{(item as any).type || '-'})</span>
                  <button className="btn" onClick={() => handleEditShopItem(item)}>수정</button>
                  <button className="btn" onClick={() => handleDeleteShopItem(item._id)}>삭제</button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {tab === "user" && (
        <section>
          <h3 className="font-bold mb-2">유저 포인트/레벨 관리</h3>
          <UserPointForm ref={userPointFormRef} onSave={handleSaveUserPoint} />
        </section>
      )}
      {tab === "purchase" && (
        <section>
          <h3 className="font-bold mb-2">구매 내역 조회</h3>
          <div className="flex gap-2 mb-2">
            <input className="input" placeholder="유저ID" value={purchaseFilters.userId} onChange={e => setPurchaseFilters(f => ({ ...f, userId: e.target.value }))} />
            <input className="input" placeholder="아이템ID" value={purchaseFilters.itemId} onChange={e => setPurchaseFilters(f => ({ ...f, itemId: e.target.value }))} />
            <input className="input" type="date" value={purchaseFilters.from} onChange={e => setPurchaseFilters(f => ({ ...f, from: e.target.value }))} />
            <input className="input" type="date" value={purchaseFilters.to} onChange={e => setPurchaseFilters(f => ({ ...f, to: e.target.value }))} />
            <button className="btn" onClick={fetchPurchases}>검색</button>
          </div>
          {purchaseLoading ? <div>로딩 중...</div> : (
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">유저ID</th>
                  <th className="p-2">아이템ID</th>
                  <th className="p-2">수량</th>
                  <th className="p-2">구매일</th>
                  <th className="p-2">삭제</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2">{p.userId}</td>
                    <td className="p-2">{p.itemId}</td>
                    <td className="p-2">{p.quantity}</td>
                    <td className="p-2">{new Date(p.purchasedAt).toLocaleString()}</td>
                    <td className="p-2">
                      <button className="btn text-xs" onClick={() => handleDeletePurchase(p._id)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {tab === "stats" && (
        <section>
          <h3 className="font-bold mb-2">포인트/구매 통계 및 랭킹</h3>
          {statsLoading ? <div>로딩 중...</div> : (
            <>
              <div className="mb-4">총 구매 건수: {stats.totalAmount || 0}</div>
              <div className="mb-4">
                <h4 className="font-semibold mb-1">유저별 누적 구매 랭킹</h4>
                <ol className="list-decimal ml-6">
                  {Object.entries(stats.userMap || {})
                    .sort((a: any, b: any) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([userId, count]: any, i) => (
                      <li key={userId}>{userId} - {count}건</li>
                    ))}
                </ol>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold mb-1">아이템별 판매량</h4>
                <ol className="list-decimal ml-6">
                  {Object.entries(stats.itemMap || {})
                    .sort((a: any, b: any) => b[1].count - a[1].count)
                    .slice(0, 10)
                    .map(([itemId, info]: any, i) => (
                      <li key={itemId}>{itemId} - {info.count}개</li>
                    ))}
                </ol>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
} 