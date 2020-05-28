import request from '@/utils/request'

export function fetchList(query) {
  const { page, limit, fruitname, status } = query
  return request({
    url: '/api/fruit/list/' + page + '/' + limit,
    method: 'post',
    data: {
      "fruitName": fruitname,
      "isSale": status,
      "isFlashSale": -1
    }
  })
}

export function fetchListToExport(query) {
  const { fruitname, status } = query
  return request({
    url: '/api/fruit/list',
    method: 'post',
    data: {
      "fruitName": fruitname,
      "isSale": status,
      "isFlashSale": -1
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
  const { id, fruitname, price, detail, display, intro } = data
  console.log(display)
  return request({
    url: '/api/admin/fruit/update',
    method: 'post',
    data: {
      "fruitId": id,
      "fruitName": fruitname,
      "normPrice": price,
      "fruitIntro": detail,
      "display": display,
      "intro": intro
    }
  })
}

export function createFruit(data) {
  const { fruitname, price, detail, display, intro } = data
  return request({
    url: '/api/admin/fruit/add',
    method: 'post',
    data: {
      "fruitName": fruitname,
      "normPrice": price,
      "fruitIntro": detail,
      "display": display,
      "intro": intro
    }
  })
}

export function changeFruitStatus(data) {
  return request({
    url: '/api/admin/fruit/update',
    method: 'post',
    data
  })
}

export function changeIsFlashSaleStatus(data) {
  const { id } = data
  return request({
    url: '/api/admin/fruit/update',
    method: 'post',
    data: {
      "fruitId": id,
      "isFlashSale": 1
    }
  })
}

export function deleteFruit(data) {
  const { id } = data
  return request({
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    url: '/api/admin/fruit/remove',
    method: 'post',
    params: { 'fruitId': id }
  })
}
