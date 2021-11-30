import bodyParser from 'body-parser'
const express = require('express')
const app = express()

const uploadChunks = require('./upload-chunks')
const uploadNormal = require('./upload-normal')
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '100mb' }))
app.use(uploadChunks)
app.use(uploadNormal)

if (require.main === module) {
  const port = 3001
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`)
  })
}

module.exports = app
