<template>
  <div style="padding-top: 20px;">
    <el-row>
      <el-col :span="16">
        <el-row :gutter="15">
          <el-form ref="elForm" :model="form" :rules="rules" size="medium" label-width="100px">
            <el-col :span="24">
              <el-form-item label="水果名称" prop="fruitname">
                <el-input v-model="form.fruitname" placeholder="请输入水果名称" show-word-limit clearable
                  :style="{width: '100%'}"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="水果价格" prop="price">
                <el-input-number v-model="form.price" placeholder="请输入水果价格" :precision='2'></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="水果详情" prop="detail">
                <el-input v-model="form.detail" type="textarea" placeholder="请输入水果详情" show-word-limit
                  :autosize="{minRows: 5, maxRows: 5}" :style="{width: '100%'}"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <!-- 这里最后要加required -->
              <el-form-item label="展示图片" prop="display">
                <el-upload ref="display" :file-list="displayfileList" :action="displayAction" :auto-upload="false"
                  multiple :on-change="displayBeforeUpload" list-type="picture-card" accept="image/*"
                  name="display">
                  <i class="el-icon-plus"></i>
                  <div slot="tip" class="el-upload__tip">只能上传不超过 1MB 的图片文件</div>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <!-- 这里最后要加required -->
              <el-form-item label="详情图片" prop="intro">
                <el-upload ref="intro" :file-list="introfileList" :action="introAction" :auto-upload="false"
                  multiple :on-change="introBeforeUpload" list-type="picture-card" accept="image/*"
                  name="intro">
                  <i class="el-icon-plus"></i>
                  <div slot="tip" class="el-upload__tip">只能上传不超过 1MB 的图片文件</div>
                </el-upload>
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
      <el-col :span="8" style="height: 600px;position: fixed;right: 0px;">
        <div style="width: 80%;height: 100%;border: 1px dashed blue;margin-left: 10%;overflow-y: auto;">
          <div>{{form.fruitname}}</div>
          <div>{{form.price}}</div>
          <div>{{form.detail}}</div>
          <el-divider>展示图片</el-divider>
          <el-carousel height="200px" :interval="5000" arrow="always">
            <el-carousel-item v-for="item in displayUrl" :key="item">
              <el-image fit="fit" style="height: 200px;" :src="item"></el-image>
            </el-carousel-item>
          </el-carousel>
          <el-divider>详情图片</el-divider>
          <div>
            <el-image v-for="item in introUrl" :key="item" :src="item"></el-image>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { updateFruit } from '@/api/fruit-api'

export default {
  components: {},
  props: [],
  data() {
    return {
      form: {
        id: undefined,
        fruitname: '',
        price: 0,
        detail: undefined,
        display: null,
        intro: null,
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
        }],
      },
      // display图片上传地址
      displayAction: 'https://jsonplaceholder.typicode.com/posts/',
      displayfileList: [],
      // intro图片上传地址
      introAction: 'https://jsonplaceholder.typicode.com/posts/',
      introfileList: [],

      displayUrl: [],
      introUrl: []
    }
  },
  created() {
    // 接收点击修改传递过来的数据
    if (this.$route.query.id != undefined) {
      this.form = Object.assign({}, this.$route.query)
    }
  },
  mounted() {},
  methods: {
    submitForm() {
      this.$refs['elForm'].validate(valid => {
        if (!valid) return
        //目前只提交文本，图片由于使用图片服务器所以暂时搁置
        updateFruit(this.form).then(()=>{
          this.$notify({
            title: '成功',
            message: '编辑商品成功',
            type: 'success',
            duration: 2000
          })
          // 回到每日上新页面
          this.$router.push('/grounding/fruitlist')
        })
      })
    },
    resetForm() {
      this.$refs['elForm'].resetFields()
    },
    displayBeforeUpload(file) {
      let isAccept = new RegExp('image/*').test(file.raw.type)
      if (!isAccept) {
        this.$message.error('应该选择“图片”类型的文件')
      }
      let isRightSize = file.size / 1024 / 1024 < 1
      if (!isRightSize) {
        this.$message.error('文件大小超过 1MB')
      }

      if (isRightSize && isAccept) {
        this.displayUrl.push(file.url)
      }

      return isRightSize && isAccept

    },
    submitDisplayPicture() {
      this.$refs['display'].submit()
    },
    introBeforeUpload(file) {
      let isAccept = new RegExp('image/*').test(file.raw.type)
      if (!isAccept) {
        this.$message.error('应该选择“图片”类型的文件')
      }
      let isRightSize = file.size / 1024 / 1024 < 1
      if (!isRightSize) {
        this.$message.error('文件大小超过 1MB')
      }
      if (isRightSize && isAccept) {
        this.introUrl.push(file.url)
      }

      return isRightSize && isAccept
    },
    submitIntroPicture() {
      this.$refs['intro'].submit()
    },
  }
}

</script>
<style>
.el-upload__tip {
  line-height: 1.2;
}

</style>
