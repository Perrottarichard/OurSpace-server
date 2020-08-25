const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const router = require('./router')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')
const { callbackify } = require('util')

const app = express()

const PORT = process.env.PORT || 5000

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
  console.log('ws connected')

  socket.on('join', ({ name, room }) => {
    const { user, error } = addUser({ id: socket.id, name, room })
    if (user) {
      socket.emit('message', { user: 'admin', text: `${user.name}, welcome to ${user.room}` })
      socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined` })
      socket.join(user.room)
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
    }
    else {
      console.log('no user')
    }
  })

  socket.on('sendMessage', (message) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('message', { user: user.name, text: message })
    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
  })
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` })
    }
  })
})


app.use(router)

server.listen(PORT, () => {
  `Server listening on port ${PORT}`
})