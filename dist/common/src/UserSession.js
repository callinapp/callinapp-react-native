var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=void 0;var _extends2=_interopRequireDefault(require("@babel/runtime/helpers/extends"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _helpers=require("./helpers");var _constants=require("./constants");var _EventHandler=_interopRequireDefault(require("./services/EventHandler"));var _storage=require("./services/storage");var _verto=require("./services/verto");var _Connection=_interopRequireDefault(require("./Connection"));var _Call=_interopRequireDefault(require("./Call"));var _Conference=_interopRequireDefault(require("./Conference"));var defaultOptions={username:null,password:null,userInfo:null,wssUrl:null,autoReconnect:true,autoRecoveryCall:true,callOptions:null};var UserSession=function(){(0,_createClass2.default)(UserSession,[{key:"isReady",get:function get(){return this.connection&&this.connection.isConnected;}},{key:"isLoggedIn",get:function get(){return this.isReady&&this._isLoggedIn;}}]);function UserSession(options){(0,_classCallCheck2.default)(this,UserSession);this.id=null;this.activeCalls={};this.activeConferences={};this._delayedEvents=[];this._isLoggedIn=false;this._init=this._init.bind(this);this._onSocketOpen=this._onSocketOpen.bind(this);this._onSocketError=this._onSocketError.bind(this);this._onSocketClose=this._onSocketClose.bind(this);this._onSocketMessage=this._onSocketMessage.bind(this);this._handleVertoMessage=this._handleVertoMessage.bind(this);this._handleVertoEvent=this._handleVertoEvent.bind(this);this._recoveryCall=this._recoveryCall.bind(this);this._login=this._login.bind(this);this._onCallLocalStream=this._onCallLocalStream.bind(this);this._onCallRemoteStream=this._onCallRemoteStream.bind(this);this._onCallStateUpdate=this._onCallStateUpdate.bind(this);this._onCallOptionsUpdate=this._onCallOptionsUpdate.bind(this);this._onConferenceJoined=this._onConferenceJoined.bind(this);this._onConferenceLeft=this._onConferenceLeft.bind(this);this._onConferenceMemberJoined=this._onConferenceMemberJoined.bind(this);this._onConferenceMemberLeft=this._onConferenceMemberLeft.bind(this);this._onConferenceMemberUpdated=this._onConferenceMemberUpdated.bind(this);this._onConferenceMemberCleared=this._onConferenceMemberCleared.bind(this);this._onConferenceChatMessage=this._onConferenceChatMessage.bind(this);this._restoreSession(options);}(0,_createClass2.default)(UserSession,[{key:"_restoreSession",value:function _restoreSession(options){var self=this;_storage.localStorage.getItem('sessionId').then(function(savedSessionId){console.log('Session saved',savedSessionId);if(!savedSessionId){savedSessionId=(0,_helpers.generateUUID)();_storage.localStorage.setItem('sessionId',savedSessionId);console.log('Session set',savedSessionId);}self.id=savedSessionId;self._init(options);});}},{key:"_init",value:function _init(options){this._options=(0,_extends2.default)({},defaultOptions,options);this._options.username=this._options.extension+"@"+this._options.domain;if(!this._options.callOptions){this._options.callOptions={callerIdName:this._options.extension,callerIdNumber:this._options.extension};}else{!this._options.callOptions.callerIdName&&(this._options.callOptions.callerIdName=this._options.extension);!this._options.callOptions.callerIdNumber&&(this._options.callOptions.callerIdNumber=this._options.extension);}this._connectionOptions={wssUrl:this._options.wssUrl,sessionId:this.id};this._loginData={login:this._options.username,passwd:this._options.password,userVariables:this._options.userInfo};this._autoReconnect=this._options.autoReconnect;this.connection=new _Connection.default(this._connectionOptions);this._subscribeDelayedEvents();this._subscribeSocketEvents();}},{key:"connect",value:function connect(){if(this.id){this._connect();return;}var self=this;var t=setInterval(function(){if(!self.id){return;}self._connect();clearInterval(t);},100);}},{key:"_connect",value:function _connect(){if(!this.connection){this.connection=new _Connection.default(this._connectionOptions);this._subscribeSocketEvents();}this.connection.connect();}},{key:"close",value:function close(){var _this=this;var keepSession=arguments.length>0&&arguments[0]!==undefined?arguments[0]:false;console.log('[UserSession] FORCE close socket connection');if(!keepSession){_storage.localStorage.removeItem('sessionId');Object.keys(this.activeCalls).forEach(function(id){_this.activeCalls[id].hangup();});}else{Object.keys(this.activeCalls).forEach(function(id){_this.activeCalls[id].setState(_constants.CallState.PURGE);_this.activeCalls[id].hangup({cause:'PURGE',causeCode:'01'});});}this.activeCalls={};this._resetAutoReconnect(false);this._unsubscribeSocketEvents();this._stopConference();this.connection&&this.connection.close();this.connection=null;this.emit(_constants.CallInAppEvent.ON_CLOSED,null,null);}},{key:"_resetAutoReconnect",value:function _resetAutoReconnect(){var autoReconnect=arguments.length>0&&arguments[0]!==undefined?arguments[0]:false;if(this._reconnectTimeout){clearTimeout(this._reconnectTimeout);this._reconnectTimeout=null;}this._autoReconnect=autoReconnect;}},{key:"_subscribeDelayedEvents",value:function _subscribeDelayedEvents(){while(this._delayedEvents.length>0){var _this$_delayedEvents$=this._delayedEvents.shift(),event=_this$_delayedEvents$.event,callback=_this$_delayedEvents$.callback;this.on(event,callback);}}},{key:"_subscribeSocketEvents",value:function _subscribeSocketEvents(){this._unsubscribeSocketEvents();this.on(_constants.SocketEvent.ON_OPEN,this._onSocketOpen);this.on(_constants.SocketEvent.ON_CLOSE,this._onSocketClose);this.on(_constants.SocketEvent.ON_ERROR,this._onSocketError);this.on(_constants.SocketEvent.ON_MESSAGE,this._onSocketMessage);}},{key:"_unsubscribeSocketEvents",value:function _unsubscribeSocketEvents(){this.off(_constants.SocketEvent.ON_OPEN,this._onSocketOpen);this.off(_constants.SocketEvent.ON_CLOSE,this._onSocketClose);this.off(_constants.SocketEvent.ON_ERROR,this._onSocketError);this.off(_constants.SocketEvent.ON_MESSAGE,this._onSocketMessage);}},{key:"_onSocketOpen",value:function _onSocketOpen(err,data){console.log('[UserSession][Socket] Open',data);this.emit(_constants.CallInAppEvent.ON_READY,null,data);this._resetAutoReconnect(this._options.autoReconnect);this._login();}},{key:"_onSocketClose",value:function _onSocketClose(err,data){var _this2=this;console.warn('[UserSession][Socket] Close');if(this._autoReconnect){this.emit(_constants.CallInAppEvent.ON_RETRYING,err,data);var reconnectTime=(0,_helpers.getRandomInt)(3,8)*1000;console.warn("[UserSession][Socket] Connection will retry after "+reconnectTime+" milliseconds");this._reconnectTimeout=setTimeout(function(){_this2.connect();},reconnectTime);}}},{key:"_onSocketError",value:function _onSocketError(err,data){console.error('[UserSession][Socket] Error',err);this.emit(_constants.CallInAppEvent.ON_ERROR,err,data);}},{key:"_onSocketMessage",value:function _onSocketMessage(err,message){var vertoMessage=_verto.VertoMessage.parse(message);if(vertoMessage){console.debug('[UserSession][Socket] Verto Message',vertoMessage);this._handleVertoMessage(message);}else{console.debug('[UserSession][Socket] Unhandled Message',message);}}},{key:"_onCallRemoteStream",value:function _onCallRemoteStream(call){this.emit(_constants.CallInAppEvent.ON_CALL_REMOTE_STREAM,null,call);}},{key:"_onCallLocalStream",value:function _onCallLocalStream(call){this.emit(_constants.CallInAppEvent.ON_CALL_LOCAL_STREAM,null,call);}},{key:"_onCallStateUpdate",value:function _onCallStateUpdate(call){switch(call.state){case _constants.CallState.DESTROYED:{this._clearSavedCallInfo(call.id);delete this.activeCalls[call.id];break;}case _constants.CallState.ACTIVE:{if(!call.activeTime){call.activeTime=Date.now();}this._saveCallInfo(call);break;}}this.emit(_constants.CallInAppEvent.ON_CALL_STATE_UPDATE,null,call);}},{key:"_onCallOptionsUpdate",value:function _onCallOptionsUpdate(call){this._saveCallInfo(call);}},{key:"_onUserMediaError",value:function _onUserMediaError(err){this.emit(_constants.CallInAppEvent.ON_USER_MEDIA_ERROR,err,null);}},{key:"_onUserPeerError",value:function _onUserPeerError(err){this.emit(_constants.CallInAppEvent.ON_USER_PEER_ERROR,err,null);}},{key:"_handleVertoMessage",value:function _handleVertoMessage(message){var params=message.params;var call=this.activeCalls[params.callID];if(!call){for(var callId in this.activeCalls){if(this.activeCalls[callId].screenShareCall&&this.activeCalls[callId].screenShareCall.id===params.callID){call=this.activeCalls[callId].screenShareCall;break;}}}switch(message.method){case _verto.VertoMethod.MEDIA:call&&params.sdp&&call.setEarlyMedia(params.sdp);break;case _verto.VertoMethod.ANSWER:if(call&&params.sdp){call.setState(_constants.CallState.ACTIVE);call.setRemoteAnswer(params.sdp);}break;case _verto.VertoMethod.DISPLAY:call&&call.updateRemoteDisplay(params);break;case _verto.VertoMethod.BYE:call&&call.hangup(message.params);break;case _verto.VertoMethod.INVITE:var incomingCall=this._createIncomingCall(params);this.emit(_constants.CallInAppEvent.ON_INCOMING_CALL,null,incomingCall);break;case _verto.VertoMethod.ATTACH:this._recoveryCall(params);break;case _verto.VertoMethod.PUNT:break;case _verto.VertoMethod.INFO:var body=params.body;var from=params.from_msg_name||params.from;if(!body){console.log('Empty chat message from',from);return;}this.emit(_constants.CallInAppEvent.ON_CHAT_MESSAGE,null,{from:from,body:body});break;case _verto.VertoMethod.EVENT:this._handleVertoEvent(params);break;default:break;}}},{key:"_handleVertoEvent",value:function _handleVertoEvent(eventParams){var eventChannel=eventParams.eventChannel,eventType=eventParams.eventType,pvtData=eventParams.pvtData,data=eventParams.data,eventData=eventParams.eventData;if(eventChannel){if(eventType==='channelPvtData'&&typeof pvtData==='object'){var laName=pvtData.laName,callID=pvtData.callID;if(pvtData.action==='conference-liveArray-join'){if(!this.activeConferences[laName]){this.activeConferences[laName]=new _Conference.default(this,this.activeCalls[callID],(0,_extends2.default)({},pvtData));}}else if(pvtData.action==='conference-liveArray-part'){this._stopConference(laName);}}else{this.emit(eventChannel,null,data||eventData||{});}}}},{key:"_stopConference",value:function _stopConference(name){var _this3=this;if(!name){Object.keys(this.activeConferences).forEach(function(confName){_this3.activeConferences[confName].destroy();delete _this3.activeConferences[confName];});return;}if(this.activeConferences[name]){this.activeConferences[name].destroy();delete this.activeConferences[name];}}},{key:"_onConferenceJoined",value:function _onConferenceJoined(conference){this.emit(_constants.CallInAppEvent.ON_CONFERENCE_JOINED,null,conference);}},{key:"_onConferenceLeft",value:function _onConferenceLeft(conference){this.emit(_constants.CallInAppEvent.ON_CONFERENCE_LEFT,null,conference);}},{key:"_onConferenceMemberJoined",value:function _onConferenceMemberJoined(conference,member){this.emit(_constants.CallInAppEvent.ON_CONFERENCE_MEMBER_JOINED,null,[conference,member]);}},{key:"_onConferenceMemberLeft",value:function _onConferenceMemberLeft(conference,member){this.emit(_constants.CallInAppEvent.ON_CONFERENCE_MEMBER_LEFT,null,[conference,member]);}},{key:"_onConferenceMemberUpdated",value:function _onConferenceMemberUpdated(conference,member){this.emit(_constants.CallInAppEvent.ON_CONFERENCE_MEMBER_UPDATED,null,[conference,member]);}},{key:"_onConferenceMemberCleared",value:function _onConferenceMemberCleared(conference){this.emit(_constants.CallInAppEvent.ON_CONFERENCE_MEMBER_CLEARED,null,[conference,[]]);}},{key:"_onConferenceChatMessage",value:function _onConferenceChatMessage(conference,chatMessage){this.emit(_constants.CallInAppEvent.ON_CONFERENCE_CHAT_MESSAGE,null,[conference,chatMessage]);}},{key:"_login",value:function _login(){var _this4=this;var loginRequest=new _verto.VertoRequest(_constants.MessageMethod.LOGIN,this._loginData);console.debug('[UserSession] Login data',this._loginData);this.send(loginRequest).then(function(result){if(result){console.log('[UserSession] Login Success:',result);_this4._isLoggedIn=true;_this4.emit(_constants.CallInAppEvent.ON_LOGIN_SUCCESS,null,result);}}).catch(function(e){console.error('[UserSession] Login Error:',e);_this4._isLoggedIn=false;_this4.emit(_constants.CallInAppEvent.ON_LOGIN_ERROR,e,null);});}},{key:"send",value:function send(request){if(request instanceof _verto.VertoRequest){request=request.toJSON();}if(request&&request.params&&!request.params.sessid){request.params.sessid=this.id;}return this.connection.send(request);}},{key:"on",value:function on(event,callback){if(!this.id){this._delayedEvents.push({event:event,callback:callback});}else{_EventHandler.default.subscribe(event,callback,this.id);}}},{key:"off",value:function off(event,callback){_EventHandler.default.unsubscribe(event,callback,this.id);}},{key:"emit",value:function emit(event,err,data){_EventHandler.default.emit(event,err,data,this.id);}},{key:"testSpeed",value:function testSpeed(){var _this5=this;return new Promise(function(resolve,reject){var bytes=1024*256;var speedCallback=function speedCallback(err,data){var upDur=data.upDur,downDur=data.downDur;var upKps=upDur?(bytes*8/(upDur/1000)/1024).toFixed(0):0;var downKps=downDur?(bytes*8/(downDur/1000)/1024).toFixed(0):0;var speed={upDur:upDur,downDur:downDur,upKps:upKps,downKps:downKps};_EventHandler.default.emit(_constants.CallInAppEvent.ON_SPEED_CHANGE,null,speed,_this5.id);return resolve(speed);};_EventHandler.default.subscribeOnce(_constants.SocketEvent.ON_SPEED_CHANGE,speedCallback,_this5.id);_this5.connection.testSpeed(bytes);});}},{key:"newCall",value:function newCall(data){if(!data||!data.destinationNumber){console.error('[UserSession] Missing destinationNumber');return;}var options=(0,_extends2.default)({callType:_constants.CallType.OUTBOUND,userVariables:this._options.userInfo},this._options.callOptions,data);var call=new _Call.default(this,options);this.activeCalls[call.id]=call;call.invite();return call;}},{key:"sendChat",value:function sendChat(message){if(!message||!message.to||!message.body){return Promise.reject(new Error('Missing to or body in message'));}message.from=this._loginData.login;var params={msg:message};var request=new _verto.VertoRequest(_verto.VertoMethod.INFO,params);return this.send(request);}},{key:"_createIncomingCall",value:function _createIncomingCall(data){var useStereo=false;var sdp=data.sdp;if(sdp){if(sdp.indexOf("stereo=1")>=0){useStereo=true;}}var options=(0,_extends2.default)({callType:_constants.CallType.INBOUND,userVariables:this._options.userInfo},this._options.callOptions,data,{useStereo:useStereo});var call=new _Call.default(this,options);this.activeCalls[call.id]=call;call.setState(_constants.CallState.RINGING);return call;}},{key:"_recoveryCall",value:function _recoveryCall(data){var callID=data.callID;var self=this;this._getSavedCallInfo(callID).then(function(savedCallInfo){if(!savedCallInfo){savedCallInfo={options:{},additionalData:{}};}var options=(0,_extends2.default)({},data,savedCallInfo.options,{attach:true});var call=new _Call.default(self,options);call.activeTime=savedCallInfo.additionalData.activeTime;call.setState(_constants.CallState.RECOVERING);self.activeCalls[call.id]=call;if(self._options.autoRecoveryCall){console.log('[UserSession] Auto Recovery Call');call.answer();}else{self.emit(_constants.CallInAppEvent.ON_RECOVERY_CALL,null,call);}});}},{key:"_getSavedCallInfo",value:function _getSavedCallInfo(id){return new Promise(function(resolve,reject){_storage.localStorage.getItem(id).then(function(savedCallInfo){return resolve(savedCallInfo?(0,_helpers.parseJSON)(savedCallInfo):null);}).catch(function(){return resolve(null);});});}},{key:"_saveCallInfo",value:function _saveCallInfo(call){var options={};Object.keys(call._options).forEach(function(key){if(call._options[key]!==null&&key!=='sdp'&&key!=='localStream'){options[key]=call._options[key];}});var savingCallInfo={options:options,additionalData:{activeTime:call.activeTime}};_storage.localStorage.setItem(call.id,JSON.stringify(savingCallInfo));}},{key:"_clearSavedCallInfo",value:function _clearSavedCallInfo(id){_storage.localStorage.removeItem(id);}}]);return UserSession;}();var _default=UserSession;exports.default=_default;