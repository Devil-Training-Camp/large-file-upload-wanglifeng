<template>
  <div class="file-list">
    <el-collapse v-if="fileList.length > 0" accordion>
      <el-collapse-item v-for="(item, index) in fileList" :key="index">
        <div class="progress-box">
          <div class="list-item">
            <div class="item-name">
              <span>{{ index + 1 }}名称：{{ item.name }}</span>
            </div>
            <div class="item-size">大小：{{ item.size }}</div>
          </div>
          <div v-if="item.hashProgress !== 100" class="item-progress">
            <span></span>
            <el-progress :percentage="item.hashProgress" />
          </div>
          <div v-else class="item-progress">
            <span>文件进度：</span>
            <el-progress :percentage="item.totalPercentage" />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
defineProps({
  fileList: {
    type: Array,
    default: () => [],
  },
});
</script>

<style lang="less" scoped>
.file-list {
  .list-item {
    padding: 8px 10px;
    display: flex;
    justify-content: center;
    justify-items: center;
    line-height: 25px;
    position: relative;
    div {
      flex: 1;
      margin-top: 6px;
    }
    .item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 6px;
      .svg-icon {
        font-size: 22px;
        vertical-align: sub;
      }
    }
    .item-status {
      flex: 0 0 10%;
      text-align: center;
      text-align: left;
      .el-icon-circle-check {
        color: #67c23a;
      }
      .el-icon-circle-close {
        color: #f00;
      }
    }
    .item-progress {
      flex: 0 0 60%;
    }
  }
}
</style>
