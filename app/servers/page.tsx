"use client";
import { useEffect, useState } from "react";

export default function ServersPage() {
  const [servers, setServers] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/servers")
      .then((res) => res.json())
      .then((data) => setServers(data.servers || []));
  }, []);
  return (
    <div>
      <h1>서버 선택</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {servers.map((server) => (
          <div key={server.id} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
            <img src={server.icon ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png` : ""} width={64} height={64} alt="" />
            <div>{server.name}</div>
            {server.bot_in ? (
              <button>대시보드로 이동</button>
            ) : (
              <a href={`https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&scope=bot&permissions=8&guild_id=${server.id}`}>
                <button>봇 초대</button>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 