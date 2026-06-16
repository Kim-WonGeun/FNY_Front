import type { Dispatch, SetStateAction } from 'react';
import { fetchAgentHealth } from '../api/analysis';
import type { AgentHealth } from '../types';

type UseAgentHealthLoaderOptions = {
  setAgentHealth: Dispatch<SetStateAction<AgentHealth | null>>;
};

export function useAgentHealthLoader({ setAgentHealth }: UseAgentHealthLoaderOptions) {
  async function loadAgentHealth() {
    try {
      const data = await fetchAgentHealth();
      setAgentHealth(data);
    } catch {
      setAgentHealth(null);
    }
  }

  return { loadAgentHealth };
}
