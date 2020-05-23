<template>
  <div class="app-container">
    <div class="filter-container" style="text-align: center;">
      <!-- 页面上半部分的查询、导出数据模块 -->
      <el-input v-model="listQuery.fruitname" placeholder="水果名" style="width: 20%;" class="filter-item" @keyup.enter.native="handleFilter" />
      <!-- 时间选择 -->
      <el-date-picker style="width: 20%;" v-model="listQuery.time" type="date" placeholder="选择日期"></el-date-picker>
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
      <el-table-column label="水果名称" min-width="20%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.fruitname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日销售量" min-width="20%">
        <template slot-scope="{row}">
          <span>{{ row.number }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
// 导入所需的api
import { fetchTotalList } from '@/api/order'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'TotalOrderTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      // 表格KEY值
      tableKey: 2,
      // 列表数据
      list: null,
      // 数据总数
      total: 0,
      listLoading: false,
      // 列表查询
      listQuery: {
        page: 1,
        limit: 20,
        fruitname: '',
        time: ''
      },
      // 下载进度条
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      fetchTotalList(this.listQuery).then(response => {
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
        const tHeader = ['水果名称', '日销售量']
        const filterVal = ['fruitname', 'number']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'total-list-' + new Date().toLocaleDateString()
        })
        this.downloadLoading = false
      })
    },

    // 导出今日数据
    downloadToday() {

    },

    // 针对不同的属性进行属性值过滤
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        return v[j]
      }))
    }
  }
}
</script>
