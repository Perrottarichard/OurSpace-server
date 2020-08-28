const http = require('http')
const express = require('express')
const cors = require('cors')


const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const router = require('./router')

const app = express()
app.use(cors())
app.use(router)

const server = http.createServer(app)


const io = require("socket.io")(server, { origins: 'https://r-space.netlify.app' });


const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  `Server listening on port ${PORT}`
})

io.on('connection', (socket) => {
  console.log('ws connected')

  socket.on('join', ({ name, room }) => {
    const { user } = addUser({ id: socket.id, name, room })

    socket.join(user.room)
    socket.emit('message', { user: 'robot', text: `hi ${user.name}, welcome to ${user.room}` })
    socket.broadcast.to(user.room).emit('message', { user: 'robot', text: `${user.name} has joined` })

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
  })

  socket.on('sendMessage', (message) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('message', { user: user.name, text: message })

  })
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', { user: 'robot', text: `${user.name} has left` })
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
    }
  })
})
