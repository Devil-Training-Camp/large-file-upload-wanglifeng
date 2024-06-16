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
            <el-progress :percentage="item.uploadProgress" />
          </div>
        </div>
        <div class="item-chunk-box">
          <el-table border max-height="300">
            <el-table-column prop="index" label="#" align="center" />
            <el-table-column
              prop="hash"
              label="切片md5"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column label="大小" align="center" width="120">
            </el-table-column>
            <el-table-column prop="uploaded" label="是否完成" align="center">
            </el-table-column>

            <el-table-column label="进度" align="center"> </el-table-column>
          </el-table>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import type { UploadFile } from "element-plus";
import { UploadedFile } from "@/types/file";
defineProps({
  fileList: {
    type: Array as () => (UploadedFile | UploadFile)[],
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
    &:hover .item-chunk-box {
      display: block;
    }
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
    .item-chunk-box {
      display: none;
      transition: all 3s;
      position: absolute;
      top: 0;
      left: 40px;
      z-index: 10;
    }
    .item-progress {
      flex: 0 0 60%;
    }
  }
}
</style>
@/types/file