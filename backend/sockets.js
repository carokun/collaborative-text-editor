module.exports = {
  sockets: function(io) {
    io.on('connection', socket => {
      console.log('connected');
      socket.on('join', ({doc}) => {
        socket.emit('helloback');
        socket.join(doc);

        //save the room name key on the socket object
        socket.oneRoom = doc;

        socket.broadcast.to(doc).emit('userJoined')

      })
      socket.on('documentChange', currentState => {
          if (!currentState) {
            return socket.emit('errorMessage', 'No document!');
          }
          socket.broadcast.to(socket.oneRoom).emit('documentChange', currentState);
      });
      socket.on('highlight', currentState => {
          if (!currentState) {
            return socket.emit('errorMessage', 'No document!');
          }
          socket.broadcast.to(socket.oneRoom).emit('highlight', currentState);
      });
      socket.on('curser', compositeDecorator => {
          if (!compositeDecorator) {
            return socket.emit('errorMessage', 'No compositeDecorator!');
          }
          socket.broadcast.to(socket.oneRoom).emit('curser', compositeDecorator);
      });

      socket.on('disconnect', () => {
        console.log('socket disconnected');
        socket.broadcast.to(socket.oneRoom).emit('userLeft');
        socket.leave(socket.oneRoom);
      })
    })

  }
}
