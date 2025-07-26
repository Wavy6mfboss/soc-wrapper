import { useEffect, useState, useCallback } from 'react';

export interface AppConfig {
  model: string;
  freeRuns: number;
  isPaid: boolean;
}

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>({
    model: 'gpt-4o-mini',
    freeRuns: 5,
    isPaid: false,
  });

  const refresh = useCallback(() => {
    window.electron.ipcRenderer.invoke('get-config').then(setConfig);
  }, []);

  const update = useCallback((partial: Partial<AppConfig>) => {
    window.electron.ipcRenderer.invoke('set-config', partial);
  }, []);

  useEffect(() => {
    refresh();
    window.electron.ipcRenderer.on('config-updated', (_e, partial) => {
      setConfig((c) => ({ ...c, ...partial }));
    });
    window.electron.ipcRenderer.on('license-updated', (_e, data) => {
      if (data?.isPaid) setConfig((c) => ({ ...c, isPaid: true }));
    });
  }, [refresh]);

  return { config, refresh, update };
}
