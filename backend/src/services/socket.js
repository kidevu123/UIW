// Socket.IO handlers for real-time features

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle chat events
    socket.on('typing_start', (data) => {
      socket.to(`user_${data.receiverId}`).emit('partner_typing', {
        senderId: data.senderId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`user_${data.receiverId}`).emit('partner_typing', {
        senderId: data.senderId,
        isTyping: false
      });
    });

    // Handle status updates
    socket.on('status_update', (data) => {
      socket.broadcast.emit('partner_status', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = {
  setupSocketHandlers
};