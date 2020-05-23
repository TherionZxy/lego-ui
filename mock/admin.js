import Mock from 'mockjs'

const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    username: '@cname',
    password: '@first',
    phone: /^1[385][1-9]\d{8}/,
    pageviews: '@integer(300, 5000)',
    platforms: ['a-platform']
  }))
}

export default [
  {
    url: '/admin/list',
    type: 'get',
    response: config => {
      const { username, password, phone, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (username && item.username !== username) return false
        if (phone && item.phone !== phone) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

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
    url: '/admin/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const admin of List) {
        if (admin.id === +id) {
          return {
            code: 20000,
            data: admin
          }
        }
      }
    }
  },

  {
    url: '/admin/pv',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: {
          pvData: [
            { key: 'PC', pv: 1024 },
            { key: 'mobile', pv: 1024 },
            { key: 'ios', pv: 1024 },
            { key: 'android', pv: 1024 }
          ]
        }
      }
    }
  },

  {
    url: '/admin/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/admin/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
