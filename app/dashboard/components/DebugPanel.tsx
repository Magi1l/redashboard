"use client";
import React from "react";

export default function DebugPanel() {
  if (process.env.NODE_ENV !== "development") return null;
  // 클라이언트 환경에서만 렌더링
  if (typeof window === "undefined") return null;
  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      right: 16,
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 8,
      zIndex: 9999,
      fontSize: 14,
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
    }}>
      <div><b>DEBUG MODE</b></div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
      <div>Location: {typeof window !== "undefined" ? window.location.pathname : "-"}</div>
      <div>시간: {new Date().toLocaleTimeString()}</div>
    </div>
  );
} 