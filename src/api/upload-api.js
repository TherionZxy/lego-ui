import request from '@/utils/request'

/**
 * 获取普通上传凭证
 * @param {Object} filename
 */
export function getUploadAuth() {
  return request({
    url: 'api/qiniu/auth',
    method: 'get'
  })
}

/**
 * 获取覆盖上传凭证
 * @param {Object} filename
 */
export function getUploadAuthToCover(filename) {
  return request({
    url: 'api/qiniu/auth/cover',
    method: 'get',
    params: { filename }
  })
}

/**
 * fusion.qiniuapi.com/v2/tune/refresh 刷新缓存
 * 注：这里要使用自己的token
 */
export function refreshUploadFile(filename) {
  return request({
    url: 'api/qiniu/refresh',
    method: 'get',
    params: {filename}
  })
}
