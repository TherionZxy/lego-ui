import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/fruit/flashsale/list',
    method: 'get',
    params: query
  })
}

export function fetchOrder(id) {
  return request({
    url: '/fruit/flashsale/detail',
    method: 'get',
    params: { id }
  })
}

export function updateOrder(data) {
  return request({
    url: '/fruit/flashsale/update',
    method: 'post',
    data
  })
}
