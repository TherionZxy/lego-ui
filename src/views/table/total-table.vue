<template>
  <div class="app-container">
    <div class="filter-container" style="text-align: center;">
      <!-- 页面上半部分的查询、导出数据模块 -->
      <el-input v-model="listQuery.fruitname" placeholder="水果名" style="width: 20%;" class="filter-item" @keyup.enter.native="handleFilter" />
      <!-- 时间选择 -->
      <el-date-picker v-model="listQuery.time" style="width: 20%;" type="date" placeholder="选择日期" @change="handleFilter" />
      <el-button v-waves style="width: 10%;margin-left: 10px;" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="normal" icon="el-icon-download" @click="downloadByCondition">
        按条件导出
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
    >
      <el-table-column label="水果名称" min-width="20%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.fruitname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日销售量" min-width="20%" align="center">
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
import { fetchTotalList, fetchTotalListToExport } from '@/api/total-api'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'

export default {
  name: 'TotalOrderTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
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
        time: parseTime(new Date(),'{y}-{m}-{d}')
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
        this.list = []
        response.data.totalList.forEach(item => {
          let temp = {
            fruitname: item.name,
            number: item.number
          }
          this.list.push(temp)
        })
        this.total = response.data.total
      })
    },
    getListToExport(callback) {
      fetchTotalListToExport(this.listQuery).then(response => {
        callback(response.data)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 按条件导出数据
    downloadByCondition() {
      this.getListToExport((res) => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['水果名称', '日销售量']
          const filterVal = ['name', 'number']
          const data = this.formatJsonToExport(filterVal, res)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'total-list-' + parseTime(this.listQuery.time, '{y}-{m}-{d}')
          })
          this.downloadLoading = false
        }).catch((e)=>{
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
    }
  }
}
</script>
