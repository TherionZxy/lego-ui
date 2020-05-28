<template>
  <div class="app-container" style="text-align: center;">
    <div class="filter-container">
      <!-- 页面上半部分的查询、导出数据模块 -->
      <el-input v-model="listQuery.username" placeholder="管理员" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves style="margin-left: 10px;" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
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
      <el-table-column label="管理员" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作类型" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.type | formatHistoryType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作内容" min-width="200px">
        <template slot-scope="{row}">
          <span>{{ row.operation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.time | parseTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
// 导入所需的api
import { fetchList } from '@/api/history-api'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { parseTime, formatHistoryType } from '@/utils/index'

export default {
  name: 'HistoryTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime, formatHistoryType
  },
  data() {
    return {
      // 表格KEY值
      tableKey: 7,
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
        type: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      fetchList(this.listQuery).then(response => {
        this.list = []
        response.data.historyList.forEach(item => {
          const temp = {
            id: item.historyId,
            username: item.adminName,
            operation: item.operation,
            type: item.type,
            time: item.time
          }
          this.list.push(temp)
        })
        this.total = response.data.total
      }).catch((e) => {
        console.log(e)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    }
  }
}
</script>
