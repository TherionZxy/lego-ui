import Mock from 'mockjs'

const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    name: '@cname',
    phone: /^1[385][1-9]\d{8}/,
    content: '@string("lower", 5, 20)',
    code: /\d{6}/,
    status: /[0-1]/,
    createTime: +Mock.Random.date('T')
  }))
}

export default [
  {
    url: '/order/list',
    type: 'get',
    response: config => {
      const { name, phone, code, status, startTime, endTime, page = 1, limit = 20, sort } = config.query
      let mockList = List.filter(item => {
        if (name && item.name !== name) return false
        if (phone && item.phone !== phone) return false
        if (code && item.code !== code) return false
        if (status != 'all' && item.status !== status) return false
        if (startTime && startTime != '' && new Date(startTime) > item.createTime) return false
        if (endTime && endTime != '' && new Date(endTime) < item.createTime) return false
        return true
      })

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/order/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const order of List) {
        if (order.id === +id) {
          return {
            code: 20000,
            data: order
          }
        }
      }
    }
  },

  {
    url: '/order/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  
  
]
