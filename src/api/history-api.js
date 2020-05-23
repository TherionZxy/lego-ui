import request from '@/utils/request'
import qs from 'qs'

export function fetchList(query) {
  const { page, limit, username, type } = query
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/admin/history/list/' + page + '/' + limit,
    method: 'get',
    params: { username, type }
  })
}
