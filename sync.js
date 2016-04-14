var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 4000 });


wss.broadcast = function(ws,data) {
  for (var i in this.clients){
    if( this.clients[i] == ws){
      // this.clients[i-1].send(data);

      var id;

      // user is impair => send data to user - 1
      // user is pair => send data to user + 1
      if( i%2 == 0){ id = i - -1; }
      else{ id = i - 1; }

      if(this.clients[id] != undefined){
        this.clients[id].send(data);
      }
    }
  }
};

wss.on('connection', function connection(ws) {
  updateClientCount();
  // console.log("WebSocket client connected (total : " + wss.clients.length + " )");
  
  // when a user send datas, do the following code
  ws.on('message', function incoming(message) {
    // console.log("Sending data to clients");
    wss.broadcast(ws,message);
  });

  ws.on('close', function socketClose(code, message) {
    updateClientCount();
  });

  ws.on('error', function socketError(error) {
    updateClientCount();
  });


});


function updateClientCount() {
  console.reset();
  console.log("--------------------------------------");
  console.log("------------- TFE Server -------------");
  console.log("--------------------------------------");
  console.log(" ");
  console.log(wss.clients.length + " client(s) connected")
  console.log(" ");
  console.log("Activity :");
}

console.reset = function () {
  return process.stdout.write('\033c');
};


updateClientCount();

// var WebSocket = require('ws');
// var ws = new WebSocket('ws://localhost:4000');


// // var fs = require('fs');

// // var filearg = process.argv[2];
// // var dumpUrl = filearg || 'dumps/test20-2.u.txt';

// var server = ws.createServer(function (conn) {
//   // console.log("Endpoint connected");
//   var isEditor = false;
//   var clientIndex = 0;

//   conn.on("close", function (code, reason) {
//     // console.log("Closing connexion for reason : " + reason);
//     // console.log("Closing code : " + code);
//     // console.log("Ref : " + conn);
//     // if (conn == editor) {
//     //   editor = null;
//     // }

//     // var i = clients.indexOf(conn)
//     // if (i > -1) {
//     //   console.log("Removing client");
//     //   clients.splice(i, 1);
//     // }

//     // console.log("Got " + clients.length + " client connected");
//     // if (editor != null) console.log("... and also an editor");
//   });

//   conn.on("text", function(str) {
//     switch (str) {
//       case "set-editor":
//         isEditor = true;
//         console.log("Connected to editor");
//         editor = conn;
//         break;

//       case "add-client":
//         if (clients.indexOf(conn) < 0) {
//           clients.push(conn);
//         }
//         break;

//       default:
//         if (conn == editor) {

//         } else {

//         }
//         break;
//     }

//     console.log("Got " + clients.length + " client connected");
//     if (editor != null) console.log("... and also an editor");
//   });


// }).listen(4000);
