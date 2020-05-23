import request from '@/utils/request'
import qs from 'qs'

export function fetchList(query) {
  const { page, limit, username, phone, sort } = query
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/admin/list/' + page + '/' + limit,
    method: 'get',
    params: { username, phone, sort }
  })
}

export function fetchListToExport(query) {
  const { username, phone, sort } = query
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/admin/list',
    method: 'get',
    params: { username, phone, sort }
  })
}

export function fetchAdmin(id) {
  return request({
    url: '/api/admin/info',
    method: 'get',
    params: { id }
  })
}

export function createAdmin(data) {
  const { username, phone, password } = data
  return request({
    url: '/api/admin/create',
    method: 'post',
    data: {
      "adminName": username,
      "adminPhone": phone,
      "adminPwd": password
    }
  })
}

export function updateAdmin(data) {
  const { id, phone, password } = data
  return request({
    url: '/api/admin/update',
    method: 'post',
    data: {
      "adminId":id,
      "adminPhone":phone,
      "adminPwd":password
    }
  })
}

export function deleteAdmin(data) {
  const { id } = data
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/admin/remove',
    method: 'post',
    params: {"adminId": id}
  })
}
