const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
  res.send('server running')
  next()
})

module.exports = router