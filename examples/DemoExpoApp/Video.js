import React, { useRef, useEffect } from 'react';

export default ({ stream }) => {
  const videoRef = useRef();
  useEffect(() => {
    // console.log('Set srcObject', videoRef, stream);
    videoRef.current.srcObject = stream;
  }, [videoRef, stream])

  return (<video style={{ flex: 1, alignItems: 'stretch' }} autoPlay={true} ref={videoRef}/>)
}