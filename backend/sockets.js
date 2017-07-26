module.exports = {
  sockets: function(io) {
    io.on('connection', socket => {
      console.log('connected');
      socket.on('documentChange', currentState => {
          if (!currentState) {
            return socket.emit('errorMessage', 'No document!');
          }
          socket.broadcast.emit('documentChange', currentState);
      });
      socket.on('highlight', currentState => {
          if (!currentState) {
            return socket.emit('errorMessage', 'No document!');
          }
          socket.broadcast.emit('highlight', currentState);
      });
    })
  }
}
