<template>
  <div class="dashboard-container">
    <div class="dashboard-text" style="position: absolute; z-index: 1;">欢迎您: {{ name }}</div>
    <chart style="z-index: 0;" height="100%" width="100%" />

    <clock style="z-index:2;position: absolute;right: 10px;top: 10px; border: 5px solid white;color: white;" size="200px"></clock>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Clock from 'vue-clock2'
import Chart from '@/components/Charts/MixChart'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  components:{
    Clock,Chart
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    // margin: 30px;
    position: relative;
    width: 100%;
    height: calc(100vh - 34px);
  }
  &-text {
    font-size: 25px;
    line-height: 46px;
    color: white;
    margin-left: 10px;
  }
}
</style>
