const express = require('express')
const app = express()
const PORT = 3005;
const Http = require('http')
const server = Http.createServer()

let users = {}
const io = require('socket.io')(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
})

io.on('connection',(socket)=>{

    socket.on('connected',(userId)=>{
        console.log('someone connected',userId)
    })

    socket.on('join-room',(roomId,userId)=>{
        
        users[userId] = socket.id

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected',userId)
        console.log(roomId,userId)

        socket.on('disconnect', () =>{
            delete users[userId] 
            console.log('someone disconnect',userId)
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
         })
        socket.on('tab-close',(userId)=>{
            socket.broadcast.to(roomId).emit('tab-close-remove-video', userId);
        })
        socket.on('connected-user-data',(data)=>{
            console.log(data,users[data.toPeer],socket.id)
            //setTimeout(()=>{
                io.to(users[data.toPeer]).emit('receive-connected-user-data',data)
            //},10000)
            
            //socket.to(users[userId]).emit('receive-connected-user-data',data)
        })
        socket.on('send-msg',(msg,userName)=>{
            socket.broadcast.to(roomId).emit('receive-msg', msg,userName);
        })
    })

    socket.on('camera-toggle',(roomId,userId,state)=>{
       // console.log(roomId,userId,state)
        socket.to(roomId).emit('user-camera-toggle',userId,state)
    })
})
server.listen(PORT,()=>{console.log(`server started at ${PORT}`)})