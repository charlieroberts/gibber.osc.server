#Using gibber.osc.server

This node.js app is a simple translator between the WebSocket messages spoken by web pages and Open Sound Control messages. It is adapted from a server used in the [interface.js][interface] project. 

If you want to use the server, you'll need to have [node.js][nodejs] installed. Node.js will provide most of the functionality we need to serve web pages, but we'll also need to add a few utility libraries to send OSC and MIDI and carry out a few other specialized tasks. We can install these utilities using the Node Package Manager, or NPM, which is installed with Node.js. Open a terminal, cd into the directory where this README is located and run the following command:

```
npm install
```

Once these libraries are installed execute the following command to start the server: `node index`.

This will start the OSC server running on port 8080, which Gibber will connect to by default after running `OSC.init()`.

## Setup in Gibber

After starting the server, execute `OSC.init()` in Gibber to create a connection to it. At that point messages will be forwarded. Below is an example of the code needed to register to receive and send OSC messages:

```javascript

OSC.init()

OSC.callbacks[ '/startPerformance' ] = function( msg ) {
  a = Synth()
  a.note.seq( msg[0], msg[1] ) // all parameters are passed to the msg array
  console.log( msg[0], msg[1] )
}

// send to server's oscOutPort on localhost
OSC.send( '/test', 'is', [5,'testing'] ) 

// send to port 15000 on localhost
OSC.send( '/test', 'ifs', [5,.3,'testing'], 15000 ) 

// send to port 15000 at ip address 192.168.1.3
OSC.send( '/test', 'ifs', [5,.3,'testing'], 15000, '192.168.1.3' ) 
```

## Command Line Options
`--webSocketPort` : port to send / receive WebSocket messages on, defaults to 8080. If you change this, you need to also pass the port you use when initializing OSC in Gibber. For example, if you use port 9090, in Gibber you would write `OSC.init( 9090 )`.

`--oscInPort`     : This is the port that the server will receive OSC messages at; the messages will then be forwarded to Gibber as WebSocket messages. The default port is one higher than than the webSocketPort (8081 if the default webSocketPort is used).

`--oscOutPort`    : This is the port that the server will send OSC messages to by default; this can be overridden on a per message basis from the Gibber environment, however, if no port is provided for a message this port will be used. The default port is one higher than than the oscInPort (8082 if the default webSocketPort and default oscInPort is used).

[nodejs]:http://nodejs.org
[npm]:http://nodejs.org/download/
[interface]:http://www.charlie-roberts.com/interface/
