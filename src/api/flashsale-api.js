import request from '@/utils/request'

export function fetchList(query) {
  const { page, limit, fruitname, status } = query
  return request({
    url: '/api/fruit/list/' + page + '/' + limit,
    method: 'post',
    data: {
      "fruitname":fruitname,
      "isSale": -1,
      "isFlashSale": 1
    }
  })
}

export function fetchListToExport(query) {
  const { fruitname, status } = query
  return request({
    url: '/api/fruit/list',
    method: 'post',
    data: {
      "fruitname": fruitname,
      "isSale": -1,
      "isFlashSale": 1
    }
  })
}

export function fetchFlashSale(id) {
  return request({
    url: '/api/admin/fruit/info',
    method: 'get',
    params: { id }
  })
}

export function removeFlashSale(data) {
  const { id } = data
  return request({
    url: '/api/admin/fruit/removeFlash',
    method: 'post',
    params: {
      "fruitId": id
    }
  })
}

export function updateFlashSale(data) {
  const { id, discount, maxnum, startTime, endTime } = data
  return request({
    url: '/api/admin/fruit/updateFlash',
    method: 'post',
    data: {
      'fruitId': id,
      'discountPrice': discount,
      'maxNum': maxnum,
      'startTime': startTime,
      'endTime': endTime
    }
  })
}

export function stopFlashSale(data) {
  const { id } = data
  return request({
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    url: '/api/admin/fruit/stopFlash',
    method: 'post',
    params: {
      'fruitId': id
    }
  })
}
