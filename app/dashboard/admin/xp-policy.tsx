import React, { useEffect, useState } from "react";

interface XpPolicyState {
  textChannelMultipliers: Record<string, number>;
  voiceXpEnabled: boolean;
  voiceXpPerMinute: number;
  requireMicOn: boolean;
}

export default function XpPolicyManager({ guildId }: { guildId: string }) {
  const [policy, setPolicy] = useState<XpPolicyState | null>(null);
  const [loading, setLoading] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [multiplier, setMultiplier] = useState(1);

  useEffect(() => {
    if (!guildId) return;
    setLoading(true);
    fetch(`/api/admin/xp-policy?guildId=${guildId}`)
      .then(res => res.json())
      .then(data => setPolicy(data.policy || {
        textChannelMultipliers: {},
        voiceXpEnabled: true,
        voiceXpPerMinute: 5,
        requireMicOn: true,
      }))
      .finally(() => setLoading(false));
  }, [guildId]);

  const savePolicy = async () => {
    setLoading(true);
    await fetch("/api/admin/xp-policy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId, ...policy }),
    });
    setLoading(false);
    alert("저장됨");
  };

  return (
    <section>
      <h3 className="font-bold mb-2">XP 지급 정책</h3>
      {loading ? <div>불러오는 중...</div> : (
        <>
          <div className="mb-2">
            <label>음성 채널 XP 지급: </label>
            <input
              type="checkbox"
              checked={policy?.voiceXpEnabled ?? true}
              onChange={e => setPolicy((p) => p ? { ...p, voiceXpEnabled: e.target.checked } : null)}
            />
            <label className="ml-2">마이크 ON일 때만 지급</label>
            <input
              type="checkbox"
              checked={policy?.requireMicOn ?? true}
              onChange={e => setPolicy((p) => p ? { ...p, requireMicOn: e.target.checked } : null)}
            />
            <label className="ml-2">분당 XP</label>
            <input
              type="number"
              value={policy?.voiceXpPerMinute ?? 5}
              min={0}
              onChange={e => setPolicy((p) => p ? { ...p, voiceXpPerMinute: Number(e.target.value) } : null)}
              className="w-16 ml-1"
            />
          </div>
          <div>
            <label>텍스트 채널별 XP 배율</label>
            <ul>
              {policy?.textChannelMultipliers && Object.entries(policy.textChannelMultipliers).map(([cid, mul]) => (
                <li key={cid}>
                  {cid}: {mul}배
                  <button onClick={() => {
                    if (!policy) return;
                    const copy = { ...policy.textChannelMultipliers };
                    delete copy[cid];
                    setPolicy({ ...policy, textChannelMultipliers: copy });
                  }}>삭제</button>
                </li>
              ))}
            </ul>
            <input
              placeholder="채널ID"
              value={channelId}
              onChange={e => setChannelId(e.target.value)}
              className="border px-1 mx-1"
            />
            <input
              type="number"
              value={multiplier}
              min={0}
              step={0.1}
              onChange={e => setMultiplier(Number(e.target.value))}
              className="w-16 mx-1"
            />
            <button onClick={() => {
              if (!channelId || !policy) return;
              setPolicy({
                ...policy,
                textChannelMultipliers: { ...policy.textChannelMultipliers, [channelId]: multiplier }
              });
              setChannelId("");
              setMultiplier(1);
            }}>추가/수정</button>
          </div>
          <button className="btn bg-blue-600 text-white" onClick={savePolicy}>저장</button>
        </>
      )}
    </section>
  );
} 