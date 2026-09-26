import { getLocalEatsApiBaseUrl } from '../config/runtimeConfig';
import { getAdminAuth } from './adminAuth';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ApprovalAction = 'approve' | 'reject' | 'suspend' | 'reinstate';
export type ApprovalStatusFilter = ApprovalStatus | 'all';
export type RiderVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AdminRider {
  id: string;
  full_name: string | null;
  phone: string | null;
  vehicle_type: string | null;
  verification_status: RiderVerificationStatus;
  is_online: boolean;
  status: string;
}

export interface AdminRiderListOptions {
  verification_status?: RiderVerificationStatus;
  limit?: number;
  offset?: number;
}

export interface AdminRiderListResult {
  riders: AdminRider[];
  pagination: AdminShopPagination;
}

export interface AdminIdentity {
  uid: string;
  email: string | null;
  role: 'super_admin';
}

export interface AdminShopSummary {
  id: string;
  owner_id: string | null;
  name: string;
  category: string | null;
  phone: string | null;
  location: string | null;
  logo_url: string | null;
  approval_status: ApprovalStatus;
  approval_reason: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminShop extends AdminShopSummary {
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_time: string | null;
  closing_time: string | null;
  story: string | null;
  archived_at: string | null;
}

export interface AdminShopListOptions {
  approval_status?: ApprovalStatusFilter;
  limit?: number;
  offset?: number;
}

export interface AdminShopPagination {
  limit: number;
  offset: number;
  returned: number;
}

export interface AdminShopListResult {
  shops: AdminShopSummary[];
  pagination: AdminShopPagination;
}

export interface ShopApprovalTransition {
  action: ApprovalAction;
  expected_status: ApprovalStatus;
  reason?: string;
}

interface AdminMeResponse {
  success: true;
  admin: AdminIdentity;
}

interface AdminShopListResponse {
  success: true;
  shops: AdminShopSummary[];
  pagination: AdminShopPagination;
}

interface AdminShopResponse {
  success: true;
  shop: AdminShop;
}

interface AdminRiderListResponse {
  success: true;
  riders: AdminRider[];
  pagination: AdminShopPagination;
}

interface AdminRiderResponse {
  success: true;
  rider: AdminRider;
}

interface ApiErrorPayload {
  success?: false;
  code?: string;
  error?: string;
  message?: string;
}

export class AdminApiError extends Error {
  readonly status: number | null;
  readonly code: string | null;

  constructor(message: string, status: number | null, options?: ErrorOptions, code: string | null = null) {
    super(message, options);
    this.name = 'AdminApiError';
    this.status = status;
    this.code = code;
  }
}

const readJsonBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getErrorMessage = (payload: unknown, response: Response): string => {
  if (payload && typeof payload === 'object') {
    const errorPayload = payload as ApiErrorPayload;
    const serverMessage = errorPayload.error ?? errorPayload.message;

    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage.trim();
    }
  }

  return response.statusText || `LocalEats Admin API request failed with status ${response.status}.`;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const currentUser = getAdminAuth().currentUser;

  if (!currentUser) {
    throw new AdminApiError('Firebase sign-in is required.', 401);
  }

  const idToken = await currentUser.getIdToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer fb-${idToken}`);

  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;

  try {
    response = await fetch(`${getLocalEatsApiBaseUrl()}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });
  } catch (error) {
    throw new AdminApiError('Unable to reach the LocalEats Admin API.', null, {
      cause: error,
    });
  }

  const payload = await readJsonBody(response);

  if (!response.ok) {
    const code = payload && typeof payload === 'object' && 'code' in payload &&
      typeof payload.code === 'string' ? payload.code : null;
    throw new AdminApiError(getErrorMessage(payload, response), response.status, undefined, code);
  }

  if (payload === null) {
    throw new AdminApiError('The LocalEats Admin API returned an invalid response.', response.status);
  }

  return payload as T;
};

export const adminApi = {
  async getMe(): Promise<AdminIdentity> {
    const response = await request<AdminMeResponse>('/api/v1/admin/me');
    return response.admin;
  },

  async listShops(options: AdminShopListOptions = {}): Promise<AdminShopListResult> {
    const searchParams = new URLSearchParams();

    if (options.approval_status !== undefined) {
      searchParams.set('approval_status', options.approval_status);
    }
    if (options.limit !== undefined) {
      searchParams.set('limit', String(options.limit));
    }
    if (options.offset !== undefined) {
      searchParams.set('offset', String(options.offset));
    }

    const query = searchParams.toString();
    const response = await request<AdminShopListResponse>(
      `/api/v1/admin/shops${query ? `?${query}` : ''}`,
    );

    return {
      shops: response.shops,
      pagination: response.pagination,
    };
  },

  async getShop(shopId: string): Promise<AdminShop> {
    const normalizedShopId = shopId.trim();

    if (!normalizedShopId) {
      throw new AdminApiError('Shop id is required.', 400);
    }

    const response = await request<AdminShopResponse>(
      `/api/v1/admin/shops/${encodeURIComponent(normalizedShopId)}`,
    );
    return response.shop;
  },

  async transitionShopApproval(
    shopId: string,
    transition: ShopApprovalTransition,
  ): Promise<AdminShop> {
    const normalizedShopId = shopId.trim();

    if (!normalizedShopId) {
      throw new AdminApiError('Shop id is required.', 400);
    }

    const response = await request<AdminShopResponse>(
      `/api/v1/admin/shops/${encodeURIComponent(normalizedShopId)}/approval`,
      {
        method: 'POST',
        body: JSON.stringify(transition),
      },
    );
    return response.shop;
  },

  async listRiders(options: AdminRiderListOptions = {}): Promise<AdminRiderListResult> {
    const searchParams = new URLSearchParams();
    if (options.verification_status !== undefined) {
      searchParams.set('verification_status', options.verification_status);
    }
    if (options.limit !== undefined) searchParams.set('limit', String(options.limit));
    if (options.offset !== undefined) searchParams.set('offset', String(options.offset));
    const query = searchParams.toString();
    const response = await request<AdminRiderListResponse>(
      `/api/v1/admin/riders${query ? `?${query}` : ''}`,
    );
    return { riders: response.riders, pagination: response.pagination };
  },

  async getRider(riderId: string): Promise<AdminRider> {
    const normalizedRiderId = riderId.trim();
    if (!normalizedRiderId) throw new AdminApiError('Rider id is required.', 400);
    const response = await request<AdminRiderResponse>(
      `/api/v1/admin/riders/${encodeURIComponent(normalizedRiderId)}`,
    );
    return response.rider;
  },

  async updateRiderVerification(
    riderId: string,
    verification_status: RiderVerificationStatus,
  ): Promise<AdminRider> {
    const normalizedRiderId = riderId.trim();
    if (!normalizedRiderId) throw new AdminApiError('Rider id is required.', 400);
    const response = await request<AdminRiderResponse>(
      `/api/v1/admin/riders/${encodeURIComponent(normalizedRiderId)}/verification`,
      { method: 'PATCH', body: JSON.stringify({ verification_status }) },
    );
    return response.rider;
  },
};
