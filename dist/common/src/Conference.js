var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=void 0;var _extends2=_interopRequireDefault(require("@babel/runtime/helpers/extends"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _verto=require("./services/verto");var _helpers=require("./helpers");var defaultConferenceOptions={laChannel:null,infoChannel:null,chatChannel:null,modChannel:null,chatID:null,conferenceMemberID:null,action:null,canvasCount:0,laName:null,role:null};var Conference=function(){(0,_createClass2.default)(Conference,[{key:"role",get:function get(){return this._options.role;}}]);function Conference(session,call,options){(0,_classCallCheck2.default)(this,Conference);this.members=[];this._session=session;this.call=call;this._options=(0,_extends2.default)({},defaultConferenceOptions,options);this.id=this._options.id||(0,_helpers.generateUUID)();this._createModFunctions();this._subscribeConferenceChannels();this._onLaChannelUpdate=this._onLaChannelUpdate.bind(this);this._onInfoChannelUpdate=this._onInfoChannelUpdate.bind(this);this._onChatChannelUpdate=this._onChatChannelUpdate.bind(this);this._onModChannelUpdate=this._onModChannelUpdate.bind(this);this._initMembers=this._initMembers.bind(this);this._addMember=this._addMember.bind(this);this._removeMember=this._removeMember.bind(this);this._updateMember=this._updateMember.bind(this);this._clearMember=this._clearMember.bind(this);}(0,_createClass2.default)(Conference,[{key:"_subscribeConferenceChannels",value:function _subscribeConferenceChannels(){var _this=this;if(this._options.laChannel){var request=new _verto.VertoRequest(_verto.VertoMethod.SUBSCRIBE,{eventChannel:this._options.laChannel});this._session.send(request).then(function(re){console.log('[Subscribed]',_this._options.laChannel,re);_this._session.on(_this._options.laChannel,_this._onLaChannelUpdate);_this._bootstrapLaChannel();}).catch(function(e){return console.error('[Conference] Failed to subscribe laChannel',e);});}if(this._options.infoChannel){var _request=new _verto.VertoRequest(_verto.VertoMethod.SUBSCRIBE,{eventChannel:this._options.infoChannel});this._session.send(_request).then(function(re){console.log('[Subscribed]',_this._options.infoChannel,re);_this._session.on(_this._options.infoChannel,_this._onInfoChannelUpdate);}).catch(function(e){return console.error('[Conference] Failed to subscribe infoChannel',e);});}if(this._options.chatChannel){var _request2=new _verto.VertoRequest(_verto.VertoMethod.SUBSCRIBE,{eventChannel:this._options.chatChannel});this._session.send(_request2).then(function(re){console.log('[Subscribed]',_this._options.chatChannel,re);_this._session.on(_this._options.chatChannel,_this._onChatChannelUpdate);}).catch(function(e){return console.error('[Conference] Failed to subscribe chatChannel',e);});}if(this._options.modChannel){var _request3=new _verto.VertoRequest(_verto.VertoMethod.SUBSCRIBE,{eventChannel:this._options.modChannel});this._session.send(_request3).then(function(re){console.log('[Subscribed]',_this._options.modChannel,re);_this._session.on(_this._options.modChannel,_this._onModChannelUpdate);}).catch(function(e){return console.error('[Conference] Failed to subscribe modChannel',e);});}}},{key:"_unsubscribeConferenceChannels",value:function _unsubscribeConferenceChannels(){var _this2=this;var channels=[this._options.laChannel,this._options.infoChannel,this._options.chatChannel];if(this._options.modChannel){channels.push(this._options.modChannel);}channels.forEach(function(channel){return _this2._session.off(channel);});var request=new _verto.VertoRequest(_verto.VertoMethod.UNSUBSCRIBE,{eventChannel:channels});this._session.send(request).catch(function(e){return console.error('[Conference] Failed to unsubscribe conference channel',e);});}},{key:"_createModFunctions",value:function _createModFunctions(){var _this3=this;if(this._options.modChannel){this.listVideoLayouts=function(){_this3._sendModChannelCommand("list-videoLayouts",null,null);};this.play=function(file){_this3._sendModChannelCommand("play",null,file);};this.stop=function(){_this3._sendModChannelCommand("stop",null,"all");};this.deaf=function(memberId){_this3._sendModChannelCommand("deaf",parseInt(memberId));};this.undeaf=function(memberId){_this3._sendModChannelCommand("undeaf",parseInt(memberId));};this.record=function(file){_this3._sendModChannelCommand("recording",null,["start",file]);};this.stopRecord=function(){_this3._sendModChannelCommand("recording",null,["stop","all"]);};this.snapshot=function(file){_this3._sendModChannelCommand("vid-write-png",null,file);};this.setVideoLayout=function(layout,canvasId){if(canvasId){_this3._sendModChannelCommand("vid-layout",null,[layout,canvasId]);}else{_this3._sendModChannelCommand("vid-layout",null,layout);}};this.kick=function(memberId){_this3._sendModChannelCommand("kick",parseInt(memberId));};this.muteMic=function(memberId){_this3._sendModChannelCommand("tmute",parseInt(memberId));};this.muteCam=function(memberId){_this3._sendModChannelCommand("tvmute",parseInt(memberId));};this.presenter=function(memberId){_this3._sendModChannelCommand("vid-res-id",parseInt(memberId),"presenter");};this.videoFloor=function(memberId){_this3._sendModChannelCommand("vid-floor",parseInt(memberId),"force");};this.banner=function(memberId,text){_this3._sendModChannelCommand("vid-banner",parseInt(memberId),escape(text));};this.volumeDown=function(memberId){_this3._sendModChannelCommand("volume_out",parseInt(memberId),"down");};this.volumeUp=function(memberId){_this3._sendModChannelCommand("volume_out",parseInt(memberId),"up");};this.gainDown=function(memberId){_this3._sendModChannelCommand("volume_in",parseInt(memberId),"down");};this.gainUp=function(memberId){_this3._sendModChannelCommand("volume_in",parseInt(memberId),"up");};this.transfer=function(memberId,extension){_this3._sendModChannelCommand("transfer",parseInt(memberId),extension);};}}},{key:"_onLaChannelUpdate",value:function _onLaChannelUpdate(error,data){console.debug('_onLaChannelUpdate',data);var action=data.action,name=data.name;var memberArr=data.data;switch(action){case _verto.LiveArrayAction.BOOT_OBJ:this._initMembers(memberArr);break;case _verto.LiveArrayAction.ADD:var memId=data.hashKey;var newMem=(0,_extends2.default)({id:memId},this._parseMemberInfo(memberArr));this._addMember(newMem);break;case _verto.LiveArrayAction.MODIFY:var updatingMemId=data.hashKey;var updatingMem=(0,_extends2.default)({id:updatingMemId},this._parseMemberInfo(memberArr));this._updateMember(updatingMem);break;case _verto.LiveArrayAction.DELETE:this._removeMember(data.hashKey);break;case _verto.LiveArrayAction.CLEAR:this._clearMember();break;default:break;}}},{key:"_onInfoChannelUpdate",value:function _onInfoChannelUpdate(error,data){console.debug('_onInfoChannelUpdate',data);}},{key:"_onChatChannelUpdate",value:function _onChatChannelUpdate(error,data){console.debug('_onChatChannelUpdate',data);var chatMessage={from:data.fromDisplay||data.from||'UNKNOWN',message:data.message,type:data.type};this._session._onConferenceChatMessage(this,chatMessage);}},{key:"_onModChannelUpdate",value:function _onModChannelUpdate(error,data){console.debug('_onModChannelUpdate',data);}},{key:"_bootstrapLaChannel",value:function _bootstrapLaChannel(){this._sendLaChannelCommand(_verto.LiveArrayAction.BOOTSTRAP);}},{key:"_sendLaChannelCommand",value:function _sendLaChannelCommand(command,obj){var data={liveArray:{command:command,context:this._options.laChannel,name:this._options.laName,obj:obj}};return this._broadcast(this._options.laChannel,data);}},{key:"_sendModChannelCommand",value:function _sendModChannelCommand(command,confMemberId,value){var data={"application":"conf-control","command":command,"id":confMemberId,"value":value};return this._broadcast(this._options.modChannel,data);}},{key:"sendChat",value:function sendChat(message){var type=arguments.length>1&&arguments[1]!==undefined?arguments[1]:'message';var data={action:'send',message:message,type:type};return this._broadcast(this._options.chatChannel,data);}},{key:"_broadcast",value:function _broadcast(channel,data){var params={eventChannel:channel,data:data};var request=new _verto.VertoRequest(_verto.VertoMethod.BROADCAST,params);return this._session.send(request);}},{key:"_parseMemberInfo",value:function _parseMemberInfo(array){var memberInfo=(0,_extends2.default)({conferenceMemberID:array.length>0?array[0]:null,callerIdName:array.length>1?array[1]:null,callerIdNumber:array.length>2?array[2]:null,media:array.length>4?(0,_helpers.parseJSON)(array[4])||{}:{}},array.length>5?array[5]||{}:{});if(Number(this._options.conferenceMemberID)===Number(memberInfo.conferenceMemberID)){memberInfo.me=true;}return memberInfo;}},{key:"_initMembers",value:function _initMembers(membersArr){var _this4=this;var members=[];if(Array.isArray(membersArr)){membersArr.forEach(function(arr){if(Array.isArray(arr)&&arr.length>1){var id=arr[0];var others=arr[1];var member=(0,_extends2.default)({id:id},_this4._parseMemberInfo(others));if(member.me&&_this4._session.activeCalls[member.id]){_this4.call=_this4._session.activeCalls[member.id];}members.push(member);}});}this.members=members;this._session._onConferenceJoined(this);}},{key:"_addMember",value:function _addMember(member){if(this.members.findIndex(function(m){return m.id===member.id;})>=0){return;}if(!member.me){this.members.push(member);}else{this.members.unshift(member);}this._session._onConferenceMemberJoined(this,member);}},{key:"_updateMember",value:function _updateMember(member){var memIndex=this.members.findIndex(function(m){return m.id===member.id;});if(memIndex<0){return;}this.members[memIndex]=(0,_extends2.default)({},member);this._session._onConferenceMemberUpdated(this,member);}},{key:"_removeMember",value:function _removeMember(id){var memberIndex=this.members.findIndex(function(m){return m.id===id;});var leftMembers=this.members.splice(memberIndex,1);leftMembers.length>0&&this._session._onConferenceMemberLeft(this,leftMembers[0]);}},{key:"_clearMember",value:function _clearMember(){this.members=[];this._session._onConferenceMemberCleared(this,[]);}},{key:"destroy",value:function destroy(){this._session._onConferenceLeft(this);this._unsubscribeConferenceChannels();}}]);return Conference;}();exports.default=Conference;