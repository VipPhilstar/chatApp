import { Buffer } from 'buffer';
import net from 'net';
import { types } from './constants.js';

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

    this.sendMessage(
      socket,
      types.INITIAL,
      Buffer.from(`Welcome to "ChatApp"!`),
      'App'
    );
    this.sendBroadcastMessage(
      socket,
      types.CONNECT,
      Buffer.from(`${socket.nickname} joined this chat.`)
    );
  }

  onDisconnect(socket) {
    socket.on('end', () => {
      this.connections.delete(socket);
      this.sendBroadcastMessage(
        socket,
        types.DISCONNECT,
        Buffer.from(`${socket.nickname} left this chat!`)
      );
    });
  }

  onNewMessage(socket) {
    socket.on('data', (data) => {
      const parsedData = data.toString().replace(/\n$/, '');
      const message = parsedData;
      this.sendBroadcastMessage(socket, types.MESSAGE, Buffer.from(message));
    });
  }

  sendBroadcastMessage(socketFrom, type, message) {
    if (this.connections.size === 0) {
      console.log('Everyone left the chat');
      return;
    }

    console.log(message.toString());
    this.connections.forEach(function (socket) {
      if (socket.nickname === socketFrom.nickname) return;
      this.sendMessage(socket, type, message, socketFrom.nickname);
    }, this);
  }

  sendMessage(socket, type, message, nickname) {
    const meta = Buffer.alloc(1);
    meta[0] = type;
    const nicknameData = Buffer.alloc(256);
    nicknameData.write(nickname);
    console.log(nicknameData.toString());
    socket.write(Buffer.concat([meta, nicknameData, message]));
  }
}

const config = {
  port: 8080,
  userPrefix: 'User'
};
const server = new DuplexServer(config);
server.createServer().changeUserPrefix('Guest');
