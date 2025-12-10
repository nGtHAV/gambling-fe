const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface TokenPair {
  access: string;
  refresh: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(tokens: TokenPair) {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      // Try to refresh token
      const refreshResponse = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        this.setTokens({ access: data.access, refresh: this.refreshToken });
        headers['Authorization'] = `Bearer ${data.access}`;
        
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
        
        if (!retryResponse.ok) {
          throw new Error(await retryResponse.text());
        }
        return retryResponse.json();
      } else {
        this.clearTokens();
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(username: string, email: string, password: string) {
    const data = await this.request<{
      tokens: TokenPair;
      user: { id: number; username: string; email: string };
      profile: UserProfile;
    }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, password_confirm: password }),
    });
    this.setTokens(data.tokens);
    return data;
  }

  async login(username: string, password: string) {
    const data = await this.request<TokenPair>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setTokens(data);
    return data;
  }

  logout() {
    this.clearTokens();
  }

  // Profile
  async getProfile() {
    return this.request<UserProfile>('/profile/');
  }

  async getGameHistory() {
    return this.request<GameHistory[]>('/history/');
  }

  // Coin requests
  async requestCoins(amount: number = 1000, reason: string = '') {
    return this.request<CoinRequest>('/coins/request/', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  async getMyCoinRequests() {
    return this.request<CoinRequest[]>('/coins/my-requests/');
  }

  // Admin
  async getPendingRequests() {
    return this.request<CoinRequest[]>('/admin/pending-requests/');
  }

  async approveRequest(requestId: number) {
    return this.request<CoinRequest>(`/admin/approve/${requestId}/`, {
      method: 'POST',
    });
  }

  async denyRequest(requestId: number) {
    return this.request<CoinRequest>(`/admin/deny/${requestId}/`, {
      method: 'POST',
    });
  }

  // Games
  async playBlackjack(action: string, bet: number, gameState?: object) {
    return this.request<BlackjackResult>('/games/blackjack/', {
      method: 'POST',
      body: JSON.stringify({ action, bet, game_state: gameState }),
    });
  }

  async playPoker(action: string, bet: number, holdIndices?: number[], gameState?: object) {
    return this.request<PokerResult>('/games/poker/', {
      method: 'POST',
      body: JSON.stringify({ action, bet, hold_indices: holdIndices, game_state: gameState }),
    });
  }

  async playRoulette(betType: string, betValue: string | number, bet: number) {
    return this.request<RouletteResult>('/games/roulette/', {
      method: 'POST',
      body: JSON.stringify({ bet_type: betType, bet_value: betValue, bet }),
    });
  }

  async playDice(betType: string, betValue: string | number, bet: number) {
    return this.request<DiceResult>('/games/dice/', {
      method: 'POST',
      body: JSON.stringify({ bet_type: betType, bet_value: betValue, bet }),
    });
  }

  async playMinesweeper(action: string, bet: number, options?: {
    gridSize?: number;
    numMines?: number;
    tileIndex?: number;
    gameState?: object;
  }) {
    return this.request<MinesweeperResult>('/games/minesweeper/', {
      method: 'POST',
      body: JSON.stringify({
        action,
        bet,
        grid_size: options?.gridSize,
        num_mines: options?.numMines,
        tile_index: options?.tileIndex,
        game_state: options?.gameState,
      }),
    });
  }

  // Education
  async getEducation() {
    return this.request<EducationContent>('/education/');
  }
}

// Types
export interface UserProfile {
  user: {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
  };
  coins: number;
  total_wagered: number;
  total_won: number;
  total_lost: number;
  games_played: number;
  is_bankrupt: boolean;
  created_at: string;
}

export interface GameHistory {
  id: number;
  game_type: string;
  bet_amount: number;
  won: boolean;
  payout: number;
  details: object;
  created_at: string;
}

export interface CoinRequest {
  id: number;
  user: { id: number; username: string; email: string };
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  reviewed_by: { id: number; username: string } | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
}

export interface BlackjackResult {
  status: 'playing' | 'win' | 'lose' | 'bust' | 'blackjack' | 'push';
  player_hand: Card[];
  dealer_hand: Card[];
  player_value: number;
  dealer_value?: number;
  dealer_visible?: number;
  payout?: number;
  message: string;
  coins?: number;
  is_bankrupt?: boolean;
}

export interface PokerResult {
  hand: Card[];
  hand_type?: string;
  status: 'playing' | 'win' | 'lose';
  multiplier?: number;
  payout?: number;
  message: string;
  coins?: number;
  is_bankrupt?: boolean;
}

export interface RouletteResult {
  result: number | string;
  color: 'red' | 'black' | 'green';
  won: boolean;
  payout: number;
  bet_type: string;
  bet_value: string | number;
  message: string;
  coins: number;
  is_bankrupt: boolean;
}

export interface DiceResult {
  die1: number;
  die2: number;
  total: number;
  won: boolean;
  payout: number;
  bet_type: string;
  bet_value: string | number;
  message: string;
  coins: number;
  is_bankrupt: boolean;
}

export interface MinesweeperResult {
  grid_size: number;
  num_mines: number;
  total_tiles: number;
  mine_positions: number[];
  revealed: number[];
  multiplier: number;
  status: 'playing' | 'win' | 'lose' | 'cashout';
  payout?: number;
  hit_mine?: number;
  message: string;
  coins?: number;
  is_bankrupt?: boolean;
}

export interface EducationContent {
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
  math_breakdown: Record<string, {
    base_house_edge: string;
    our_house_edge: string;
    expected_loss_per_100_bets: string;
  }>;
}

export const api = new ApiClient();
