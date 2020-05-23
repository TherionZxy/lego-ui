import request from '@/utils/request'

export function fetchList(query) {
  const { page, limit, fruitname, status } = query
  const status1 = status
  const status2 = -1
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/fruit/list/' + page + '/' + limit,
    method: 'get',
    params: {
      fruitname, status1, status2
    }
  })
}

export function fetchListToExport(query) {
  const { fruitname, status } = query
  const status1 = status
  const status2 = -1
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/fruit/list',
    method: 'get',
    params: {
      fruitname, status1, status2
    }
  })
}

export function fetchFruit(id) {
  return request({
    url: '/api/fruit/detail',
    method: 'get',
    params: { id }
  })
}

export function updateFruit(data) {
  return request({
    url: '/api/fruit/update',
    method: 'post',
    data
  })
}

export function changeFruitStatus(data) {
  return request({
    url: '/api/admin/fruit/update',
    method: 'post',
    data
  })
}

export function deleteFruit(data) {
  const { id } = data
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/admin/fruit/remove',
    method: 'post',
    params: { "fruitId" : id }
  })
}
