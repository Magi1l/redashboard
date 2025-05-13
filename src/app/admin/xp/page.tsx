"use client";
import { useEffect, useState } from "react";

interface Server {
  id: string;
  name: string;
}
interface Channel {
  channelId: string;
  name: string;
  type: string;
}
interface Role {
  id: string;
  name: string;
}
interface ChannelXPSetting {
  channelId: string;
  type: string;
  multiplier: number;
  enabled: boolean;
}
interface VoiceXPSetting {
  multiplier: number;
  requireMic: boolean;
}
interface ActivityXPSetting {
  message: number;
  voice: number;
}
interface ActivityXPPolicyItem {
  enabled: boolean;
  minXP: number;
  maxXP: number;
  multiplier: number;
  cooldownSec: number;
  requireMic?: boolean;
  dailyCap?: number;
}
interface ActivityXPPolicy {
  message: ActivityXPPolicyItem;
  voice: ActivityXPPolicyItem;
  reaction: ActivityXPPolicyItem;
  command: ActivityXPPolicyItem;
}

// Toast 컴포넌트 분리
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      onClick={onClose}
      role="alert"
      style={{ cursor: 'pointer' }}
    >
      {message}
    </div>
  );
}

// XP 정책 입력 섹션 분리
function XPPolicySection({
  policyKey,
  label,
  policy,
  setPolicy,
  extra
}: {
  policyKey: keyof ActivityXPPolicy;
  label: string;
  policy: ActivityXPPolicyItem;
  setPolicy: (key: keyof ActivityXPPolicy, value: Partial<ActivityXPPolicyItem>) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="border rounded p-4 mb-4 bg-gray-50">
      <h3 className="font-semibold mb-2">{label}</h3>
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={policy.enabled} onChange={e => setPolicy(policyKey, { enabled: e.target.checked })} />활성화
        </label>
        <label>최소 XP
          <input type="number" min={0} value={policy.minXP} onChange={e => setPolicy(policyKey, { minXP: Number(e.target.value) })} className="border p-1 rounded w-20 ml-2" />
        </label>
        <label>최대 XP
          <input type="number" min={0} value={policy.maxXP} onChange={e => setPolicy(policyKey, { maxXP: Number(e.target.value) })} className="border p-1 rounded w-20 ml-2" />
        </label>
        <label>배율
          <input type="number" step={0.1} min={0.1} value={policy.multiplier} onChange={e => setPolicy(policyKey, { multiplier: Number(e.target.value) })} className="border p-1 rounded w-20 ml-2" />
        </label>
        <label>쿨타임(초)
          <input type="number" min={0} value={policy.cooldownSec} onChange={e => setPolicy(policyKey, { cooldownSec: Number(e.target.value) })} className="border p-1 rounded w-20 ml-2" />
        </label>
        {extra}
      </div>
    </div>
  );
}

