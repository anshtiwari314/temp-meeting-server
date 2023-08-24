const express = require('express')
const app = express()
const path = require('path')
const Http = require('http')
const server = Http.createServer()
const dotenv = require('dotenv')

let users = {}
const io = require('socket.io')(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
})
dotenv.config()
const PORT = process.env.PORT || 3005;

app.use(express.static(path.join(__dirname,'dist')))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
console.log(path.join(__dirname,'dist','index.html'))
app.get('/',(req,res)=>{
    console.log('request coming',__dirname)
    res.sendFile(path.join(__dirname,'dist','index.html'))
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
        socket.on('tab-close',(data)=>{
            socket.broadcast.to(roomId).emit('tab-close-remove-video', data);
        })
        socket.on('connected-user-data',(data)=>{
            console.log(data,users[data.toPeer],socket.id)
            //setTimeout(()=>{
                io.to(users[data.toPeer]).emit('receive-connected-user-data',data)
            //},10000)
            
            //socket.to(users[userId]).emit('receive-connected-user-data',data)
        })
        socket.on('camera-toggle-transmitter',(data)=>{
            socket.broadcast.to(roomId).emit('camera-toggle-receiver',data)
        })
        socket.on('microphone-toggle-transmitter',(data)=>{
            socket.broadcast.to(roomId).emit('microphone-toggle-receiver',data)
        })
        socket.on('send-msg',(msg,userName)=>{
            socket.broadcast.to(roomId).emit('receive-msg', msg,userName);
        })
        socket.on('user-chat-transmitter',(data)=>{
            //console.log(data,users[data.toPeer],socket.id)
            //setTimeout(()=>{
                io.to(users[data.toPeer]).emit('user-chat-receiver',data)
            //},10000)
            
            //socket.to(users[userId]).emit('receive-connected-user-data',data)
        })
        socket.on('screen-share-transmitter',(data)=>{
            socket.broadcast.to(roomId).emit('screen-share-receiver', data);
        })
    })

    socket.on('camera-toggle',(roomId,userId,state)=>{
       // console.log(roomId,userId,state)
        socket.to(roomId).emit('user-camera-toggle',userId,state)
    })
})
server.listen(PORT,()=>{console.log(`server started at ${PORT}`)})