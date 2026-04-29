import axios from 'axios';
import type { Client, SocialAccount, Metrics, ContentPipeline, DashboardData } from '../types';

const api = axios.create({ baseURL: '/api' });

export const clientsApi = {
  list: () => api.get<Client[]>('/clients').then(r => r.data),
  get: (id: string) => api.get<Client>(`/clients/${id}`).then(r => r.data),
  create: (data: Partial<Client>) => api.post<Client>('/clients', data).then(r => r.data),
  update: (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/clients/${id}`).then(r => r.data),
};

export const accountsApi = {
  list: (params?: { client_id?: string; platform?: string }) => api.get<SocialAccount[]>('/accounts', { params }).then(r => r.data),
  create: (data: Partial<SocialAccount>) => api.post<SocialAccount>('/accounts', data).then(r => r.data),
  update: (id: string, data: Partial<SocialAccount>) => api.put<SocialAccount>(`/accounts/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/accounts/${id}`).then(r => r.data),
};

export const metricsApi = {
  list: (params?: { account_id?: string; client_id?: string; platform?: string; from?: string; to?: string; latest?: boolean }) =>
    api.get<Metrics[]>('/metrics', { params }).then(r => r.data),
  getLatest: (account_id: string) => api.get<Metrics | null>('/metrics', { params: { account_id, latest: true } }).then(r => r.data),
  create: (data: Partial<Metrics>) => api.post<Metrics>('/metrics', data).then(r => r.data),
  update: (id: string, data: Partial<Metrics>) => api.put<Metrics>(`/metrics/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/metrics/${id}`).then(r => r.data),
};

export const pipelineApi = {
  list: (params?: { client_id?: string; account_id?: string; platform?: string; status?: string; content_type?: string }) =>
    api.get<ContentPipeline[]>('/pipeline', { params }).then(r => r.data),
  create: (data: Partial<ContentPipeline>) => api.post<ContentPipeline>('/pipeline', data).then(r => r.data),
  update: (id: string, data: Partial<ContentPipeline>) => api.put<ContentPipeline>(`/pipeline/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/pipeline/${id}`).then(r => r.data),
};

export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard').then(r => r.data),
};
