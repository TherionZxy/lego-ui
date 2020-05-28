import request from '@/utils/request'

export function fetchList(query) {
  const { page, limit, name, phone, code, status, startTime, endTime } = query
  return request({
    url: '/api/order/list/' + page + '/' + limit,
    method: 'post',
    data: { name, phone, code, status, startTime, endTime }
  })
}

export function fetchOrder(id) {
  return request({
    url: '/order/detail',
    method: 'get',
    params: { id }
  })
}

export function orderNums() {
  return request({
    url: '/api/order/nums',
    method: 'get'
  })
}

export function orderComplete(data) {
  const { id } = data
  return request({
    url: '/api/admin/order/complete',
    method: 'post',
    params: {
      "orderId": id
    }
  })
}

export function fetchTotalList(query) {
  return request({
    url: '/order/total/list',
    method: 'get',
    params: query
  })
}
