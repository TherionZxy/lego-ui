import request from '@/utils/request'

export function fetchList(query) {
  const { page, limit, fruitname, status } = query
  const status2 = status
  const status1 = -1
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
  const status2 = status
  const status1 = -1
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/fruit/list',
    method: 'get',
    params: {
      fruitname, status1, status2
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

export function updateFlashSale(data) {
  const { id, discount, maxnum, startTime, endTime } = data
  return request({
    url: '/api/admin/fruit/updateFlash',
    method: 'post',
    data: {
      "fruitId": id,
      "discountPrice": discount,
      "maxNum": maxnum,
      "startTime": startTime,
      "endTime": endTime
    }
  })
}

export function stopFlashSale(data) {
  const { id } = data
  return request({
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    url: '/api/admin/fruit/stopFlash',
    method: 'post',
    params: {
      "fruitId": id
    }
  })
}
