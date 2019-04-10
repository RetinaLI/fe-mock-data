// let net = require('net');

// let socket = new net.Socket();

// socket.connect(4200, 'localhost');
// socket.on('data',function(data){
//   console.log('from server:'+ data);
//   //得到服务端返回来的数据
// });


const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4200/ws/data');

ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function incoming(data) {
  console.log(data);
});