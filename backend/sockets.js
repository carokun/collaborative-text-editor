module.exports = {
  sockets: function(io) {
    io.on('connection', socket => {
      console.log('connected');

    //   socket.on('document', requestedRoom => {
    //     socket.room = requestedRoom;
    //     socket.join(requestedRoom, () => {
    //       socket.to(requestedRoom).emit('message', {
    //         username: 'System',
    //         content: `${socket.username} has joined`
    //       });
    //     });
    //   });
    //
    //   socket.on('message', message => {
    //     if (!socket.room) {
    //       return socket.emit('errorMessage', 'No rooms joined!');
    //     }
    //     socket.to(socket.room).emit('message', {
    //       username: socket.username,
    //       content: message
    //     });
    //   })
    //
    //   socket.on('typing', message => {
    //     socket.broadcast.emit('typing', message);
    //   })
    // });
    })
  }
}
