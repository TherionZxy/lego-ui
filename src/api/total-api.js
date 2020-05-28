import request from '@/utils/request'

export function fetchTotalList(query) {
  const { page, limit, fruitname, time } = query
  console.log(fruitname)
  return request({
    url: '/api/total/list/' + page + '/' + limit,
    method: 'post',
    data: { "fruitName":fruitname, time }
  })
}

export function fetchTotalListToExport(query) {
  const { fruitname, time } = query
  return request({
    url: '/api/total/list',
    method: 'post',
    data: { "fruitName":fruitname, time }
  })
}

export function updateOrder(data) {
  return request({
    url: '/order/update',
    method: 'post',
    data
  })
}
