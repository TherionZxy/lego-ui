import Mock from 'mockjs'

const List = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    fruitname: '@cname',
    price: '@float(5,10,2,2)',
    discount: '@float(1,5,2,2)',
    maxnum: /[1-5]/,
    startTime: +Mock.Random.date('T'),
    endTime: +Mock.Random.date('T'),
    status: /[0-1]/
  }))
}

export default [
  {
    url: '/fruit/flashsale/list',
    type: 'get',
    response: config => {
      const { fruitname, status, page = 1, limit = 20, sort } = config.query
      let mockList = List.filter(item => {
        if (fruitname && item.fruitname !== fruitname) return false
        if (status != 'all' && item.status !== status) return false
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
]
