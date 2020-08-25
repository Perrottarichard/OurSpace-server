const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const router = require('./router')
const app = express()

const PORT = process.env.PORT || 5000

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
  console.log('new connection')

  socket.on('join', ({ name, room }) => {
    console.log(name, room)
  })

  socket.on('disconnect', () => {
    console.log('user left')
  })
})


app.use(router)

server.listen(PORT, () => {
  `Server listening on port ${PORT}`
})