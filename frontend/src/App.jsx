
import { forwardRef, useRef, useState } from 'react'
import './App.css'
import { useEffect } from 'react'
import React from 'react'
import io from 'socket.io-client'
import { Peer } from "peerjs";

const VideoElement = forwardRef(({muted}, ref) => {
  return (
    <video ref={ref} autoPlay muted={muted} className="w-1/2 h-1/2"></video>
  )
})


function App() {
  const [myStream, setMyStream] = useState(null)
  const [otherStream, setOtherStream] = useState(new MediaStream());
  const [code, setCode] = useState('')
  // const myCode = Math.floor(Math.random() * 1000000).toString()
  const [myCode , setMyCode] = useState(Math.floor(Math.random() * 1000000).toString())
  const [video, setVideo] = useState(true)
  const [audio, setAudio] = useState(true)
  const [peer, setPeer] = useState(null);

  const myVidRef = useRef(null)
  const otherVideoRef = useRef(null)

  useEffect(() => {
    
    (async () => {
      const peer = new Peer(myCode);
      setPeer(peer);
      const stream = await navigator.mediaDevices.getUserMedia(
        { video: true, audio: true },
      );
      setMyStream(stream);
      myVidRef.current.srcObject = stream;
      peer.on("connection", (conn) => {
        conn.on("data", (data) => {
          // Will print 'hi!'
          console.log(data);
        });
        conn.on("open", () => {
          conn.send("hello!");
        });
      });
    
      peer.on("call", (call) => {
          call.answer(stream); // Answer the call with an A/V stream.
          call.on("stream", (stream) => {
            // Show stream in some <video> element.
            setOtherStream(stream);
            otherVideoRef.current.srcObject = stream;
          });
      });

    })();
    
  },[]);

  const handleMakeCall = async () => {
    const peerConnection = peer.connect(code);
    console.log("i connected to " + code);
    peerConnection.on("open", () => {
      peerConnection.send("hi!");
    });
    const call = peer.call(code, myStream);
    console.log("i called " + call);
    call.on("stream", (stream) => {
      setOtherStream(stream);
      otherVideoRef.current.srcObject = stream;
    })
    setPeerConnection(peerConnection);
  }

  const handleMute = () => {
    myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled;
  }

  const handleStopCamera = () => {
    myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled;
  }

  return (
    <>
      <h1 className="text-center text-green-500">Call Your Favourite Person by Sending Code.</h1>
      <div className="flex flex-col space-y-2 md:flex-row justify-center items-center md:space-x-4 mt-4">
        <div className="flex flex-col items-center">
          <label className="mb-2">You</label>
          <VideoElement ref={myVidRef} muted={true} />
        </div>
        <div className="flex flex-col items-center">
          <label className="mb-2">Other Person</label>
          <VideoElement ref={otherVideoRef} muted={false} />
        </div>
      </div>
      <div className='flex flex-col space-y-2 md:flex-row justify-center items-center md:space-x-4 mt-4'>
        <label htmlFor="code" className="block mt-4 mx-4 text-3xl pb-4">Enter Code</label>
        <input type="text" id='code' onChange={(e) => setCode(e.target.value)} className="block m-auto p-2 text-lg border-2"/>
      </div>
      <div className="flex flex-col space-y-2 md:flex-row justify-center items-center md:space-x-4 mt-4">
        <button className="p-2 text-lg bg-green-500 text-white rounded" onClick={() => navigator.clipboard.writeText(myCode)}>Copy Your Code</button>
        <button className="p-2 text-lg bg-green-500 text-white rounded" onClick={handleMakeCall}>Join Call</button>
        <button className="p-2 text-lg bg-red-500 text-white rounded" onClick={handleMute}>Mute/Unmute</button>
        <button className="p-2 text-lg bg-red-500 text-white rounded" onClick={handleStopCamera}>Stop/Start Camera</button>
      </div>
    </>
  )
  
}

export default App



// import { forwardRef, useRef, useState } from 'react'
// import './App.css'
// import { useEffect } from 'react'
// import React from 'react'
// import io from 'socket.io-client'
// import { Peer}

// const VideoElement = forwardRef((props, ref) => {
//   return (
//     <video ref={ref} autoPlay className="w-1/2 h-1/2"></video>
//   )
// })


