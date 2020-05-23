<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 页面上半部分的查询、导出数据模块 -->
      <el-input v-model="listQuery.name" placeholder="客户名" style="width: 14%;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.phone" placeholder="手机号" style="width: 14%;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.code" placeholder="提货码" style="width: 14%;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" style="width: 15%;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <!-- 时间选择 -->
      <el-date-picker style="width: 15%;" v-model="listQuery.startTime" type="date" placeholder="开始日期" :picker-options="pickerOptions0"></el-date-picker>
      <el-date-picker style="width: 15%;" v-model="listQuery.endTime" type="date" placeholder="结束日期" :picker-options="pickerOptions1"></el-date-picker>
      <el-button style="width: 10%;" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <br />

    <div>
      <div style="text-align: center;">
        <el-button v-waves :loading="downloadLoading" class="filter-item" type="normal" icon="el-icon-download" @click="downloadByCondition">
          按条件导出
        </el-button>
        <el-button v-waves :loading="downloadLoading" class="filter-item" type="normal" icon="el-icon-download" @click="downloadToday">
          导出当天数据
        </el-button>
      </div>
    </div>

    <br />

    <!-- 数据列表模块 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="客户名" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单内容" min-width="300px">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提货码" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单创建时间" min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span :style="{color: row.status==0?'red':'blue'}">{{ row.status | formatOrderStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button style="width: 100px;" :disabled="row.status==1?true:false" type="primary" size="mini" @click="handleUpdate(row)">
            {{row.status==1?'订单已完成':'完成订单'}}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="'完成订单'" width="20%" :visible.sync="updateDialogVisible">
      <span style="font-size: 16px;">确认完成客户 "{{ temp.name }}" 的订单 ?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateStatus()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 导入所需的api
import { fetchList, updateOrder} from '@/api/order'
import waves from '@/directive/waves' // waves directive
import { parseTime, formatOrderStatus } from '@/utils/index'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'OrderTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime,formatOrderStatus
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
        name: '',
        phone: '',
        code: '',
        status: 'all',
        startTime: '',
        endTime: ''
      },
      // 排序选项
      statusOptions: [{label:'all', key: 'all'},{ label: '待提货', key: '0' }, { label: '已提货', key: '1' }],
      // 下载进度条
      downloadLoading: false,

      startTime: '',
      endTime: '',

      pickerOptions0: {
        disabledDate: (time) => {
          if (this.listQuery.endTime != "") {
            return time.getTime() > Date.now() || time.getTime() > this.listQuery.endTime
          } else {
            return time.getTime() > Date.now();
          }
        }
      },
      pickerOptions1: {
        disabledDate: (time) => {
          return time.getTime() < this.listQuery.startTime || time.getTime() > Date.now();
        }
      },

      updateDialogVisible: false,
      temp: {
        id: undefined,
        name: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
      })
    },
    handleFilter() {
      // 搜索时默认返回第一页
      this.listQuery.page = 1
      this.getList()
    },
    // 按条件导出数据
    downloadByCondition() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['客户名', '手机号', '订单内容', '提货码' , '订单状态' , '订单创建时间']
        const filterVal = ['name', 'phone', 'content', 'code' , 'status' , 'createTime']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'order-list-' + new Date().toLocaleDateString()
        })
        this.downloadLoading = false
      })
    },

    // 导出今日数据
    downloadToday() {

    },

    resetTemp() {
      this.temp = {
        id: undefined,
        name: ''
      }
    },

    // 点击完成订单
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.updateDialogVisible = true
    },

    // 点击确认
    updateStatus() {
      const tempData = Object.assign({}, this.temp)
      updateOrder(tempData).then(() => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list[index].status = 1
        this.updateDialogVisible = false
        this.$notify({
          title: '成功',
          message: '修改用户成功',
          type: 'success',
          duration: 2000
        })
        // this.getList()
      })
    },

    // 针对不同的属性进行属性值过滤
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'createTime') {
          return parseTime(v[j])
        } else if (j === 'status') {
          return formatOrderStatus(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
