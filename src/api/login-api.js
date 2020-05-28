import request from '@/utils/request'
import qs from 'qs'

// 登录api
export function login(data) {
  return request({
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    url: '/api/admin/login',
    method: 'post',
    data: qs.stringify(data)
  })
}

// 获取用户信息api
export function getInfo(token) {
  return request({
    url: '/api/admin/info',
    method: 'get',
    params: { token }
  })
}

// 登出api
export function logout() {
  return request({
    url: '/api/logout',
    method: 'post'
  })
}
