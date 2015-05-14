var ws                = require('ws'),
    oscMin            = require( 'osc-min' ),
    parseArgs         = require( 'minimist' ),
    udp               = require( 'dgram' ),
    midi              = null,
    args              = parseArgs( process.argv.slice(2) ),
    socketPort        = args.webSocketPort || 8080,
    oscInPort         = args.oscInPort  || socketPort + 1,
    oscOutPort        = args.oscOutPort  || oscInPort + 1,
    clients_in        = new ws.Server({ port:socketPort }),
    client            = null,
    midiInit          = false,
    midiOut           = null,
    midiNumbers       = {
      "noteon"        : 0x90,
      "noteoff"       : 0x80,
      "cc"            : 0xB0,
      "programchange" : 0xC0,
    },
    osc;
    
if( args.useMIDI === true ) midi = require( 'midi' )

osc = udp.createSocket( 'udp4', function( _msg, rinfo ) {
  var msg = oscMin.fromBuffer( _msg )
    
  var tt = '',
      msgArgs = []
  
  for( var i = 0 ; i < msg.args.length; i++ ) {
    var arg = msg.args[ i ]
  
    tt += arg.type[ 0 ]
    msgArgs.push( arg.value )
  }
  

  client.send( JSON.stringify({ type:'osc', address:msg.address, typetags: tt, parameters:msgArgs }) )
  
})
osc.bind( oscInPort )

clients_in.on( 'connection', function ( socket ) {
  //console.log( "device connection received", socket.upgradeReq.headers );
  
  var clientIP = socket.upgradeReq.headers.origin.split( ':' )[ 1 ].split( '//' )[ 1 ]
  
  console.log("client connected:", clientIP )
  
  client = socket
  socket.ip = clientIP
  //socket.idNumber = idNumber++
  
  socket.on( 'message', function( obj ) {
    var msg = JSON.parse( obj );
    
    if(msg.type === 'OSC') {
      /*if( args.appendID ) {  // append client id
        msg.parameters.push( socket.idNumber )
      }*/
      var buf = oscMin.toBuffer({
        address: msg.address,
        args: msg.parameters
      })
      
      osc.send( buf, 0, buf.length, msg.port || oscOutPort, msg.ipAddress || 'localhost')
    }/*else if( msg.type === 'midi' && midi !== null ) {
      if( !midiInit ) {
        midiOutput = new midi.output();
        midiOutput.openVirtualPort( "Interface Output" );
        midiInit = true;
      }

      if(msg.type !== 'programchange') {
        midiOutput.sendMessage([ midiNumbers[ msg.midiType ] + msg.channel, msg.number, Math.round(msg.value) ])
      }else{
        midiOutput.sendMessage([ 0xC0 + msg.channel, msg.number])
      }
    }*/
  });
});