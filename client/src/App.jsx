// client/src/App.js
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:5000");

function App() {
  const [myID, setMyID] = useState("");
  const [peers, setPeers] = useState([]);
  const userVideo = useRef();
  const peersRef = useRef([]);
  console.log(userVideo);
  console.log(peersRef);

  const roomID = "Abash-room"; // fixed room for now

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true  }).then((stream) => {
      console.log(stream);
      userVideo.current.srcObject  = stream;
      console.log(userVideo); 

      socket.emit("join-room", roomID);
      socket.on("user-joined", (userId) => {
        console.log("huuu");
        const peer = createPeer(userId, socket.id, stream);
        console.log(peer);  
        peersRef.current.push({ peerID: userId, peer });
        setPeers((users) => [...users, peer]);
      });

      socket.on("user-signal", (payload) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({ peerID: payload.callerID, peer });
        setPeers((users) => [...users, peer]);
      });

      socket.on("receiving-returned-signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });
    });

    socket.on("connect", () => {
      setMyID(socket.id);
    });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (signal) => {
      socket.emit("sending-signal", { userToSignal, callerID, signal });
    });
    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (signal) => {
      socket.emit("returning-signal", { signal, callerID });
    });
    peer.signal(incomingSignal);
    return peer;
  }

  return (
    <div>
      <h2>My ID: {myID}</h2>
      <video ref={userVideo} autoPlay playsInline muted style={{ width: "300px" }} />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </div>
  );
}

function Video({ peer }) {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline  style={{ width: "300px" }} />;
}

export default App;
