import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/fruit/list',
    method: 'get',
    params: query
  })
}

export function fetchFruit(id) {
  return request({
    url: '/fruit/detail',
    method: 'get',
    params: { id }
  })
}

export function updateFruit(data) {
  return request({
    url: '/fruit/update',
    method: 'post',
    data
  })
}

export function changeFruitStatus(data) {
  return request({
    url: '/fruit/change',
    method: 'post',
    data
  })
}
