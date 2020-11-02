import net from 'net';

export class DuplexServer {
  constructor(config) {
    this.guestId = 0;
    this.connections = new Set();
    this.port = config.port;
    this.userPrefix = config.userPrefix;
  }

  createServer() {
    net
      .createServer((socket) => {
        this.onConnect(socket);
        this.onNewMessage(socket);
        this.onDisconnect(socket);
      })
      .on('close', () => {
        console.log('server stop on port: ', this.port);
      })
      .on('error', () => {
        console.error('server error');
      })
      .listen(this.port, () => {
        console.log('server start on port: ', this.port);
      });
    return this;
  }

  changeUserPrefix(prefix) {
    this.userPrefix = prefix;
    return this;
  }

  onConnect(socket) {
    this.guestId++;
    socket.nickname = this.userPrefix + this.guestId;
    this.connections.add(socket);

    this.sendMessage(socket, `Welcome to "ChatApp"!`);
    this.sendBroadcastMessage(socket, `${socket.nickname} joined this chat.`);
  }

  onDisconnect(socket) {
    socket.on('end', () => {
      this.connections.delete(socket);
      this.sendBroadcastMessage(socket, `${socket.nickname} left this chat!`);
    });
  }

  onNewMessage(socket) {
    socket.on('data', (data) => {
      const parsedData = data.toString().replace(/\n$/, '');
      const message = `${socket.nickname} ${parsedData}`;
      this.sendBroadcastMessage(socket, message);
    });
  }

  sendBroadcastMessage(socketFrom, message) {
    if (this.connections.size === 0) {
      console.log('Everyone left the chat');
      return;
    }

    console.log(message);
    this.connections.forEach(function (socket) {
      if (socket.nickname === socketFrom.nickname) return;
      this.sendMessage(socket, message);
    }, this);
  }

  sendMessage(socket, message) {
    socket.write(message);
  }
}

const config = {
  port: 8080,
  userPrefix: 'User'
};
const server = new DuplexServer(config);
server.createServer().changeUserPrefix('Guest');
