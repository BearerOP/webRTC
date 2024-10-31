import React, { createContext, useContext, useEffect, useState } from 'react';
import Peer from 'peerjs';

const PeerContext = createContext();

export const usePeer = () => {
  return useContext(PeerContext);
};

export const PeerProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    const peerInstance = new Peer(); // Initialize PeerJS instance
    setPeer(peerInstance);

    return () => {
      peerInstance.destroy(); // Clean up on unmount
    };
  }, []);

  const createOffer = async () => {
    return new Promise((resolve, reject) => {
      peer.on('open', () => {
        const offer = peer.createOffer();
        resolve(offer);
      });
    });
  };

  const handleRemoteAnswer = (answer) => {
    peer.setRemoteDescription(answer);
  };

  const addStream = (stream) => {
    peer.addStream(stream);
  };

  return (
    <PeerContext.Provider value={{ peer, createOffer, handleRemoteAnswer, addStream }}>
      {children}
    </PeerContext.Provider>
  );
};
