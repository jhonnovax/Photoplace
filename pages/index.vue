<template>
  <div class="uploads">
    <section class="upload-panel">
      <h1>Upload files</h1>
      <input type="file" @change="onSelectFiles">
    </section>

    <section class="upload-progress">
      <div class="normal">
        <h2>Normal</h2>
        <file-status
          :file="fileNormal"
          :progress="fileNormal.progress"
        />
      </div>

      <div class="chunks">
        <h2>Chunks</h2>
        <div class="files">
          <file-status
            :file="fileChunk"
            :progress="fileChunk.progress"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      fileChunk: {},
      fileNormal: {}
    }
  },
  computed: {
    chunkSize: () => {
      return (10 * 1024)
    }
  },
  methods: {
    onSelectFiles (event) {
      const file = event.target.files[0]
      this.uploadNormal(file)
      this.uploadChunks(file)
    },
    uploadNormal (file) {
      console.time('Upload-Normal')
      this.fileNormal = { ...this.fileNormal, fileData: file }
      const formdata = new FormData()
      formdata.append('file', this.fileNormal.fileData, this.fileNormal.fileData.name)
      const ajax = new XMLHttpRequest()
      ajax.upload.addEventListener('progress', this.onUploadNormalProgress, false)
      ajax.upload.addEventListener('load', () => console.timeEnd('Upload-Normal'), false)
      ajax.open('POST', '/api/upload-normal')
      ajax.send(formdata)
    },
    onUploadNormalProgress (event) {
      const progress = Math.round((event.loaded / event.total) * 100)
      this.fileNormal = { ...this.fileNormal, progress }
    },
    async uploadChunks (file) {
      console.time('Upload-Chunks')
      this.fileChunk = { ...this.fileChunk, fileData: file, progress: 0 }
      const totalChunks = (Math.ceil(file.size / this.chunkSize) - 1)
      const fileChunks = [...Array(totalChunks + 1).keys()]

      for (const currentChunkIndex of fileChunks) {
        const from = currentChunkIndex * this.chunkSize
        const to = from + this.chunkSize
        const blob = file.slice(from, to)
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        await new Promise((resolve) => {
          reader.onload = async (readerEvent) => {
            this.fileChunk = { ...this.fileChunk, currentChunkIndex }
            await this.onUploadChunk(readerEvent, this.fileChunk, totalChunks)
            resolve(true)
          }
        })
      }
    },
    async onUploadChunk (readerEvent, file, totalChunks) {
      const data = readerEvent.target.result
      const params = new URLSearchParams()
      params.set('name', file.fileData.name)
      params.set('size', file.fileData.size)
      params.set('currentChunkIndex', file.currentChunkIndex)
      params.set('totalChunks', totalChunks)
      const headers = { 'Content-Type': 'application/octet-stream' }
      const url = '/api/upload-chunks?' + params.toString()
      const response = await axios.post(url, data, { headers })
      const progress = Math.round(file.currentChunkIndex / totalChunks * 100)
      this.fileChunk = { ...this.fileChunk, progress }

      if (file.currentChunkIndex === totalChunks) {
        this.fileChunk = { ...this.fileChunk, progress: 100, finalFilename: response.data.finalFilename }
        console.timeEnd('Upload-Chunks')
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .uploads {
    position: relative;
    padding: 10px;

    .upload-panel,
    .upload-progress {
      background-color: #efefef;
      border: 1px solid #ccc;
      margin: 10px auto;
      width: 600px;
      padding: 10px;
    }

    .upload-panel {
      text-align: center;
    }

    .upload-progress {
      display: flex;
      align-items: flex-start;

      .normal,
      .chunks {
        flex: 1;
        padding-left: 10px;
      }
    }
  }
</style>
