<template>
  <div style="padding-top: 20px;">
    <el-row>
      <el-col :span="16">
        <el-row :gutter="15">
          <el-form ref="elForm" :model="form" :rules="rules" size="medium" label-width="100px">
            <el-col :span="24">
              <el-form-item label="水果名称" prop="fruitname">
                <el-input
                  :disabled="!isNew"
                  v-model="form.fruitname"
                  placeholder="请输入水果名称"
                  show-word-limit
                  clearable
                  :style="{width: '90%'}"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="水果价格" prop="price">
                <el-input-number v-model="form.price" :min="0" placeholder="请输入水果价格" :precision="2" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="水果详情" prop="detail">
                <el-input
                  v-model="form.detail"
                  type="textarea"
                  placeholder="请输入水果详情"
                  show-word-limit
                  :autosize="{minRows: 5, maxRows: 5}"
                  :style="{width: '90%'}"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <!-- 这里最后要加required -->
              <el-form-item label="展示图片" prop="display">
                <el-upload
                  ref="display"
                  :auto-upload="false"
                  :action="'javascript;'"
                  multiple
                  :show-text="false"
                  :on-change="displayBeforeUpload"
                  :on-remove="removeDisplayPicture"
                  :file-list="displayfileList"
                  list-type="picture-card"
                  accept="image/*"
                  name="display"
                >
                  <i class="el-icon-plus" />
                  <div slot="tip" class="el-upload__tip">只能上传不超过 1MB 的图片文件(上传之后若修改了水果名请重新上传图片)</div>
                </el-upload>
                <el-progress :style="{width: '90%'}" :percentage="displayPrograss"></el-progress>
                <el-button @click="submitDisplayPicture">上传展示图片</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <!-- 这里最后要加required -->
              <el-form-item label="详情图片" prop="intro">
                <el-upload
                  ref="intro"
                  :auto-upload="false"
                  :action="'javascript;'"
                  multiple
                  :show-text="false"
                  :on-change="introBeforeUpload"
                  :on-remove="removeIntroPicture"
                  :file-list="introfileList"
                  list-type="picture-card"
                  accept="image/*"
                  name="intro"
                >
                  <i class="el-icon-plus" />
                  <div slot="tip" class="el-upload__tip">只能上传不超过 1MB 的图片文件(上传之后若修改了水果名请重新上传图片)</div>
                </el-upload>
                <el-progress :style="{width: '90%'}" :percentage="introPrograss"></el-progress>
                <el-button @click="submitIntroPicture">上传详情图片</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="24" style="text-align: center;margin-top: 20px;">
              <el-form-item size="large">
                <el-button style="width: 200px;" type="primary" @click="submitForm">提交</el-button>
                <el-button style="width: 200px;" @click="resetForm">重置</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </el-col>
      <!-- 预览 -->
      <el-col :span="8" style="height: 600px;position: fixed;right: 0px;">
        <div style="width: 80%;height: 100%;border: 2px solid gray;border-radius: 2%;;margin-left: 10%;overflow-y: auto;background: rgba(255,255,255);">
          <div style="font-size: 20px;text-align: center;background: black;color: white;">*预览*<span style="font-size: 12px;float: right;">{{new Date() | parseTime}}</span></div>
          <div>水果名：{{ form.fruitname }}</div>
          <div>价格：{{ form.price }}</div>
          <div>详情：{{ form.detail }}</div>
          <el-divider>展示图片</el-divider>
          <el-carousel height="200px" :interval="5000" arrow="always">
            <el-carousel-item v-for="item in displayUrl" :key="item">
              <el-image fit="fit" style="height: 200px;" :src="item" />
            </el-carousel-item>
          </el-carousel>
          <el-divider>详情图片</el-divider>
          <div>
            <el-image v-for="item in introUrl" :key="item" :src="item" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { updateFruit, createFruit } from '@/api/fruit-api'
