<template>
  <div class="app-container" style="text-align: center;">
    <div class="filter-container">
      <!-- 页面上半部分的查询、导出数据模块 -->
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.phone" placeholder="手机号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves style="margin-left: 10px;" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>

      <el-button v-waves style="margin-left: 10px;" :loading="downloadLoading" class="filter-item" type="normal" icon="el-icon-download" @click="handleDownload">
        按条件导出
      </el-button>

      <el-button v-waves class="filter-item" style="margin-left: 10px;float: right;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增用户
      </el-button>
    </div>
    <br>

    <!-- 数据列表模块 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="密码" min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-if="row.status!='deleted'" :disabled="row.username == name" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 新增/修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" width="400px" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 100%; margin-left:50px;">
        <el-form-item label="用户名" prop="username" style="text-align: left;">
          <el-input v-model="temp.username" :disabled="lock" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="密码" prop="password" style="text-align: left;">
          <el-input v-model="temp.password" style="width: 200px;" :type="pwdType">
            <i slot="suffix" style="transform: scale(1.5) translateX(-10px);" class="el-icon-view" @click="showPwd()" />
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone" style="text-align: left;">
          <el-input v-model="temp.phone" style="width: 200px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 删除对话框 -->
    <el-dialog :title="'删除用户'" min-width="<300px></300px>" width="300px" :visible.sync="deleteDialogVisible">
      <span style="font-size: 16px;">确认删除用户 "{{ temp.username }}" ?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="deleteData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 导入所需的api
import { mapGetters } from 'vuex'
import { fetchList, fetchListToExport, createAdmin, updateAdmin, deleteAdmin } from '@/api/user-api'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { validPhoneNumber } from '@/utils/validate.js'
import { parseTime } from '@/utils/index'

export default {
  name: 'UserTable',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
  },
  data() {
    return {
      // 表格KEY值
      tableKey: 0,
      // 列表数据
      list: null,
      // 数据总数
      total: 0,
      listLoading: false,
      // 列表查询
      listQuery: {
        page: 1,
        limit: 20,
        username: '',
        phone: '',
        sort: '+id'
      },
      // 排序选项
      sortOptions: [{ label: 'ID 升序', key: '+id' }, { label: 'ID 降序', key: '-id' }],
      // 临时存储，用于新增/修改/删除时暂存数据
      temp: {
        id: undefined,
        username: '',
        phone: ''
      },
      // 新增 or 修改对话框
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改用户',
        create: '新增用户'
      },

      lock: true,
      // 删除 对话框
      deleteDialogVisible: false,
      rules: {
        username: [{ required: true, message: '用户名不能为空', tigger: 'blur' },
          { min: 2, message: '用户名至少为2位', tigger: 'blur' },
          { max: 10, message: '用户名不能超过10位', tigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', tigger: 'blur' },
          { min: 6, message: '密码至少为6位', tigger: 'blur' },
          { max: 8, message: '密码不能超过8位', tigger: 'blur' }],
        phone: [{ required: true, message: '手机号不能为空', tigger: 'blur' },
          { validator: validPhoneNumber, trigger: 'blur' }]
      },
      // 下载进度条
      downloadLoading: false,

      pwdType: 'password'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      fetchList(this.listQuery).then(response => {
        this.list = []
        response.data.adminList.forEach(item => {
          const temp = {
            id: item.adminId,
            username: item.adminName,
            phone: item.adminPhone,
            password: item.adminPwd
          }
          this.list.push(temp)
        })
        this.total = response.data.total
      }).catch((e) => {
        console.log(e)
      })
    },
    getListToExport(callback) {
      fetchListToExport(this.listQuery).then(response => {
        callback(response.data)
      }).catch((e) => {
        console.log(e)
      })
    },
    handleFilter() {
      // 搜索时默认返回第一页
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },

    // 显示明文密码
    showPwd() {
      this.pwdType === 'password' ? this.pwdType = '' : this.pwdType = 'password'
      const e = document.getElementsByClassName('el-icon-view')[0]
      this.pwdType == '' ? e.setAttribute('style', 'color: #409EFF;transform: scale(1.5) translateX(-10px);') : e.setAttribute('style', 'color: #c0c4cc;transform: scale(1.5) translateX(-10px);')
    },

    // 重置临时数据
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        phone: ''
      }
    },
    // 点击新建数据时调用
    handleCreate() {
      this.lock = false
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 点击保存数据时调用
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createAdmin(this.temp).then((res) => {
            this.temp.id = res.data
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '新建用户成功',
              type: 'success',
              duration: 2000
            })
          }).catch((e) => {
            console.log(e)
          })
        }
      })
    },
    // 点击修改数据时调用
    handleUpdate(row) {
      this.lock = true
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 点击保存修改后的数据时调用
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp)
          updateAdmin(tempData).then((res) => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '修改用户成功',
              type: 'success',
              duration: 2000
            })
          }).catch((e) => {
            console.log(e)
          })
        }
      })
    },
    // 点击删除数据时调用
    handleDelete(row) {
      this.deleteDialogVisible = true
      this.temp = Object.assign({}, row)
    },
    // 点击确认删除后调用
    deleteData() {
      const id = this.temp.id
      deleteAdmin({ id }).then(() => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list.splice(index, 1)
        this.deleteDialogVisible = false
        this.$notify({
          title: '成功',
          message: '删除用户成功',
          type: 'success',
          duration: 2000
        })
      }).catch((e) => {
            console.log(e)
          })
    },
    // 导出表格为Excel
    handleDownload() {
      // 首先调用getListToExport方法
      this.getListToExport((res) => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['用户名', '密码', '手机号']
          const filterVal = ['adminName', 'adminPwd', 'adminPhone']
          const data = this.formatJsonToExport(filterVal, res)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'user-list-' + parseTime(new Date(), '{y}-{m}-{d}')
          })
          this.downloadLoading = false
        }).catch((e) => {
          console.log(e)
        })
      })
    },
    // 针对不同的属性进行属性值过滤
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        return v[j]
      }))
    },
    formatJsonToExport(filterVal, data) {
      return data.map(v => filterVal.map(j => {
        return v[j]
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
