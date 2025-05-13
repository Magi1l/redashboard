import React, { useEffect, useState, useCallback } from 'react';

interface ConfigData {
  guildId: string;
  defaultXp: number;
  defaultLevel: number;
  defaultPoints: number;
  levelUpReward: number;
  notifyOnLevelUp: boolean;
}

const ConfigPage: React.FC = () => {
  const [guildId, setGuildId] = useState('');
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/config?guildId=${guildId}`);
      if (!res.ok) throw new Error("설정 불러오기 실패");
      const data = await res.json();
      setConfig(data.config);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [guildId]);

  useEffect(() => {
    setConfig(null);
    setSuccess(null);
    setError(null);
    if (guildId) fetchConfig();
  }, [guildId, fetchConfig]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default ConfigPage; 