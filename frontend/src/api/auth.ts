import client from './client'
import type { AuthUser, LoginPayload, RegisterPayload } from '../types'

export const authApi = {
  register: (data: RegisterPayload) =>
    client.post<AuthUser>('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    client.post<AuthUser>('/auth/login', data).then((r) => r.data),
}
