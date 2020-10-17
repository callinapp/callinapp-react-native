var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=void 0;var _extends2=_interopRequireDefault(require("@babel/runtime/helpers/extends"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _constants=require("./constants");var _verto=require("./services/verto");var _helpers=require("./helpers");var _webrtc=require("./services/webrtc");var defaultCallOptions={callID:null,destinationNumber:null,callerIdName:null,callerIdNumber:null,callType:_constants.CallType.OUTBOUND,useAudio:null,useVideo:null,useStereo:true,screenShare:false,userVariables:{},iceServers:true,attach:false,sdp:null,localStream:null,cause:null,causeCode:null,remote_caller_id_name:null,remote_caller_id_number:null,destination_number:null,caller_id_name:null,caller_id_number:null,display_direction:null,callee_id_name:null,callee_id_number:null,audioParams:{autoGainControl:true,echoCancellation:true,noiseSuppression:true},videoParams:{}};var BaseCall=function(){(0,_createClass2.default)(BaseCall,[{key:"callType",get:function get(){return this._options.callType;}},{key:"options",get:function get(){var tmp={};for(var key in this._options){if(!key.includes('_')){tmp[key]=this._options[key];}}return tmp;}},{key:"isConference",get:function get(){for(var conference in this._session.activeConferences){if(conference.call&&conference.call.id===this.id){return true;}}return false;}}]);function BaseCall(session,options){(0,_classCallCheck2.default)(this,BaseCall);this.id=null;this.localStream=null;this.remoteStream=null;this.state=_constants.CallState.NEW;this.activeTime=null;this.screenShareCall=null;this._rtc=null;this._options=(0,_extends2.default)({},defaultCallOptions,options);this._preprocessCallOptions();this._session=session;this.id=this._options.callID;if(!this.id){this._options.callID=this.id=(0,_helpers.generateUUID)();}this._onICESdpError=this._onICESdpError.bind(this);this._onICESdpDescription=this._onICESdpDescription.bind(this);this._onLocalStream=this._onLocalStream.bind(this);this._onRemoteStream=this._onRemoteStream.bind(this);this._onRemoteStreamEnded=this._onRemoteStreamEnded.bind(this);this._onUserMediaError=this._onUserMediaError.bind(this);this._rtcCallbacks={onICESdpError:this._onICESdpError,onICESdpDescription:this._onICESdpDescription,onLocalStream:this._onLocalStream,onRemoteStream:this._onRemoteStream,onRemoteStreamEnded:this._onRemoteStreamEnded,onUserMediaError:this._onUserMediaError};}(0,_createClass2.default)(BaseCall,[{key:"setState",value:function setState(newState){console.debug("[Call]["+this.id+"] State change "+this.state+" -> "+newState);this.state=newState;!this._options.screenShare&&this._session._onCallStateUpdate(this);}},{key:"_createAudio",value:function _createAudio(audio){if(!audio){return false;}if(typeof this._options.audioParams==='object'){if(typeof audio==='object'){return(0,_extends2.default)({},audio,this._options.audioParams);}return(0,_extends2.default)({},this._options.audioParams);}return audio;}},{key:"_createVideo",value:function _createVideo(video){if(!video){return false;}if(typeof this._options.videoParams==='object'){if(typeof video==='object'){return(0,_extends2.default)({},video,this._options.videoParams);}return(0,_extends2.default)({},this._options.videoParams);}return video;}},{key:"_validateInputDevices",value:function _validateInputDevices(){var _this=this;var promises=[];if(!this._options.screenShare&&!this._options.localStream){if(this._options.useAudio===null){var audioValidation=(0,_webrtc.enumerateDevices)('audioinput').then(function(devices){return _this._options.useAudio=_this._createAudio(devices.length>0);}).catch(function(e){return _this._options.useAudio=false;});promises.push(audioValidation);}else{promises.push(Promise.resolve(this._options.useAudio=this._createAudio(this._options.useAudio)));}if(this._options.useVideo===null){var videoValidation=(0,_webrtc.enumerateDevices)('videoinput').then(function(devices){return _this._options.useVideo=_this._createVideo(devices.length>0);}).catch(function(e){return _this._options.useVideo=false;});promises.push(videoValidation);}else{promises.push(Promise.resolve(this._options.useVideo=this._createVideo(this._options.useVideo)));}}else{promises.push(Promise.resolve(this._options.useAudio));promises.push(Promise.resolve(this._options.useVideo));}return Promise.all(promises);}},{key:"_preprocessCallOptions",value:function _preprocessCallOptions(){if(!this._options.caller_id_name){this._options.caller_id_name=this._options.callerIdName;}else{this._options.callerIdName=this._options.caller_id_name;}if(!this._options.caller_id_number){this._options.caller_id_number=this._options.callerIdNumber;}else{this._options.callerIdNumber=this._options.caller_id_number;}if(!this._options.destination_number){this._options.destination_number=this._options.destinationNumber;}else{this._options.destinationNumber=this._options.destination_number;}if(this._options.display_direction==="outbound"){!this._options.remote_caller_id_name&&(this._options.remote_caller_id_name=this._options.caller_id_name);!this._options.remote_caller_id_number&&(this._options.remote_caller_id_number=this._options.caller_id_number);}else{!this._options.remote_caller_id_name&&(this._options.remote_caller_id_name=this._options.callee_id_name);!this._options.remote_caller_id_number&&(this._options.remote_caller_id_number=this._options.callee_id_number);}}},{key:"_updateCallOptions",value:function _updateCallOptions(options){if(options&&typeof options==='object'){this._options=(0,_extends2.default)({},this._options,options);}this.state===_constants.CallState.ACTIVE&&this._session._onCallOptionsUpdate(this);}},{key:"_onICESdpError",value:function _onICESdpError(e){console.log('[Call][_onICESdpError]',e);this._session._onUserPeerError(e);}},{key:"_onICESdpDescription",value:function _onICESdpDescription(sdpDescription){var _this2=this;console.log('[Call][_onICESdpDescription]',sdpDescription);var sdp=sdpDescription.sdp;var params={sdp:sdp,dialogParams:this._options};var request=null;if(this._rtc.peerType===_constants.PeerType.OFFER){if(this.state===_constants.CallState.ACTIVE){request=new _verto.VertoRequest(_verto.VertoMethod.ATTACH,params);}else{this.setState(_constants.CallState.REQUESTING);request=new _verto.VertoRequest(_verto.VertoMethod.INVITE,params);}}else if(this._rtc.peerType===_constants.PeerType.ANSWER){if(this._options.attach){request=new _verto.VertoRequest(_verto.VertoMethod.ATTACH,params);}else{this.setState(_constants.CallState.ANSWERING);request=new _verto.VertoRequest(_verto.VertoMethod.ANSWER,params);}}if(request){this._session.send(request).then(function(result){if(_this2._rtc.peerType===_constants.PeerType.OFFER){_this2.setState(_constants.CallState.TRYING);}else{_this2.setState(_constants.CallState.ACTIVE);}}).catch(function(ex){_this2.hangup();});}}},{key:"_onLocalStream",value:function _onLocalStream(stream){console.log("[Call][_onLocalStream] ",stream);this.localStream=stream;!this._options.screenShare&&this._session._onCallLocalStream(this);}},{key:"_onRemoteStream",value:function _onRemoteStream(stream){console.log("[Call][_onRemoteStream] ",stream);this.remoteStream=stream;!this._options.screenShare&&this._session._onCallRemoteStream(this);}},{key:"_onRemoteStreamEnded",value:function _onRemoteStreamEnded(stream){console.log("[Call][_onRemoteStreamEnded] ",stream);this.remoteStream=null;!this._options.screenShare&&this._session._onCallRemoteStream(this);}},{key:"_onUserMediaError",value:function _onUserMediaError(e){this.hangup({cause:'USER_MEDIA_ERROR'});this._session._onUserMediaError(e);}},{key:"_closeLocalStream",value:function _closeLocalStream(){if(this.localStream){var tracks=this.localStream.getTracks();tracks.forEach(function(track){return track.stop();});}!this._options.screenShare&&this._onLocalStream(null);}},{key:"invite",value:function invite(){var _this3=this;this._validateInputDevices().then(function(results){_this3._rtc=new _verto.FSRTC((0,_extends2.default)({},_this3._options,{peerType:_constants.PeerType.OFFER,callbacks:_this3._rtcCallbacks}));});}},{key:"setEarlyMedia",value:function setEarlyMedia(sdp){this.setState(_constants.CallState.EARLY);this.setRemoteAnswer(sdp);}},{key:"setRemoteAnswer",value:function setRemoteAnswer(sdp){var answerSdpDescription={sdp:sdp,type:_constants.PeerType.ANSWER};this._rtc.setRemoteDescription(answerSdpDescription);}},{key:"updateRemoteDisplay",value:function updateRemoteDisplay(data){if(data){var options={};data.display_name&&(options.remote_caller_id_name=data.display_name);data.display_number&&(options.remote_caller_id_number=data.display_number);data.display_direction&&(options.display_direction=data.display_direction);data.callee_id_name&&(options.callee_id_name=data.callee_id_name);data.callee_id_number&&(options.callee_id_number=data.callee_id_number);this._updateCallOptions(options);}}},{key:"answer",value:function answer(data){var _this4=this;this._validateInputDevices().then(function(results){if(_this4._options.callType===_constants.CallType.INBOUND){if(typeof data==='object'){data.calleeIdName?_this4._options.callee_id_name=data.calleeIdName:null;data.calleeIdNumber?_this4._options.callee_id_number=data.calleeIdNumber:null;}else{console.log('[Answer]',_this4._session._options.callOptions.callerIdName,_this4._session._options.callOptions.callerIdName);_this4._options.callee_id_name=_this4._session._options.callOptions.callerIdName||_this4._session._options.username;_this4._options.callee_id_number=_this4._session._options.callOptions.callerIdNumber||_this4._session._options.username;}}_this4._rtc=new _verto.FSRTC((0,_extends2.default)({},_this4._options,{peerType:_constants.PeerType.ANSWER,callbacks:_this4._rtcCallbacks}));});}},{key:"hangup",value:function hangup(data){var _this5=this;if(this.state>=_constants.CallState.HANGUP&&this.state!==_constants.CallState.PURGE){console.log("[Call] Hangup ignored because the call has been already hanged up.");return;}if(!data){this._options.cause='NORMAL_CLEARING';this._options.causeCode=16;}else{this._options.cause=data.cause||'NORMAL_CLEARING';this._options.causeCode=data.causeCode||16;}if(this.state===_constants.CallState.PURGE){this._cleanCall();return;}this.setState(_constants.CallState.HANGUP);var byeRequest=new _verto.VertoRequest(_verto.VertoMethod.BYE,{dialogParams:this._options});this._session.send(byeRequest).then(function(result){console.log("[Call][ByeRequest] "+byeRequest.toString(),result);}).catch(function(ex){console.error("[Call][ByeRequest] "+byeRequest.toString(),ex);}).finally(function(){_this5.setState(_constants.CallState.DESTROYED);_this5._cleanCall();});}},{key:"_cleanCall",value:function _cleanCall(){this._rtc&&this._rtc.close();this._closeLocalStream();this.screenShareCall&&this.screenShareCall.hangup();}},{key:"changeInputMedia",value:function changeInputMedia(inputs){var _this6=this;this._options=(0,_extends2.default)({},this._options,inputs);this._validateInputDevices().then(function(){_this6._updateCallOptions();_this6._rtc.changeMediaConstraints({useAudio:_this6._options.useAudio,useVideo:_this6._options.useVideo});});}},{key:"_setMuteMic",value:function _setMuteMic(value){if(this.localStream){var enabled=!value;var audioTracks=this.localStream.getAudioTracks();audioTracks.forEach(function(track){if(value===null||value===undefined){enabled=!track.enabled;}track.enabled=enabled;});if(this._findAssociatedConfName()){this.sendDtmf('0');}return!enabled;}return false;}},{key:"toggleMuteMic",value:function toggleMuteMic(){return this._setMuteMic();}},{key:"muteMic",value:function muteMic(){this._setMuteMic(true);}},{key:"unmuteMic",value:function unmuteMic(){this._setMuteMic(false);}},{key:"_setMuteCam",value:function _setMuteCam(value){if(this.localStream){var enabled=!value;var videoTracks=this.localStream.getVideoTracks();videoTracks.forEach(function(track){if(value===null||value===undefined){enabled=!track.enabled;}track.enabled=enabled;});if(this._findAssociatedConfName()){this.sendDtmf('*0');}return!enabled;}return false;}},{key:"toggleMuteCam",value:function toggleMuteCam(){return this._setMuteCam();}},{key:"muteCam",value:function muteCam(){this._setMuteCam(true);}},{key:"unmuteCam",value:function unmuteCam(){this._setMuteCam(false);}},{key:"sendDtmf",value:function sendDtmf(digits){var params={dtmf:digits,dialogParams:this._options};var request=new _verto.VertoRequest(_verto.VertoMethod.INFO,params);this._session.send(request).then(function(re){return console.debug("[DTMF] "+digits,re);});}},{key:"_setHold",value:function _setHold(value){var self=this;var action='hold';if(value===null||value===undefined){action='toggleHold';}else if(!value){action='unhold';}var params={action:action,dialogParams:this._options};var request=new _verto.VertoRequest(_verto.VertoMethod.MODIFY,params);this._session.send(request).then(function(response){var holdState=response.holdState;console.log('[Call] Hold',response);if(holdState==='held'){self.setState(_constants.CallState.HELD);}else if(holdState==='active'){self.setState(_constants.CallState.ACTIVE);}}).catch(function(e){console.error('[Call] Failed to set hold call');});}},{key:"hold",value:function hold(){this._setHold(true);}},{key:"unhold",value:function unhold(){this._setHold(false);}},{key:"toggleHold",value:function toggleHold(){this._setHold();}},{key:"_findAssociatedConfName",value:function _findAssociatedConfName(){var _this7=this;return Object.keys(this._session.activeConferences).find(function(confName){return _this7._session.activeConferences[confName].call&&_this7._session.activeConferences[confName].call.id===_this7.id;});}}]);return BaseCall;}();exports.default=BaseCall;