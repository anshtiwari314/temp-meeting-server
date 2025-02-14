const express = require('express')
const app = express()
const path = require('path')
const Http = require('http')
const cors = require('cors')
//const server = Http.createServer()
const ExpressPeerServer = require('peer').ExpressPeerServer;

const dotenv = require('dotenv')
dotenv.config()

const server = Http.createServer(app);

const PORT = process.env.PEER_PORT || 3008;


// const peerServer = PeerServer({
//     port: PORT, 
//     path: '/myapp', 
//     allow_discovery: true,
//   })

  let options={
    debug: true
  }

app.use(express.json())
app.use(cors({origin:'*'}))
app.use(express.urlencoded({extended:true}))

app.use('/peerjs', ExpressPeerServer(server, options));

server.listen(PORT,()=>{console.log(`server started at ${PORT}`)})