"use client";
import { useState, forwardRef, useImperativeHandle } from "react";

interface UserPointFormProps {
  onSave: (data: any) => void;
  initial?: any;
}

const UserPointForm = forwardRef(function UserPointForm({ onSave, initial }: UserPointFormProps, ref) {
  const [discordId, setDiscordId] = useState(initial?.discordId || "");
  const [guildId, setGuildId] = useState(initial?.guildId || "");
  const [points, setPoints] = useState(initial?.points || 0);
  const [level, setLevel] = useState(initial?.level || 1);

  const handleFetch = async () => {
    if (!discordId || !guildId) return;
    const res = await fetch(`/api/profile?discordId=${discordId}&guildId=${guildId}`);
    const data = await res.json();
    setPoints(data.user?.points ?? 0);
    setLevel(data.level?.level ?? 1);
  };

  useImperativeHandle(ref, () => ({ handleFetch }));

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={e => {
        e.preventDefault();
        onSave({ discordId, guildId, points, level });
      }}
    >
      <div className="flex gap-2">
        <input className="input" placeholder="유저 ID" value={discordId} onChange={e => setDiscordId(e.target.value)} required />
        <input className="input" placeholder="서버 ID" value={guildId} onChange={e => setGuildId(e.target.value)} required />
        <button type="button" className="btn" onClick={handleFetch}>조회</button>
      </div>
      <input className="input" type="number" placeholder="포인트" value={points} onChange={e => setPoints(Number(e.target.value))} />
      <input className="input" type="number" placeholder="레벨" value={level} onChange={e => setLevel(Number(e.target.value))} />
      <button className="btn mt-2" type="submit">저장</button>
    </form>
  );
});

export default UserPointForm; 