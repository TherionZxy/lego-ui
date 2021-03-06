<template>
  <div class="app-container">
    <div class="filter-container" style="text-align: center;">
      <!-- 页面上半部分的查询、导出数据模块 -->
      <el-input v-model="listQuery.fruitname" placeholder="水果名" style="width: 20%;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" style="width: 15%;" class="filter-item" @change="handleFilter">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves style="width: 10%;margin-left: 10px; " class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
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
      <el-table-column label="水果名称" min-width="10%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.fruitname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原价" min-width="10%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="惊爆价" min-width="10%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.discount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="限购数量" min-width="10%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.maxnum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" min-width="15%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.startTime | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" min-width="15%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.endTime | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否开始" min-width="10%" align="center">
        <template slot-scope="{row}">
          <span>{{ row.status==1?'已开始':'未开始' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="20%" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button :disabled="row.status==0?true:false" type="warning" size="mini" @click="handleDelete(row)">
            停止
          </el-button>
          <el-button type="danger" size="mini" @click="handleRemove(row)">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 修改对话框 -->
    <el-dialog :title="'修改抢购信息'" width="400px" :visible.sync="updateDialogVisible">
      <el-form ref="dataForm" :model="temp" :rules="rules" size="medium" label-width="100px">
        <el-form-item label="惊爆价" prop="discount">
          <el-input-number v-model="temp.discount" :max="temp.price" placeholder="惊爆价" :precision="2" />
        </el-form-item>
        <el-form-item label="限购数量" prop="maxnum">
          <el-input-number v-model="temp.maxnum" placeholder="限购数量" />
        </el-form-item>
        <el-form-item label="活动日期" prop="date">
          <el-date-picker
            v-model="temp.date"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :style="{width: '100%'}"
            placeholder="请选择活动日期"
            clearable
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item label="时间范围" prop="time">
          <el-time-picker
            v-model="temp.time"
            is-range
            format="HH:mm"
            value-format="HH:mm"
            :style="{width: '100%'}"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="至"
            clearable
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 删除对话框 -->
    <el-dialog :title="'是否强制停止促销活动?'" width="20%" :visible.sync="deleteDialogVisible">
      <span style="font-size: 16px;">确认停止 "{{ temp.fruitname }} 的限时抢购" ?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="deleteData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 移除对话框 -->
    <el-dialog :title="'将水果从限时抢购移除'" width="20%" :visible.sync="removeDialogVisible">
      <span style="font-size: 16px;">确认将水果 "{{ temp.fruitname }} 从限时抢购列表移除" ?</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="removeDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="removeData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 导入所需的api
import { fetchList, fetchListToExport, updateFlashSale, stopFlashSale, removeFlashSale } from '@/api/flashsale-api'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils/index'

export default {
  name: 'FlashsaleTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    parseTime
  },
  data() {
    return {
      // 表格KEY值
      tableKey: 5,
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
      updateDialogVisible: false,
      temp: {
        id: undefined,
        price: 0.0,
        discount: 0.0,
        maxnum: 1,
        date: '',
        time: ''
      },
      rules: {
        discount: [{
          required: true,
          message: '惊爆价',
          trigger: 'blur'
        }],
        maxnum: [{
          required: true,
          message: '限购数量',
          trigger: 'blur'
        }],
        date: [{
          required: true,
          message: '请选择活动日期',
          trigger: 'change'
        }],
        time: [{
          required: true,
          message: '时间范围不能为空',
          trigger: 'change'
        }]
      },

      deleteDialogVisible: false,

      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },

      removeDialogVisible: false,

      statusOptions: [{ label: 'all', key: -1 }, { label: '未开始', key: 0 }, { label: '已开始', key: 1 }]
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
            fruitname: item.fruitName,
            price: item.normPrice,
            discount: item.discountPrice,
            maxnum: item.maxNum,
            startTime: item.startTime,
            endTime: item.endTime,
            status: (new Date(item.startTime) < new Date() && new Date() < new Date(item.endTime)) ? 1 : 0
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
    },

    getStatus(startTime, endTime) {
      console.log()
    },

    // 按条件导出数据
    downloadByCondition() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['水果名称', '原价', '惊爆价', '限购数量', '开始时间', '结束时间']
        const filterVal = ['fruitname', 'price', 'discount', 'maxnum', 'startTime', 'endTime']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'flashsale-list-' + new Date().toLocaleDateString()
        })
        this.downloadLoading = false
      }).catch((e) => {
        console.log(e)
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
    },

    handleRemove(row) {
      if(row.status == 1) {
        this.$notify({
          title: '错误',
          message: '请先停止该限时抢购水果',
          type: 'warning',
          duration: 2000
        })
        return
      }
      this.temp = Object.assign({}, row)
      this.removeDialogVisible = true
    },

    removeData() {
      const id = this.temp.id
      removeFlashSale({ id }).then(() => {
        console.log(1)
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list.splice(index, 1)
        this.removeDialogVisible = false
        this.$notify({
          title: '成功',
          message: '移除水果成功',
          type: 'success',
          duration: 2000
        })
      }).catch(e=>{
        console.log(e)
      })
    },

    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      // 这里不能直接赋值，要使用$set
      console.log(this.temp)
      this.$set(this.temp, 'date', parseTime(this.temp.startTime, '{y}-{m}-{d}'))
      this.$set(this.temp, 'time', [parseTime(this.temp.startTime, '{h}:{i}'), parseTime(this.temp.endTime, '{h}:{i}')])
      this.updateDialogVisible = true
    },

    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.startTime = this.temp.date + ' ' + this.temp.time[0]
          this.temp.endTime = this.temp.date + ' ' + this.temp.time[1]

          updateFlashSale(this.temp).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)

            if (new Date(this.temp.startTime) <= new Date() && new Date() <= new Date(this.temp.endTime)) {
              this.list[index].status = 1
            } else {
              this.list[index].status = 0
            }

            this.updateDialogVisible = false
            this.$notify({
              title: '成功',
              message: '修改抢购信息成功',
              type: 'success',
              duration: 2000
            })
          }).catch((e) => {
            console.log(e)
          })
        }
      })
    },

    handleDelete(row) {
      this.deleteDialogVisible = true
      this.temp = Object.assign({}, row)
    },

    deleteData() {
      const id = this.temp.id
      stopFlashSale({ id }).then(() => {
        const index = this.list.findIndex(v => v.id === this.temp.id)
        this.list[index].status = 0
        this.list[index].startTime = null
        this.list[index].endTime = null
        this.$notify({
          title: '成功',
          message: '强制停止商品限时抢购成功',
          type: 'success',
          duration: 2000
        })
        this.deleteDialogVisible = false
      }).catch((e) => {
        console.log(e)
      })
    }
  }
}
</script>