// function App() {
//   const [myStream, setMyStream] = useState(null)
//   const [otherStream, setOtherStream] = useState(new MediaStream());
//   const [code, setCode] = useState('')
//   // const myCode = Math.floor(Math.random() * 1000000).toString()
//   const [myCode , setMyCode] = useState(Math.floor(Math.random() * 1000000).toString())
//   console.log("My Code: ", myCode)
//   const [video, setVideo] = useState(true)
//   const [audio, setAudio] = useState(true)
//   const [otherAudio, setOtherAudio] = useState(true)
//   const [otherVideo, setOtherVideo] = useState(true)
//   const [socket, setSocket] = useState(null)
//   const [peerConnection, setPeerConnection] = useState(null)

//   // TODO: tooltip for my code and copy to clipboard 


//   const myVidRef = useRef(null)
//   const otherVideoRef = useRef(null)

//   const turnOnCamera = () => {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//     .then((stream) => {
//       console.log("My Stream: ", stream)
//       myVidRef.current.srcObject = stream
//       setMyStream(stream)
//     })
//     .catch((err) => {
//       console.log("Error: ", err)
//     })
//   }

//   const startup = async () => {
//     const sock = io('http://localhost:5001');
//     sock.on('connect', () => {
//       console.log('Connected to server');
//     });
//     sock.on('disconnect', () => {
//       console.log('Disconnected from server');
//     })
//     sock.emit('join', myCode);

//     const peerConnection = new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: 'stun:stun.l.google.com:19302',
//         },
//       ],
//     });

//     peerConnection.createDataChannel('chat');
//     setPeerConnection(peerConnection);
//     setSocket(sock);
//   }

//   useEffect(() => {
//     startup();
//   },[]) ;

//   useEffect(() => {
//    if(socket){
//     socket.on('offer-made', async ({data}) => {
//       console.log("Offer Made: ", data.offer, "with code ", data.code , " from My Code: ", data.myCode);
//       setCode(data.myCode);
     
//       peerConnection.ontrack = (event) => {
//         console.log("On Track: ", event);
//         setOtherStream(event.streams[0]);
//       };  
      
//       await peerConnection.setRemoteDescription(data.offer);
//       const answer = await peerConnection.createAnswer();
//       console.log("Answer: ", answer , "to" , data.myCode);
//       await peerConnection.setLocalDescription(answer);

//       socket.emit('make-answer', { answer, code : data.myCode });
//     })
//     socket.on('answer-made', async (data) => {
//       console.log("answer-made", data)
//       await peerConnection.setRemoteDescription(data);
//       console.log("Other Stream: ", otherStream);
//       otherVideoRef.current.srcObject = otherStream;
//     })
//    }
//   },[socket]);


//   const handleMakeCall = async () => {
//     console.log("Making Call " + code );
//     console.log("Making Call " + myStream);
//     if(!myStream) return;
//     myStream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, myStream);
//     });

//     peerConnection.ontrack = (event) => {
//       if(event.streams && event.streams[0])
//         setOtherStream(event.streams[0]);
//     };
//     // console.log(socket);

//     const offer = await peerConnection.createOffer();
//     console.log("Offer: ", offer);
//     await peerConnection.setLocalDescription(offer);

//     const data = {
//       code,
//       offer,
//       myCode
//     };
//     socket.emit('create-offer', data);  
//   }



//   return (
//     <>
//       <h1 className="text-center text-green-500">Call Your Favourite Person by Sending Code.</h1>
//       <button onClick={turnOnCamera}>Turn on Camera</button>
//       <div className="flex justify-center items-center">
//         <VideoElement ref={myVidRef} controls={true} />
//         <VideoElement ref={otherVideoRef} controls={true} />
//       </div>
//       <label htmlFor="code">Enter Code</label>
//       <input type="text" id='code' onChange={(e) => setCode(e.target.value)} className="block m-auto p-2 text-lg border-2 mb-4"/>
//       <div className="flex justify-center items-center space-x-4">
//         <button className="p-2 text-lg bg-green-500 text-white rounded" onClick={() => navigator.clipboard.writeText(myCode)}>Copy Your Code</button>
//         <button className="p-2 text-lg bg-green-500 text-white rounded" onClick={handleMakeCall}>Join Call</button>
//       </div>
//     </>
//   )
// }

// export default App
