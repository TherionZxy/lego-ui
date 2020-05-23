import { login, logout, getInfo } from '@/api/login-api'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    // 从userInfo中取出输入的用户名、密码
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response

        // 登录成功后，将获取到的token存入store中
        commit('SET_TOKEN', data.token)
        // 一并存入Cookie中
        setToken(data.token)

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      // 登录后获取用户信息
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('验证失败，请重新登录')
        }

        const { adminName, authorities } = data

        data.roles = []

        authorities.forEach(item => {
          data.roles.push(item.authority)
        })

        if (!authorities || authorities.length <= 0) {
          reject('权限列表获取失败')
        }
        // 将用户名设置到store中
        commit('SET_NAME', adminName)
        commit('SET_ROLES', data.roles)

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 用户登出
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        // 首先移除Token
        removeToken()
        // 然后重置Router
        resetRouter()
        // 随后使用commit调用RESET_STATE重置store中保存的用户信息
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 移除Token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken()
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
