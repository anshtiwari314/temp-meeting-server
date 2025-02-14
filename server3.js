const express = require('express')
const app = express()
const path = require('path')
const Http = require('http')
//const server = Http.createServer()
const dotenv = require('dotenv')
const { Server } = require("socket.io");

const server = Http.createServer(app);


let users = {}
// const io = require('socket.io')(server,{
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//       }
// })

const io = new Server(server);

dotenv.config()
const PORT = process.env.PORT || 3008;

//app.use(express.static(path.join(__dirname,'dist')))

app.use(express.json())
app.use(cors({origin:'*'}))
app.use(express.urlencoded({extended:true}))
//console.log(path.join(__dirname,'dist','index.html'))
app.get('/',(req,res)=>{
    console.log('request coming',__dirname)
    res.sendFile(path.join(__dirname,'dist','index.html'))
})


io.on('connection',(socket)=>{

    socket.on('connected',(userId)=>{
        console.log('someone connected',userId)
    })

    socket.on('join-room',(roomId,userId)=>{
        console.log('join-room triggered',roomId,userId)
        users[userId] = socket.id

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected',userId)
        //console.log(roomId,userId)

        socket.on('disconnect', () =>{
            delete users[userId] 
            console.log('someone disconnect',userId,'\n\n\n')
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
         })
        socket.on('tab-close',(data)=>{
            socket.broadcast.to(roomId).emit('tab-close-remove-video', data);
        })
        socket.on('connected-user-data',(data)=>{
            console.log("data",data,"users",users[data.toPeer],"socketid",socket.id)
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
        socket.on('send-msg',(data)=>{
            
            socket.broadcast.to(roomId).emit('receive-msg', data);

        })
        socket.on('to-leave-page-transmitter',(id)=>{
            socket.broadcast.to(roomId).emit('to-leave-page-receiver', id);
        })
        socket.on('user-chat-transmitter',(data)=>{
            //console.log(data,users[data.toPeer],socket.id)
            //setTimeout(()=>{
                io.to(users[data.toPeer]).emit('user-chat-receiver',data)
            //},10000)
            
            //socket.to(users[userId]).emit('receive-connected-user-data',data)
        })
        socket.on('single-screen-share-transmitter',(data)=>{
                io.to(users[data.toPeer]).emit('single-screen-share-receiver',data)
        })
        socket.on('screen-share-transmitter',(data)=>{
            socket.broadcast.to(roomId).emit('screen-share-receiver', data);
        })
        socket.on('screen-share-end-transmitter',(data)=>{
            socket.broadcast.to(roomId).emit('screen-share-end-receiver', data);
        })
        socket.on('cue-loading-transmitter',(data)=>{
            io.to(users[data.toPeer]).emit('cue-loading-receiver',data)
        })
        socket.on('audio-notification-transmitter',(data)=>{
            io.to(users[data.toPeer]).emit('audio-notification-receiver',data)
        })
    })

    socket.on('camera-toggle',(roomId,userId,state)=>{
       // console.log(roomId,userId,state)
        socket.to(roomId).emit('user-camera-toggle',userId,state)
    })
})
server.listen(PORT,()=>{console.log(`server started at ${PORT}`)})