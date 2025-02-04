const express = require("express");
//const io = require("socket.io");
const app = express()
const PORT = 3005;
const Http = require('http') 
const server = Http.createServer()
//const rooms: Record<String,string[]> ={};
const io = require('socket.io')(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
})

const rooms = {}

io.on('connection',socket=>{


    function createRoom(){
        const roomId = uuidV4();
        rooms[roomId] = [];
    
        socket.emit("room-created",{roomId});
        console.log("user created the room"); 
    }
    
    function joinRoom({roomId,peerId}){
        //if
        //console.log("user joined the room",roomId);
        rooms[roomId].push(peerId)
        socket.join(roomId)
        socket.emit('get-users',{
            roomId,
            participants:rooms[roomId]
        })
    }
    socket.on("create-room",createRoom);
    socket.on("join-room",joinRoom);

})


app.listen(PORT,()=>console.log(`started at post ${PORT}`))
