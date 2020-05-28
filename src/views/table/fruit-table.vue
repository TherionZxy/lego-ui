<template>
  <div class="app-container">
    <div class="filter-container" style="text-align: center;">
      <!-- 页面上半部分的查询、导出数据模块 -->
      <el-input v-model="listQuery.fruitname" placeholder="水果名" style="width: 20%;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" style="width: 15%;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves style="width: 10%;margin-left: 10px;" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="normal" icon="el-icon-download" @click="downloadByCondition">
        按条件导出
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;float: right;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增水果
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
      <el-table-column label="价格(元)" min-width="20%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column  label="描述" min-width="20%" align="left">
        <template slot-scope="{row}">
          <span>{{ row.detail|subString }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" min-width="20%" align="left">
        <template slot-scope="{row}">
          <span>{{ row.picture }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="22%" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button :type="row.status == 0? 'success': 'danger'" size="mini" @click="handleUpOrDownFruit(row)">
            {{ row.status == 0? '上架': '下架' }}
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button :disabled="row.isflashsale==1?true:false" type="warning" size="mini" @click="handleFlashSale(row)">
            添加至抢购
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 删除对话框 -->
    <el-dialog :title="'添加到限时抢购'" width="350px" :visible.sync="changeDialogVisible">
      <span style="font-size: 16px;">确认将水果 "{{ temp.fruitname }}" 添加到限时抢购?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="changeDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="changeData()">
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
import { fetchList, fetchListToExport, changeFruitStatus, changeIsFlashSaleStatus } from '@/api/fruit-api'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { formatFruitStatus, subString } from '@/utils/index'

export default {
  name: 'TotalOrderTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    subString
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
        status: -1
      },
      // 下载进度条
      downloadLoading: false,

      changeDialogVisible: false,

      temp: {
        id: undefined,
        fruitname: '',
        price: 0.0,
        detail: '',
        picture: '',
        status: undefined
      },

      alterDialogVisible: false,

      statusOptions: [{ label: 'all', key: -1 }, { label: '未上架', key: 0 }, { label: '已上架', key: 1 }]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      fetchList(this.listQuery).then(response => {
        this.list = []
        response.data.fruitList.forEach(item => {
          const temp = {
            id: item.fruitId,
            price: item.normPrice,
            fruitname: item.fruitName,
            detail: item.fruitIntro,
            password: item.adminPwd,
            status: item.isSale,
            isflashsale: item.isFlashSale,
            picture: item.display + '张展示图片' + item.intro + '张详情图片',
            display: item.display,
            intro: item.intro
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
    // 按条件导出数据
    downloadByCondition() {
      this.getListToExport((res) => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['水果名称', '价格', '描述', '图片', '状态']
          const filterVal = ['fruitName', 'normPrice', 'fruitIntro', 'fruitPic', 'isSale']
          const data = this.formatJsonToExport(filterVal, res)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'fruit-list-' + new Date().toLocaleDateString()
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
        if (j == 'status') {
          return formatFruitStatus(v[j])
        } else {
          return v[j]
        }
      }))
    },

    formatJsonToExport(filterVal, data) {
      return data.map(v => filterVal.map(j => {
        if (j == 'isSale') {
          return formatFruitStatus(v[j])
        } else if (j == 'fruitPic') {
          return v[j].display + '张展示图片 ' +v[j].intro + '张详情图片'
        } else {
          return v[j]
        }
      }))
    },

    handleFlashSale(row) {
      this.changeDialogVisible = true
      this.temp = Object.assign({}, row)
    },

    changeData() {
      const id = this.temp.id
      changeIsFlashSaleStatus({ id }).then(() => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list[index].isflashsale=1
        this.$notify({
          title: '成功',
          message: '添加限时抢购商品成功',
          type: 'success',
          duration: 2000
        })
        this.changeDialogVisible = false
      }).catch((e) => {
        console.log(e)
      })
    },

    handleCreate() {
      this.$router.push({ path: '/grounding/modify' })
    },

    handleUpdate(row) {
      this.$router.push({ path: '/grounding/modify', query: row })
    },

    // 处理 上架/下架
    handleUpOrDownFruit(row) {
      this.alterDialogVisible = true
      this.temp = Object.assign({}, row)
    },

    alterData() {
      const tempData = {}
      const newStatus = this.temp.status == 0 ? 1 : 0
      tempData.fruitId = this.temp.id
      tempData.isSale = newStatus
      changeFruitStatus(tempData).then(() => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list[index].status = newStatus
        this.alterDialogVisible = false
        this.$notify({
          title: '成功',
          message: this.temp.status == 0 ? '上架成功' : '下架成功',
          type: 'success',
          duration: 2000
        })
      }).catch((e) => {
        console.log(e)
      })
    }
  }
}
</script>
