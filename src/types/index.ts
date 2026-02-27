export interface PageData<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

// ============ 用户类型 ============
export interface SysUser {
  userId: string
  userName: string
  email: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  deleted: number
}

// ============ 请求 DTO 类型 ============
export interface LoginRequest {
  username: string
  password: string
}

export interface CreateUserRequest {
  username: string
  password: string
  email: string
}

export interface UpdateUserRequest {
  email: string
}

export interface UserQueryParams {
  page?: number
  size?: number
  username?: string
}

export interface DeleteUsersRequest {
  ids: string[]
}

// ============ API 类型 ============
/**
 * API 响应头接口
 */
export interface ApiHeaders {
  'new_access_token'?: string
  [key: string]: string | undefined
}

// ============ 路由元信息类型 ============
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
  }
}
