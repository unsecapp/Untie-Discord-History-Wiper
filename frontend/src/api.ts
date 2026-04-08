import axios from 'axios';

const TOKEN_KEY = 'untie_token';

export const saveToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token);
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: '/api',
  timeout: 300000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

export interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  member_count: number;
  owner_id: string;
}

export interface Recipient {
  id: string;
  username: string;
  discriminator?: string;
  avatar: string | null;
}

export interface DM {
  id: string;
  type: 'dm';
  recipient: Recipient | null;
}

export interface GroupChat {
  id: string;
  type: 'group';
  name: string;
  icon: string | null;
  recipient_count: number;
  recipients: Recipient[];
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  channel_id: string;
  channel_name: string;
  attachments: string[];
  embeds: number;
}

export interface DeleteResult {
  deleted: number;
  failed: number;
  error?: string;
}

export const connect = (token: string) => {
  saveToken(token);
  return api.post<{ message: string; user: User }>('/connect', { token });
};

export const disconnect = () => {
  clearToken();
  return api.post('/disconnect');
};

export const getStatus = () =>
  api.get<{ connected: boolean; user?: User }>('/status');

export const getGuilds = () =>
  api.get<Guild[]>('/guilds');

export const getDMs = () =>
  api.get<DM[]>('/dms');

export const getGroupChats = () =>
  api.get<GroupChat[]>('/groupchats');

export interface GuildActivityResult {
  messages: Message[];
  total: number;
}

export const getGuildActivity = (guildId: string) =>
  api.get<GuildActivityResult>(`/guild/${guildId}/activity`);

export const getChannelActivity = (channelId: string, limit = 500) =>
  api.get<Message[]>(`/channel/${channelId}/activity`, { params: { limit } });

export const deleteGuildMessages = (guildId: string) =>
  api.post<DeleteResult>(`/guild/${guildId}/delete`);

export const deleteChannelMessages = (channelId: string, messageIds?: string[]) =>
  api.post<DeleteResult>(`/channel/${channelId}/delete`, messageIds ? { message_ids: messageIds } : {});

export const leaveGuild = (guildId: string) =>
  api.post(`/guild/${guildId}/leave`);
