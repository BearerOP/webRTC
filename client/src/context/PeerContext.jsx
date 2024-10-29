import { createContext, useContext, useState,useMemo } from "react";

const PeerContext = createContext(null);

export const usePeer = () => {
    return useContext(PeerContext);
};


export const createOffer = async (peer) => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
};

export const PeerProvider = ({ children }) => {


    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            {
                urls: ["stun:stun.l.google.com:19302"],
            },
        ],
    }),[]);


    return (
        <PeerContext.Provider value={{ peer }}>
            {children}
        </PeerContext.Provider>
    );
};


export default PeerContext;