module.exports = {
  sockets: function(io) {
    io.on('connection', socket => {
      console.log('connected');
      socket.on('documentChange', currentState => {
          if (!currentState) {
            return socket.emit('errorMessage', 'No document!');
          }
          console.log('curr', currentState);
          socket.broadcast.emit('documentChange', currentState);
      });
    })
  }
}
