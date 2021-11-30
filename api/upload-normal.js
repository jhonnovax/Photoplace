import fs from 'fs'
import formidable from 'formidable'
import { Router } from 'express'
const router = Router()

router.use('/upload-normal', (req, res) => {
  const form = new formidable.IncomingForm()
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.warn(err)
    }

    fs.renameSync(files.file.filepath, `static/uploads/normal-${files.file.originalFilename}`)
    return res.status(200).json(files)
  })
})

module.exports = router
