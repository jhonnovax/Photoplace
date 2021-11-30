<template>
  <div v-if="file.fileData" class="file-status">
    <div>
      <a
        class="file"
        target="_blank"
        :href="`http://localhost:3000/uploads/${file.finalFilename}`"
        rel="noreferrer"
      >
        {{ file.fileData.name }}
      </a>
    </div>
    <div><strong>File Name:</strong> {{ file.fileData.name }}</div>
    <div><strong>File Size:</strong> {{ parseFloat(file.fileData.size/1024/1024).toFixed(2) }}MB</div>
    <div><strong>Progress:</strong> {{ progress }}%</div>
  </div>
</template>

<script>
export default {
  props: {
    file: {
      type: Object,
      default: () => ({})
    },
    progress: {
      type: Number,
      default: () => (0)
    }
  }
}
</script>

<style scoped>
  .file-status {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 10px;
    margin: 10px 0;
  }
</style>
