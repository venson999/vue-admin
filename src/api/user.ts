import request from './index'
import type {
  SysUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  PageData
} from '@/types'

export function getUserPage(params: UserQueryParams): Promise<PageData<SysUser>> {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

export function getUserById(id: string): Promise<SysUser> {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

export function createUser(data: CreateUserRequest): Promise<void> {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

export function updateUser(id: string, data: UpdateUserRequest): Promise<void> {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id: string): Promise<void> {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}
