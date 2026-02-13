import request from './index'
import type { LoginRequest } from '@/types'

export function login(data: LoginRequest): Promise<string> {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function logout(): Promise<string> {
  return request({
    url: '/logout',
    method: 'delete'
  })
}
