
const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    name: 'Normal Editor'
  }
}

export default [
  // user login
  {
    url: '/lego/admin/login',
    type: 'post',
    response: config => {
      const { username } = config.body
      const token = tokens[username]

      if (!token) {
        return {
          code: 60204,
          message: '账号或者密码错误'
        }
      }
      

      return {
        code: 20000,
        data: token
      }
    }
  },

  {
    url: '/lego/admin/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      if (!info) {
        return {
          code: 50008,
          message: '登录失败，无法查询用户信息'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // 登出
  {
    url: '/lego/admin/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
