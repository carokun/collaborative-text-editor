module.exports = {
  sockets: function(io) {
    const colors = ['red','cyan','yellow','green','blue','purple']
    const documentsToColors = {};
    io.on('connection', socket => {
      console.log('connected');
      socket.on('join', ({doc}) => {
        if (io.sockets.adapter.rooms[doc] 
            && io.sockets.adapter.rooms[doc].length >= 6) {
          socket.emit('roomFull');
        }
        else {
          // Join the room
          socket.join(doc);
          socket.oneRoom = doc; // Save the room name on the socket object
          // Assign a color
          let assignedColor = '';
          // if user joined empty room, create new key with all colors available
          if (!documentsToColors.hasOwnProperty(doc)) {
            documentsToColors[doc] = [...colors];
          }
          console.log("DOCUMENT TO COLORS: ", documentsToColors);
          // Assign next available color
          assignedColor = documentsToColors[doc].pop();
          const colorIndex = io.sockets.adapter.rooms[doc].length;
          console.log("ASSIGNED COLOR: ", assignedColor);
          socket.broadcast.to(doc).emit('userJoined');
          socket.emit('colorAssigned', assignedColor);
        }
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
      socket.on('unmounting', (color) => {
        console.log("unmounting component");
        documentsToColors[socket.oneRoom].push(color);
      })
      socket.on('disconnect', () => {
        console.log('socket disconnected');
        socket.broadcast.to(socket.oneRoom).emit('userLeft');
        socket.leave(socket.oneRoom);
      })
    })

  }
}
