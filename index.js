const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const cors = require('cors')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const router = require('./router')

const app = express()
app.use(cors());
const server = http.createServer(app)
const io = socketio(server, { origins: "https://r-space.netlify.app" })


app.use(router)

io.on('connection', (socket) => {
  console.log('ws connected')

  socket.on('join', ({ name, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, name, room })
    if (error) {
      return callback(error)
    }
    socket.join(user.room)
    socket.emit('message', { user: 'robot', text: `hi ${user.name}, welcome to ${user.room}` })
    socket.broadcast.to(user.room).emit('message', { user: 'robot', text: `${user.name} has joined` })

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('message', { user: user.name, text: message })
    callback()
  })
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', { user: 'robot', text: `${user.name} has left` })
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
    }
  })
})
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  `Server listening on port ${PORT}`
})