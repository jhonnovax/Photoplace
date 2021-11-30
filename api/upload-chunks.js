import fs from 'fs'
import md5 from 'md5'
import { Router } from 'express'
const router = Router()

router.use('/upload-chunks', (req, res) => {
  const { name, currentChunkIndex, totalChunks } = req.query
  const ext = name.split('.').pop()
  const data = req.body.toString().split(',')[1]
  const buffer = Buffer.from(data, 'base64')
  const tmpFilename = 'tmp_' + md5(name + req.ip) + '.' + ext
  const tmpUploadDir = 'static/uploads/'

  if (parseInt(currentChunkIndex) === 0 && fs.existsSync(tmpUploadDir + tmpFilename)) {
    fs.unlinkSync(tmpUploadDir + tmpFilename)
  }

  fs.appendFileSync(tmpUploadDir + tmpFilename, buffer)

  if (parseInt(currentChunkIndex) === parseInt(totalChunks)) {
    const finalFilename = `chunks-${name}`
    fs.renameSync(tmpUploadDir + tmpFilename, tmpUploadDir + finalFilename)
    return res.json({ finalFilename })
  }

  res.json('ok')
})

module.exports = router
