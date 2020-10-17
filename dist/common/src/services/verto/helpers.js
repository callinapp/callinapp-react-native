module.exports={sdpStereoHack:sdpStereoHack};function sdpStereoHack(sdp){var lineBreak='\r\n';var sdpLines=sdp.split(lineBreak);var opusIndex=sdpLines.findIndex(function(line){return /^a=rtpmap/.test(line)&&/opus\/48000/.test(line)&&!/stereo=1/.test(line);});if(opusIndex<0){return sdp;}var opusPayload=getCodecPayloadType(sdpLines[opusIndex]);var fmtpReg=new RegExp("^a=fmtp:"+opusPayload);var fmtpLineIndex=sdpLines.findIndex(function(line){return fmtpReg.test(line)&&!/stereo=1/.test(line);});if(fmtpLineIndex<0){sdpLines[opusIndex]=""+sdpLines[opusIndex]+lineBreak+"a=fmtp:"+opusPayload+" stereo=1; sprop-stereo=1";}else{sdpLines[fmtpLineIndex]=sdpLines[fmtpLineIndex]+"; stereo=1; sprop-stereo=1";}return sdpLines.join(lineBreak);}function getCodecPayloadType(sdpLine){var matches=sdpLine.match(/a=rtpmap:(\d+) \w+\/\d+/);return matches&&matches.length>1?matches[1]:null;}