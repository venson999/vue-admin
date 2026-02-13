import { defineStore } from 'pinia'
import type { SysUser } from '@/types'
import * as authApi from '@/api/auth'

interface UserState {
  token: string | null
  userInfo: SysUser | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token'),
    userInfo: null
  }),

  getters: {
    isLogin: (state) => !!state.token,
    userId: (state) => state.userInfo?.userId
  },

  actions: {
    async login(username: string, password: string): Promise<boolean> {
      try {
        const token = await authApi.login({ username, password })
        this.token = token
        localStorage.setItem('token', token)
        return true
      } catch {
        return false
      }
    },

    async logout(): Promise<void> {
      try {
        await authApi.logout()
      } finally {
        this.token = null
        this.userInfo = null
        localStorage.removeItem('token')
      }
    },

    setUserInfo(userInfo: SysUser): void {
      this.userInfo = userInfo
    }
  }
})
