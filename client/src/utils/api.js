/**
 * API client to communicate with the Node.js Express backend
 */

const BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Server error: ${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  async getProfile() {
    return handleResponse(await fetch(`${BASE_URL}/profile`));
  },

  async updateSettings(settings) {
    return handleResponse(
      await fetch(`${BASE_URL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
    );
  },

  async getProgress() {
    return handleResponse(await fetch(`${BASE_URL}/progress`));
  },

  async getStats() {
    return handleResponse(await fetch(`${BASE_URL}/stats`));
  },

  async getHistory(limit = 20) {
    return handleResponse(await fetch(`${BASE_URL}/history?limit=${limit}`));
  },

  async getLeaderboard(limit = 10) {
    return handleResponse(await fetch(`${BASE_URL}/leaderboard?limit=${limit}`));
  },

  async startGame(levelNumber, mode = 'campaign') {
    return handleResponse(
      await fetch(`${BASE_URL}/games/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelNumber, mode })
      })
    );
  },

  async completeGame(payload) {
    return handleResponse(
      await fetch(`${BASE_URL}/games/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    );
  },

  async resetAll() {
    return handleResponse(
      await fetch(`${BASE_URL}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      })
    );
  }
};
