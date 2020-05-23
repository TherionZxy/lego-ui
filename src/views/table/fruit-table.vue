<template>
  <div class="app-container">
    <div class="filter-container" style="text-align: center;">
      <!-- 页面上半部分的查询、导出数据模块 -->
      <el-input v-model="listQuery.fruitname" placeholder="水果名" style="width: 20%;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" style="width: 15%;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button style="width: 10%;" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增水果
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
      <el-table-column label="价格(元)" min-width="20%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="20%" align="left">
        <template slot-scope="{row}">
          <span>{{ row.detail }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" min-width="20%" align="left">
        <template slot-scope="{row}">
          <span>{{ row.picture }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="20%" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button :type="row.status == 0? 'success': 'warning'" size="mini" @click="handleUpOrDownFruit(row)">
            {{row.status == 0? '上架': '下架'}}
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 删除对话框 -->
    <el-dialog :title="'删除商品'" width="20%" :visible.sync="deleteDialogVisible">
      <span style="font-size: 16px;">确认删除水果 "{{ temp.fruitname }}" ?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="deleteData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 上架/下架对话框 -->
    <el-dialog :title="'商品上架'" width="20%" :visible.sync="alterDialogVisible">
      <span style="font-size: 16px;">确认 <strong>{{ temp.status==0?'上架':'下架' }}</strong> 水果 "{{ temp.fruitname }}" ?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="alterDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="alterData()">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
// 导入所需的api
import { fetchList, changeFruitStatus } from '@/api/fruit'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { formatFruitStatus } from '@/utils/index'

export default {
  name: 'TotalOrderTable',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      // 表格KEY值
      tableKey: 4,
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
        status: 'all'
      },
      // 下载进度条
      downloadLoading: false,

      deleteDialogVisible: false,

      temp: {
        id: undefined,
        fruitname: '',
        price: 0.0,
        detail: '',
        picture: '',
        status: undefined
      },

      alterDialogVisible: false,

      statusOptions: [{label:'all', key: 'all'},{ label: '未上架', key: '0' }, { label: '已上架', key: '1' }],
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
        const tHeader = ['水果名称', '价格', '描述', '图片', '状态']
        const filterVal = ['fruitname', 'price', 'detail', 'picture', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'fruit-list-' + new Date().toLocaleDateString()
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
        if(j == 'status'){
          return formatFruitStatus(v[j])
        } else {
          return v[j]
        }
      }))
    },

    handleDelete(row) {
      this.deleteDialogVisible = true
      this.temp = Object.assign({}, row)
    },

    deleteData() {
      const index = this.list.findIndex(v => v.id === this.temp.id)
      this.list.splice(index, 1)
      this.$notify({
        title: '成功',
        message: '删除商品成功',
        type: 'success',
        duration: 2000
      })
      this.deleteDialogVisible = false
    },

    handleCreate() {
      this.$router.push({path: '/grounding/modify'})
    },

    handleUpdate(row) {
      this.$router.push({path: '/grounding/modify', query: row})
    },

    // 处理 上架/下架
    handleUpOrDownFruit(row) {
      this.alterDialogVisible = true
      this.temp = Object.assign({}, row)
    },

    alterData() {
      const tempData = Object.assign({}, this.temp)
      const newStatus = this.temp.status == 0?1:0
      tempData.status = newStatus
      changeFruitStatus(tempData).then(()=>{
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list[index].status = newStatus
        this.alterDialogVisible = false
        this.$notify({
          title: '成功',
          message: this.temp.status==0?'上架成功':'下架成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>