export default function AdminXPPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [baseXP, setBaseXP] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [channelXPSettings, setChannelXPSettings] = useState<ChannelXPSetting[]>([]);
  const [voiceXPSettings, setVoiceXPSettings] = useState<VoiceXPSetting>({ multiplier: 1.0, requireMic: false });
  const [activityXPSettings, setActivityXPSettings] = useState<ActivityXPSetting>({ message: 1.0, voice: 1.0 });
  const [activityXPPolicy, setActivityXPPolicy] = useState<ActivityXPPolicy>({
    message: { enabled: true, minXP: 1, maxXP: 100, multiplier: 1.0, cooldownSec: 60 },
    voice: { enabled: true, minXP: 1, maxXP: 100, multiplier: 1.0, cooldownSec: 60, requireMic: false },
    reaction: { enabled: true, minXP: 1, maxXP: 100, multiplier: 1.0, cooldownSec: 60 },
    command: { enabled: true, minXP: 1, maxXP: 100, multiplier: 1.0, cooldownSec: 60 },
  });
  const [loading, setLoading] = useState(false);
  const [baseXPError, setBaseXPError] = useState("");
  const [multiplierError, setMultiplierError] = useState("");
  const [channelErrors, setChannelErrors] = useState<{ [key: string]: string }>({});
  const [activityError, setActivityError] = useState<{ message?: string; voice?: string }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [roleRewards, setRoleRewards] = useState<{ level: number; roleId: string }[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleRewardErrors, setRoleRewardErrors] = useState<string[]>([]);

  // 서버 목록 불러오기
  useEffect(() => {
    fetch("/api/servers")
      .then((res) => res.json())
      .then((data) => setServers(data.servers || []));
  }, []);

  // 역할 목록 불러오기 (서버 선택 시)
  useEffect(() => {
    if (!selectedServer) return setRoles([]);
    fetch(`/api/admin/roles?guildId=${selectedServer}`)
      .then((res) => res.json())
      .then((data) => setRoles(data.roles || []));
  }, [selectedServer]);

  // 기존 설정 불러오기 (서버 선택 시)
  useEffect(() => {
    if (!selectedServer) return;
    setLoading(true);
    fetch(`/api/admin/xp?guildId=${selectedServer}`)
      .then((res) => res.json())
      .then((data) => {
        setBaseXP(data.baseXP ?? 10);
        setMultiplier(data.multiplier ?? 1.0);
        setChannelXPSettings(data.channelXPSettings ?? []);
        setVoiceXPSettings(data.voiceXPSettings ?? { multiplier: 1.0, requireMic: false });
        setActivityXPSettings(data.activityXPSettings ?? { message: 1.0, voice: 1.0 });
        setRoleRewards(data.roleRewards ?? []);
        setActivityXPPolicy((prev) => data.activityXPPolicy ?? prev);
      })
      .finally(() => setLoading(false));
  }, [selectedServer]);

  // 채널 목록 불러오기 (서버 선택 시)
  useEffect(() => {
    if (!selectedServer) return setChannels([]);
    setLoading(true);
    fetch(`/api/admin/channels?guildId=${selectedServer}`)
      .then((res) => res.json())
      .then((data) => setChannels(data.channels || []))
      .finally(() => setLoading(false));
  }, [selectedServer]);

  // 입력값 유효성 검사
  useEffect(() => {
    setBaseXPError(baseXP <= 0 ? "0보다 커야 합니다" : "");
  }, [baseXP]);
  useEffect(() => {
    setMultiplierError(multiplier <= 0 ? "0보다 커야 합니다" : "");
  }, [multiplier]);
  useEffect(() => {
    // 채널별 multiplier 검사
    const errs: { [key: string]: string } = {};
    channelXPSettings.forEach((c: ChannelXPSetting) => {
      if (c.multiplier <= 0) errs[c.channelId] = "0보다 커야 합니다";
    });
    setChannelErrors(errs);
  }, [channelXPSettings]);
  useEffect(() => {
    setActivityError({
      message: activityXPSettings.message <= 0 ? "0보다 커야 합니다" : undefined,
      voice: activityXPSettings.voice <= 0 ? "0보다 커야 합니다" : undefined,
    });
  }, [activityXPSettings]);

  // 레벨별 역할 보상 유효성 검사
  useEffect(() => {
    setRoleRewardErrors(roleRewards.map((r) => {
      if (!r.roleId) return "역할을 선택하세요";
      if (!r.level || r.level < 1) return "레벨은 1 이상이어야 합니다";
      return "";
    }));
  }, [roleRewards]);

  // 채널별 설정 핸들러
  const handleChannelSetting = (channelId: string, field: keyof ChannelXPSetting, value: string | number | boolean) => {
    setChannelXPSettings((prev) => {
      const idx = prev.findIndex((c: ChannelXPSetting) => c.channelId === channelId);
      if (idx === -1) {
        // 새로 추가
        const ch = channels.find((c: Channel) => c.channelId === channelId);
        return [
          ...prev,
          { channelId, type: ch?.type || "text", multiplier: 1.0, enabled: true, [field]: value },
        ];
      } else {
        // 수정
        const updated = [...prev];
        updated[idx] = { ...updated[idx], [field]: value };
        return updated;
      }
    });
  };

  // 레벨별 역할 보상 행 추가/삭제/수정
  const addRoleReward = () => setRoleRewards([...roleRewards, { level: 1, roleId: "" }]);
  const removeRoleReward = (idx: number) => setRoleRewards(roleRewards.filter((_, i) => i !== idx));
  const updateRoleReward = (idx: number, field: "level" | "roleId", value: string | number) => {
    setRoleRewards((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  // 저장
  const handleSave = async () => {
    if (!selectedServer) {
      setToast({ message: "서버를 먼저 선택하세요.", type: 'error' });
      return;
    }
    if (
      baseXP <= 0 || multiplier <= 0 ||
      Object.values(channelErrors).length > 0 ||
      activityXPSettings.message <= 0 || activityXPSettings.voice <= 0 ||
      roleRewardErrors.some((e) => !!e)
    ) {
      setToast({ message: "입력값을 확인하세요.", type: 'error' });
      return;
    }
    setLoading(true);
    setToast(null);
    const res = await fetch("/api/admin/xp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guildId: selectedServer,
        baseXP,
        multiplier,
        channelXPSettings,
        voiceXPSettings,
        activityXPSettings,
        activityXPPolicy,
        roleRewards,
      }),
    });
    if (res.ok) setToast({ message: "저장 완료!", type: 'success' });
    else setToast({ message: "저장 실패", type: 'error' });
    setLoading(false);
  };

  return (
    <div>
      <Toast message={toast?.message || ""} type={toast?.type || 'success'} onClose={() => setToast(null)} />
      <h1 className="text-2xl font-bold mb-4">XP 설정</h1>
      {/* 서버 선택 */}
      <div className="mb-6">
        <label className="block mb-1 font-semibold">서버 선택</label>
        <select
          value={selectedServer}
          onChange={(e) => setSelectedServer(e.target.value)}
          className="border p-2 rounded w-64"
          disabled={loading}
        >
          <option value="">서버를 선택하세요</option>
          {servers.map((s: Server) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {/* 기본 XP, XP 배수 */}
      <div className="mb-4">
        <label className="block mb-1">기본 XP</label>
        <input
          type="number"
          value={baseXP}
          min={0.1}
          step={0.1}
          onChange={(e) => setBaseXP(Number(e.target.value))}
          className="border p-2 rounded w-32"
          disabled={loading}
        />
        {baseXPError && <span className="text-red-500 ml-2 text-sm">{baseXPError}</span>}
      </div>
      <div className="mb-8">
        <label className="block mb-1">XP 배수</label>
        <input
          type="number"
          step={0.1}
          min={0.1}
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value))}
          className="border p-2 rounded w-32"
          disabled={loading}
        />
        {multiplierError && <span className="text-red-500 ml-2 text-sm">{multiplierError}</span>}
      </div>
      {/* 채널별 XP 설정 */}
      <div className="mb-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">채널별 XP 설정</h2>
        {channels.length === 0 ? (
          <div className="text-gray-500">채널 목록이 없습니다. 서버를 선택하세요.</div>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">채널명</th>
                <th className="p-2">타입</th>
                <th className="p-2">XP 활성화</th>
                <th className="p-2">배율</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch: Channel) => {
                const setting = channelXPSettings.find((c: ChannelXPSetting) => c.channelId === ch.channelId) || { enabled: true, multiplier: 1.0 };
                return (
                  <tr key={ch.channelId} className="border-t">
                    <td className="p-2">{ch.name}</td>
                    <td className="p-2">{ch.type === "voice" ? "음성" : "텍스트"}</td>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={(e) => handleChannelSetting(ch.channelId, "enabled", e.target.checked)}
                        className="accent-blue-600 w-5 h-5"
                        disabled={loading}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step={0.1}
                        min={0.1}
                        value={setting.multiplier}
                        onChange={(e) => handleChannelSetting(ch.channelId, "multiplier", Number(e.target.value))}
                        className="border p-1 rounded w-20"
                        disabled={loading}
                      />
                      {channelErrors[ch.channelId] && <span className="text-red-500 ml-2 text-xs">{channelErrors[ch.channelId]}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {/* 음성채팅/마이크 옵션 */}
      <div className="mb-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">음성채팅 XP/마이크 옵션</h2>
        <div className="flex items-center gap-6 mb-2">
          <label className="block">음성채팅 XP 배율
            <input
              type="number"
              step={0.1}
              min={0.1}
              value={voiceXPSettings.multiplier}
              onChange={(e) => setVoiceXPSettings((v) => ({ ...v, multiplier: Number(e.target.value) }))}
              className="border p-1 rounded w-20 ml-2"
              disabled={loading}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={voiceXPSettings.requireMic}
              onChange={(e) => setVoiceXPSettings((v) => ({ ...v, requireMic: e.target.checked }))}
              className="accent-blue-600 w-5 h-5"
              disabled={loading}
            />
            마이크 켜야 XP 지급
          </label>
        </div>
      </div>
      {/* 활동별 XP 가중치 */}
      <div className="mb-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">활동별 XP 가중치</h2>
        <div className="flex items-center gap-8">
          <label className="block">메시지 XP 배율
            <input
              type="number"
              step={0.1}
              min={0.1}
              value={activityXPSettings.message}
              onChange={(e) => setActivityXPSettings((a) => ({ ...a, message: Number(e.target.value) }))}
              className="border p-1 rounded w-20 ml-2"
              disabled={loading}
            />
            {activityError.message && <span className="text-red-500 ml-2 text-xs">{activityError.message}</span>}
          </label>
          <label className="block">음성채팅 XP 배율
            <input
              type="number"
              step={0.1}
              min={0.1}
              value={activityXPSettings.voice}
              onChange={(e) => setActivityXPSettings((a) => ({ ...a, voice: Number(e.target.value) }))}
              className="border p-1 rounded w-20 ml-2"
              disabled={loading}
            />
            {activityError.voice && <span className="text-red-500 ml-2 text-xs">{activityError.voice}</span>}
          </label>
        </div>
      </div>
      {/* 레벨별 역할 보상 */}
      <div className="mb-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">레벨별 역할 보상</h2>
        <table className="w-full border text-sm mb-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">레벨</th>
              <th className="p-2">역할</th>
              <th className="p-2">삭제</th>
            </tr>
          </thead>
          <tbody>
            {roleRewards.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={r.level}
                    onChange={(e) => updateRoleReward(i, "level", Number(e.target.value))}
                    className="border p-1 rounded w-20"
                    disabled={loading}
                  />
                </td>
                <td className="p-2">
                  <select
                    value={r.roleId}
                    onChange={(e) => updateRoleReward(i, "roleId", e.target.value)}
                    className="border p-1 rounded w-40"
                    disabled={loading}
                  >
                    <option value="">역할 선택</option>
                    {roles.map((role: Role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => removeRoleReward(i)}
                    className="text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                    disabled={loading}
                  >삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roleRewardErrors.map((err, i) => err && <div key={i} className="text-red-500 text-xs mb-1">{i + 1}번째: {err}</div>)}
        <button
          type="button"
          onClick={addRoleReward}
          className="bg-gray-200 px-3 py-1 rounded text-sm mb-2"
          disabled={loading}
        >+ 보상 추가</button>
      </div>
      {XPPolicySection({
        policyKey: "message",
        label: "메시지 XP 정책",
        policy: activityXPPolicy.message,
        setPolicy: (key, value) => setActivityXPPolicy((p) => ({ ...p, [key]: { ...p[key], ...value } } as ActivityXPPolicy))
      })}
      {XPPolicySection({
        policyKey: "voice",
        label: "음성 XP 정책",
        policy: activityXPPolicy.voice,
        setPolicy: (key, value) => setActivityXPPolicy((p) => ({ ...p, [key]: { ...p[key], ...value } } as ActivityXPPolicy)),
        extra: (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={activityXPPolicy.voice?.requireMic} onChange={e => setActivityXPPolicy((p) => ({ ...p, voice: { ...p.voice, requireMic: e.target.checked } } as ActivityXPPolicy))} />마이크 필요
          </label>
        )
      })}
      {XPPolicySection({
        policyKey: "reaction",
        label: "리액션 XP 정책",
        policy: activityXPPolicy.reaction,
        setPolicy: (key, value) => setActivityXPPolicy((p) => ({ ...p, [key]: { ...p[key], ...value } } as ActivityXPPolicy))
      })}
      {XPPolicySection({
        policyKey: "command",
        label: "커맨드 XP 정책",
        policy: activityXPPolicy.command,
        setPolicy: (key, value) => setActivityXPPolicy((p) => ({ ...p, [key]: { ...p[key], ...value } } as ActivityXPPolicy))
      })}
      <button
        onClick={handleSave}
        disabled={loading || !!baseXPError || !!multiplierError || Object.values(channelErrors).length > 0 || !!activityError.message || !!activityError.voice || roleRewardErrors.some((e) => !!e)}
        className={`bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>}
        저장
      </button>
    </div>
  );
} 