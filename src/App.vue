<script setup lang="ts">
import { RouterView } from "vue-router";
import { provide } from "vue";
import fileStorageDBService from "./utils/fileStorageDBService";

provide("fileStorageDB", fileStorageDBService);
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>

<style scoped></style>
