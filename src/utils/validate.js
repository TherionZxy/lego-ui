/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function validUsername(str) {
  return str.trim().length >= 0
}

export function validatePassword(str) {
  return str.trim().length >= 0
}

export function validPhoneNumber(rule, value, callback) {
  const reg = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/
  if (value == '' || value == undefined || value == null) {
    callback()
  } else {
    if ((!reg.test(value)) && value != '') {
      callback(new Error('请输入正确的电话号码或者固话号码'))
    } else {
      callback()
    }
  }
}