import { getUploadAuth, getUploadAuthToCover, refreshUploadFile } from '@/api/upload-api'
import * as qiniu from 'qiniu-js'
import { getRandomCode, parseTime } from '@/utils'

export default {
  components: {},
  props: [],
  filters:{
    parseTime
  },
  data() {
    return {
      form: {
        id: undefined,
        fruitname: '',
        price: 0,
        detail: undefined,
        display: 0,
        intro: 0
      },
      rules: {
        fruitname: [{
          required: true,
          message: '请输入水果名称',
          trigger: 'blur'
        }],
        price: [{
          required: true,
          message: '请输入水果价格',
          trigger: 'blur'
        }],
        detail: [{
          required: true,
          message: '请输入水果详情',
          trigger: 'blur'
        }]
      },
      displayfileList: [],
      introfileList: [],

      displayUrl: [],
      introUrl: [],

      displayPictureUploadOver: false,
      introPictureUploadOver: false,

      uploadToken: '',

      displayPrograss: 0,

      introPrograss: 0,

      isNew: true

    }
  },
  created() {
    // 接收点击修改传递过来的数据
    if (this.$route.query.id != undefined) {
      this.form = Object.assign({}, this.$route.query)
      this.isNew = false

      for(let i = 0; i < this.form.display; i++) {
        let displayUrl = 'http://qavqpe40f.bkt.clouddn.com/'+this.form.fruitname+'_display_'+(i+1)+'.jpg'
        this.displayUrl.push(displayUrl)
        this.displayfileList.push({url:displayUrl})
      }
      for(let j = 0; j < this.form.intro; j++) {
        let introUrl = 'http://qavqpe40f.bkt.clouddn.com/'+this.form.fruitname+'_intro_'+(j+1)+'.jpg'
        this.introUrl.push(introUrl)
        this.introfileList.push({url:introUrl})
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs['elForm'].validate(valid => {
        if (!valid) return
        if (this.isNew && this.displayPictureUploadOver == false) {
          this.$notify({
            title: '失败',
            message: '新增水果请至少上传一张展示图片',
            type: 'warning',
            duration: 2000
          })
          return
        }

        if (this.isNew && this.introPictureUploadOver == false) {
          this.$notify({
            title: '失败',
            message: '新增水果请至少上传一张详情图片',
            type: 'warning',
            duration: 2000
          })
          return
        }

        if (this.isNew) {
          createFruit(this.form).then(() => {
            this.$notify({
              title: '成功',
              message: '新增商品成功',
              type: 'success',
              duration: 2000
            })
            // 回到每日上新页面
            this.$router.push('/grounding/fruitlist')
          })
        } else {
          updateFruit(this.form).then(() => {
            this.$notify({
              title: '成功',
              message: '编辑商品成功',
              type: 'success',
              duration: 2000
            })
            // 回到每日上新页面
            this.$router.push('/grounding/fruitlist')
          })
        }
      })
    },
    resetForm() {
      this.$refs['elForm'].resetFields()
    },
    displayBeforeUpload(file) {
      // 检验是否是图片
      const isAccept = new RegExp('image/*').test(file.raw.type)
      if (!isAccept) {
        this.$message.error('应该选择“图片”类型的文件')
      }
      // 检验是否图片尺寸小于 1MB
      const isRightSize = file.size / 1024 / 1024 < 1
      if (!isRightSize) {
        this.$message.error('文件大小超过 1MB')
      }

      // 两者都成立时将图片加到displayUrl中待上传
      if (isRightSize && isAccept) {
        this.displayUrl.push(file.url)
        this.displayfileList.push(file)
      }

      return isRightSize && isAccept
    },
    removeDisplayPicture(c) {
      const index = this.displayUrl.findIndex(v => v === c.url)
      this.displayUrl.splice(index, 1)
      this.displayfileList.splice(index, 1)
      this.form.display = this.displayfileList.length
    },
    submitDisplayPicture() {
      if(this.displayUrl.length == 0) {
        this.$notify({
          title: '提示',
          message: '未选择图片',
          type: 'warning',
          duration: 2000
        })
      } else {
        this.displayPrograss = 0
        this.displayfileList.forEach((item, index) => {
          if(item.name != undefined) {
            let filename = this.form.fruitname + '_display_' + (index+1) + '.jpg'
            let percent = this.displayPrograss
            getUploadAuth().then(res => {
              var observer = qiniu.upload(item.raw, filename, res.data)
              observer.subscribe((res)=>{
                this.displayPrograss = parseInt(percent + res.total.percent)
              },(err)=>{
                // 遇到覆盖上传问题，进行覆盖上传
                if(err.code == 614) {
                  getUploadAuthToCover(filename).then(res => {
                    var observer = qiniu.upload(item.raw, filename, res.data)
                    observer.subscribe((res)=>{
                      this.displayPrograss = parseInt(percent + res.total.percent)
                    },(err)=>{

                    },(res)=>{
                      this.form.display = this.displayUrl.length
                      // 覆盖上传之后，需要向七牛云服务器发起刷新缓存请求
                      refreshUploadFile(filename).then(res=>{
                        this.displayPictureUploadOver = true
                      })
                    })
                  })
                } else {
                  this.$notify({
                    title: '失败',
                    message: '上传图片失败',
                    type: 'danger',
                    duration: 2000
                  })
                }
              },(res)=>{
                this.form.display = this.displayUrl.length
                this.displayPictureUploadOver = true
              })
            })
          }
        })
      }
    },
    introBeforeUpload(file) {
      const isAccept = new RegExp('image/*').test(file.raw.type)
      if (!isAccept) {
        this.$message.error('应该选择“图片”类型的文件')
      }
      const isRightSize = file.size / 1024 / 1024 < 1
      if (!isRightSize) {
        this.$message.error('文件大小超过 1MB')
      }
      if (isRightSize && isAccept) {
        this.introUrl.push(file.url)
        this.introfileList.push(file)
      }

      return isRightSize && isAccept
    },
    submitIntroPicture() {
      this.introPrograss = 0.0
      if(this.introUrl.length == 0) {
        this.$notify({
          title: '提示',
          message: '未选择图片',
          type: 'warning',
          duration: 2000
        })
      } else {
        this.introfileList.forEach((item, index) => {
          if (item.name != undefined) {
            let filename = this.form.fruitname + '_intro_' + (index+1) + '.jpg'
            let percent = this.introPrograss
            getUploadAuth().then(res => {
              var observer = qiniu.upload(item.raw, filename, res.data)

              observer.subscribe((res)=>{
                this.introPrograss = parseInt(percent + res.total.percent)
              },(err)=>{
                // 遇到覆盖上传问题，进行覆盖上传
                if(err.code == 614) {
                  getUploadAuthToCover(filename).then(res => {
                    var observer = qiniu.upload(item.raw, filename, res.data)
                    observer.subscribe((res)=>{
                      this.introPrograss = parseInt(percent + res.total.percent)
                    },(err)=>{

                    },(res)=>{
                      this.form.intro = this.introUrl.length
                      this.introPictureUploadOver = true
                    })
                  })
                } else {
                  this.$notify({
                    title: '失败',
                    message: '上传图片失败',
                    type: 'danger',
                    duration: 2000
                  })
                }
              },(res)=>{
                this.introPictureUploadOver = true
                this.form.intro = this.introUrl.length
              })
            })
          }
        })
      }
    },
    removeIntroPicture(c) {
      const index = this.displayUrl.findIndex(v => v === c.url)
      this.introUrl.splice(index, 1)
      this.introfileList.splice(index, 1)
    },
  }
}

</script>
<style>
.el-upload__tip {
  line-height: 1.2;
}

</style>
