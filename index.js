var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(3001);

// Create Server function handler
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

// Socket server js
io.on('connection', function (socket) { 	

    //user request to join room
    socket.on('joined', (data)=>{
      socket.join(data.room);

      mems[data.room].push({
        id   : data.id,
        name : data.name
      }); 

      io.sockets.in(data.room).emit("joined", { name : data.name, id : data.id, mems : mems[data.room]});     
    });

    //user request to leave room
    socket.on('leaved', (data)=>{
        socket.leave(data.room);
  
        let newData = mems[data.room].filter(item => {
          return item.id !== data.id;
        });

        mems[data.room] = newData;

        io.sockets.in(data.room).emit("leaved", { name : data.name, id : data.id, mems : mems[data.room] });      
    });

    // new Message sent
    socket.on('chat', (data) => {

      // Broadcast message to all user in room
      socket.broadcast.to(data.room).emit('news', { msg : data.msg, name : data.name })

    });

    socket.on('chatToId', (data)=>{
      socket.broadcast.to(data.id).emit('toYou', { msg : data.msg, name : data.name, id : data.info })
    });
});

const mems = {
  room_1 : [],
  room_2 : [],
  room_3 : []
};