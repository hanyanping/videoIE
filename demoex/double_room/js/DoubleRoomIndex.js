//监听事件
var listeners = {
    "onConnNotify": webimhandler.onConnNotify, //选填
    "onBigGroupMsgNotify": function (msg) {
        webimhandler.onBigGroupMsgNotify(msg, function (msgs) {
            receiveMsg(msgs);
        })
    }, //监听新消息(大群)事件，必填
    "onMsgNotify": onMsgNotify, //监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
    "onGroupSystemNotifys": RTCRoom.onGroupSystemNotifys, //监听（多终端同步）群系统消息事件，必填
    "onGroupInfoChangeNotify": webimhandler.onGroupInfoChangeNotify,
    // 'onKickedEventCall': self.onKickedEventCall // 踢人操作
};
var loginInfo = {
    sdkAppID : '1400066983',
    appIDAt3rd : '1400066983' ,
    accountType: 22,
    identifier : 'anonymous' ,
    identifierNick : 'anonymous' ,
    userSig : 'eJxFkNFOgzAUQP*FV40rLWXoG*KmU7fBhmby0hRasFFKKWVuMf77WMPi6zm5uffcXyd93d5QpQQj1BCkmXPnAOfaYn5QQnNCS8P1gF2MMQTgYvdcd6KRg4DAxS5EAPxLwbg0ohR2kMpGHuum70bZiWqgy9lHtEgegtXu3csmszwDJg7l7n6eravvRHP81LH15G2ZHjaqSBGtfhafYez329Lr0XNbT4sWBptchL56yed71oZxtHoEURIpll5hcVnGvojtOxd4w4W*fxugURpRc1vmTgOIUIBHToui6aUh5qi4fcjfCURaWRA_'
};
var options = {
    isAccessFormalEnv : true ,
    isLogOn : true
};
var t = '',conttime = 30,isReceive = '',dataString = '', selToID = '',liDiv = '',liHtml = '',listobject = '',roomID = '',userID = '',surveyInfo = '';
var pcUserID = '',orgCode = '';
var ajaxUrl = 'https://survey.zhongchebaolian.com/boot-pub-survey-video';
var inRoom = false;
var userNames = ['林静晓', '陆扬', '江辰', '付小司', '陈小希', '吴柏松', '肖奈', '老胡', '江锐', '立夏'];
var myUserName  = userNames[Math.floor(Math.random()*10)];

// VideoBitRate()
//鼠标划入视频
function enterVedeo(){

}
//鼠标离开视频
function leaveVideo(){

}
function takePhone(){
    var isPhone = 'true';
    console.log(isPhone);
    console.log(selToID)
    sendMsg(selToID,isPhone);
}
$(function(){
    pcUserID = localStorage.getItem('userId');
    orgCode = localStorage.getItem('orgCode');

})
//挂起订单列表
 function getNodealCase(){
     var data = {
         "userId": userId
     }
    $.ajax({
        type: "post",
        data: data,
        url: ajaxUrl +"/survey/order/v1/wait/order/list",
        success:function(response){
            if(response.data.rescode == 200){
                var noDealCase = response.data.data;
                if(noDealCase.length!=0){
                    var str = '';
                    $.each(data.imgs,function(index,o){
                        if(o.orderStatus == '06'){
                            o.orderStatustext == '待查堪'
                        }else if(o.orderStatus == '07'){
                            o.orderStatustext == '查勘中'
                        }else if(o.orderStatus == '08'){
                            o.orderStatustext == '已查勘'
                        }else if(o.orderStatus == '11'){
                            o.orderStatustext == '已取消'
                        }
                        str = ' <div @dblclick ="goleftLine(item.surveyNo,item)" title="双击进行处理" class="wait-law-case">' +
                            '<ul>'+
                            '<li>车牌号：'+o.reportVehicleLicenseNo+'</li>' +
                            '<li>报案人电话：'+o.reporterPhone+'</li>' +
                            '<li>查勘员姓名：'+o.liveSurveyorName+'</li>' +
                            '<li>查勘员电话：'+o.liveSurveyorPhone+'</li>' +
                            '<li>订单状态：'+o.orderStatustext+'</li>' +
                            '</ul>' +
                            '</div>'
                    })
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
        }
    });
}
function onMsgNotify(newMsgList) {
    console.info('监听新消息事件 =====> ' + newMsgList);
//            console.warn('监听新消息事件 =====> ' + newMsgList);
    var sess, newMsg,selSess;
    //获取所有聊天会话
    var sessMap = webim.MsgStore.sessMap();

    for (var j in newMsgList) {//遍历新消息
        newMsg = newMsgList[j];
        selToID = newMsg.fromAccount;

        selSess = newMsg.getSession();
        //在聊天窗体中新增一条消息
         dataString = convertMsgtoHtml(newMsg);

        dataString = dataString.replace(/&quot;/g, "'");
        dataString = eval("("+dataString+")")
        console.log('收到一条新消息 ===> ' + dataString);
        if(dataString.hangup == 'hangup'){
            hangUp("1");
            return
        }
            getroomList()
    }
    //消息已读上报，以及设置会话自动已读标记
    webim.setAutoRead(selSess, true, true);
    for (var i in sessMap) {
        sess = sessMap[i];
        if (loginInfo.identifier != sess.id()) {//更新其他聊天对象的未读消息数
//                    updateSessDiv(sess.type(), sess.id(), sess.unread());
        }
    }
}
function dealInfo(selToID){
    $("#onLinking").removeClass('hide');
    $("#hangUp").removeClass('hide');
    $("#nofinishOrder").removeClass('hide');
    $("#online").addClass('hide')
    $("#onlineLoding").addClass('hide');
    $("#onOff").addClass('hide');
    $("#nohangUp").addClass('hide');
    $("#finishOrder").addClass('hide');
    clearInterval(t);       //停止计时器
    t = window.setInterval(function () {
        if (conttime > 0) {
            conttime = conttime-1;
            $("#countTime").text(conttime);
        }
        if (conttime === 0) {
            if(surveyInfo.isNew == '0'){//新订单发起视频未连接
                $("#haveCase").html('');
                $("#haveCase").addClass('hide');
                $(".nocaseleft").removeClass("hide")
            }else{
                $("#online").removeClass('hide');
                $("#hangUp").removeClass('hide');
                $("#nofinishOrder").removeClass('hide');
                $("#onlineLoding").addClass('hide')
                $("#onLinking").addClass('hide');
                $("#onOff").addClass('hide');
                $("#nohangUp").addClass('hide');
                $("#finishOrder").addClass('hide');
            }
            haveVideoActive = false;
            isReceive = '0';
            sendMsg(selToID,isReceive);
            conttime = 30;
            $("#countTime").text(conttime)
            clearInterval(t);
        }
            //停止计时器
    }, 1000);
    // sendMsg(selToID,isReceive)
}
//创建房间
function createRoom() {
    if (inRoom) {
        alert("请先退出原来的房间");
        return;
    }
    var roomName = document.getElementById("RoomNameInput").value;
    if (!roomName || roomName.length < 1) {
        alert("房间名不能为空");
        return;
    }
    if (roomName.length > 15){
        alert("房间名太长，不超过15个字符");
        return;
    }
    //创建房间打开摄像头
    inRoom = true;
    var RoomNameDiv = document.getElementById("CurrentRoomName");
    RoomNameDiv.innerText = roomName;

    RTCRoom.createRoom({
        data: {
            roomName:document.getElementById("RoomNameInput").value,
            success: function(ret) {
                alert("创建房间成功" + ret.toString());
            },
            fail: function(ret) {
                alert("创建房间失败" + ret.toString());
            }
        }
    })
}
//获取房间
function getroomList(){
    RTCRoom.getRoomList({
        data: {
            index: 0,
            cnt: 100
        },
        success: function(ret) {
            console.log('ret'+ret)
            // var roomlistDiv = document.getElementById("roomlist");
            // roomlistDiv.innerHTML = "";
            // var roomtitle = document.getElementById("roomlist-title");
            // roomtitle.innerText = "<h4>正在处理案件</h4>";
            ret.rooms.forEach(function (roomInfo) {
                console.log('roomInfo'+roomInfo)
                doAddRoomIdToList(roomInfo);
            });
        },
        fail: function(ret) {
            console.log("拉取房间列表失败");
        }
    });
}
function refreshRoomList(interval) {
    RTCRoom.getRoomList({
        data: {
            index: 0,
            cnt: 100
        },
        success: function(ret) {
            var roomlistDiv = document.getElementById("roomlist");
            roomlistDiv.innerHTML = "";
            var roomtitle = document.getElementById("roomlist-title");
            roomtitle.innerText = "房间列表(" + ret.rooms.length.toString() + ")";
            ret.rooms.forEach(function (roomInfo) {
                doAddRoomIdToList(roomInfo);
            });
        },
        fail: function(ret) {
            console.log("拉取房间列表失败");
        }
    });
    setTimeout(function () {
        refreshRoomList(interval);
    }, interval);
}
function doAddRoomIdToList(object) {
    roomID =  object.roomID.toString();
    console.log('roomID ===> ' + roomID);
     surveyInfo  = dataString.surveyOrderInfo;
    if(surveyInfo.liveSurveyorStatus == '11'){
        var liveSurveyorStatus = "待指派"
    }else if(surveyInfo.liveSurveyorStatus == '12'){
        var liveSurveyorStatus = "已指派"
    }else if(surveyInfo.liveSurveyorStatus == '13'){
        var liveSurveyorStatus = "已到达"
    }else if(surveyInfo.liveSurveyorStatus == '14'){
        var liveSurveyorStatus = "查勘中"
    }else if(surveyInfo.liveSurveyorStatus == '14'){
        var liveSurveyorStatus = "已查勘"
    }
    if(surveyInfo.orderStatus == '06'){
        var orderStatus = '待连线'
    }else if(surveyInfo.orderStatus == '07'){
        var orderStatus = '查勘中'
    }else if(surveyInfo.orderStatus == '08'){
        var orderStatus = '待审核'
    }else if(surveyInfo.orderStatus == '11'){
        var orderStatus = '已取消'
    }
    str = '';
    str = ' <p>车牌号：<span id="bdno">'+surveyInfo.reportVehicleLicenseNo+'</span> </p>' +
        '<p>报案人姓名：'+surveyInfo.reporterName+'</p>' +
        '<p>报案人电话：<span id="bdtel">'+surveyInfo.reporterPhone+'<span></span></span></p>' +
        '<p>保险公司：'+surveyInfo.insuranceCompanyName+'</p>' +
        '<p class="address">报案地点：'+surveyInfo.reportLocation+'</p>' +
        '<div class="item-txt-list">' +
        '<p>查勘员姓名：'+surveyInfo.liveSurveyorName+' </p>' +
        '<p>查勘员电话：'+surveyInfo.liveSurveyorPhone+'</p>\n' +
        '<p>查勘员接单数：'+surveyInfo.liveSurveyorCompleteOrderCount+'</p>' +
        '<p>查勘员状态：'+liveSurveyorStatus+'</p></div>' +
        '<div class="item-btn-box">' +
        '<p>订单状态：<span>'+orderStatus+'</span>' +
        '</p>' +
        '<div class="item-btn-mod">' +
        '<a href="javascript:;" class="link-btn mr10 disabled hide" id="online">连线</a>' +
        '<a href="javascript:;" class="link-btn mr10 disabled hide"id="onlineLoding" >连线中</a>' +
        '<a href="javascript:;" class="link-btn mr10"  id="onLinking" >连线 <span id="countTime" data-max="30"></span>s</a>' +
        '<a href="javascript:;" class="link-btn mr10 warn hide" id="onOff" >挂断</a>' +
        '<a href="javascript:;" class="link-btn hide" id="hangUp" onclick="hangUp(roomId)">挂起订单</a>' +
        '<a href="javascript:;" class="link-btn hide" id="nohangUp">挂起订单</a>' +
        '</div>'+
        '</div> '+
        '<div class="item-btn-max">'+
        ' <a href="javascript:;" class="link-btn-max hide" id="finishOrder" onclick="openOrderSelect">查勘完成</a>' +
        '<a href="javascript:;" class="hide" id="nofinishOrder">查勘完成</a>' +
        '<a href="javascript:;"   id="beizhu" onclick="openBeizhu">备注</a>' +
        '</div>';
    $("#haveCase").removeClass('hide');
    $("#haveCase").html($(str));
    $(".nocaseleft").addClass("hide");

    $("#onLinking").click(function(){//连接视频
        clearInterval(t);
        conttime = 30;
        isReceive = '1';
        // sendMsg(selToID,isReceive);
        $("#onLinking").addClass('hide');
        $("#hangUp").addClass('hide');
        $("#nohangUp").removeClass('hide');
        $("#online").addClass('hide')
        $("#onlineLoding").removeClass('hide');
        $("#onOff").addClass('hide');
        $("#finishOrder").addClass('hide');
        $("#nofinishOrder").removeClass('hide');
        conttime = 30;
        var cameras = RTCRoom.getCameras();
        if (cameras.camera_cnt <= 0) {
            alert("进入房间失败，没有可用的摄像头");
            return;
        }
        // var peopleNum = document.getElementById(roomID).getAttribute("peopleNum");
        // if (parseInt(peopleNum) > 1)
        // {
        //     alert("进入房间失败，房间人数已满");
        //     return;
        // }
        inRoom = true;
        // var roomName = document.getElementById(roomID).getAttribute("roomName");
        // var RoomNameDiv = document.getElementById("CurrentRoomName");
        // RoomNameDiv.innerText =  roomName;
        RTCRoom.enterRoom({
            data: {
                roomID: roomID
            },
            success: function () {
                $(".video-panel").removeClass("hide");
                $(".videoBox").removeClass("hide");
                $(".novideoBox").addClass("hide");
                 $("#onLinking").addClass('hide');
                $("#hangUp").addClass('hide');
                $("#nofinishOrder").removeClass('hide');
                $("#online").addClass('hide')
                $("#onlineLoding").addClass('hide');
                $("#onOff").removeClass('hide');
                $("#nohangUp").removeClass('hide');
                $("#finishOrder").addClass('hide');
            },
            fail: function (ret) {
                console.log(ret);
            }
        })

    })
    $("#onOff").click(function(){//挂断
        hangUp('0')

    })

    // listobject = object;
    // var newli = document.createElement("li");
    // newli.setAttribute("id", object.roomID.toString());


    // newli.setAttribute("roomName", object.roomName);
    // newli.setAttribute("peopleNum", object.pushers.length.toString());
    //
    // var infoDiv=document.createElement("div");
    // infoDiv.setAttribute("class", "item-info");
    //
    // var p1 = document.createElement("p");
    // p1.setAttribute("class", "room-id");
    // var span1 = document.createElement("span");
    // span1.setAttribute("class","label-txt");
    // span1.innerText = "房间名：";
    // var span2 = document.createElement("span");
    // span2.setAttribute("class", "value-txt");
    // span2.innerText = object.roomName;
    // p1.appendChild(span1);
    // p1.appendChild(span2);
    // infoDiv.appendChild(p1);
    //
    // liDiv = newli;
    // liHtml = infoDiv;
    // console.log(liDiv)
    // if(liDiv){
    //     dealInfo(selToID);
    // }
    dealInfo(selToID);

    // newli.appendChild(infoDiv);

    // var statusDiv = document.createElement("div");
    // statusDiv.setAttribute("class", "item-status connected");
    // statusDiv.innerText = "人数:" + object.pushers.length.toString();
    //
    //
    // newli.appendChild(statusDiv);
    // document.getElementById("roomlist").appendChild(newli);
};

//挂断
function hangUp(type){
    if(type == '0'){//手动挂断
        var text = 'hangup';
        sendMsg(selToID,text);
    }
    $("#onLinking").addClass('hide');
    $("#hangUp").removeClass('hide');
    $("#nofinishOrder").addClass('hide');
    $("#online").removeClass('hide')
    $("#onlineLoding").addClass('hide');
    $("#onOff").addClass('hide');
    $("#nohangUp").addClass('hide');
    $("#finishOrder").removeClass('hide');
    RTCRoom.exitRoom();
    $(".video-panel").addClass("hide");
    $(".videoBox").addClass("hide");
    $(".novideoBox").removeClass("hide");
    inRoom = false;
    RTCRoom.setMute(false);
}

//发送消息
function sendMsg (selToID,isReceive) {

    var selType = webim.SESSION_TYPE.C2C;//一对一
    var selSessHeadUrl;
    var selSess = new webim.Session(selType, selToID, selToID, selSessHeadUrl, Math.round(new Date().getTime() / 1000));
    var isSend = false;//是否为自己发送
    var seq = -1;//消息序列，-1表示sdk自动生成，用于去重
    var random = Math.round(Math.random() * 4294967296);//消息随机数，用于去重
    var msgTime = Math.round(new Date().getTime() / 1000);//消息时间戳
    var subType;//消息子类型
    if (selType == webim.SESSION_TYPE.GROUP) {
        //群消息子类型如下：
        //webim.GROUP_MSG_SUB_TYPE.COMMON-普通消息,
        //webim.GROUP_MSG_SUB_TYPE.LOVEMSG-点赞消息，优先级最低
        //webim.GROUP_MSG_SUB_TYPE.TIP-提示消息(不支持发送，用于区分群消息子类型)，
        //webim.GROUP_MSG_SUB_TYPE.REDPACKET-红包消息，优先级最高
        subType = webim.GROUP_MSG_SUB_TYPE.COMMON;

    } else {
        //C2C消息子类型如下：
        //webim.C2C_MSG_SUB_TYPE.COMMON-普通消息,
        subType = webim.C2C_MSG_SUB_TYPE.COMMON;
    }
    var msg = new webim.Msg(selSess, isSend, seq, random, msgTime, loginInfo.identifier, subType, loginInfo.identifierNick);
    var text_obj = new webim.Msg.Elem.Text(isReceive);
    msg.addText(text_obj);

    alert(selToID);
    //调用发送消息接口
    webim.sendMsg(msg, function (resp) {
        //if (selType == webim.SESSION_TYPE.C2C) {//私聊时，在聊天窗口手动添加一条发的消息，群聊时，长轮询接口会返回自己发的消息
        //  addMsg(msg);
        //}
        webim.Log.info("发自定义消息成功");
       console.log("发自定义消息成功")
    }, function (err) {
        webim.Log.info(err.ErrorInfo);
        console.log('发自定义消息失败:', err);
    });
}

//把消息转换成Html
function convertMsgtoHtml(msg) {
    var html = "", elems, elem, type, content;
    elems = msg.getElems();//获取消息包含的元素数组
    for (var i in elems) {
        elem = elems[i];
        type = elem.getType();//获取元素类型
        content = elem.getContent();//获取元素对象
        switch (type) {
            case webim.MSG_ELEMENT_TYPE.TEXT:
                html += content.getText();
                break;
            case webim.MSG_ELEMENT_TYPE.FACE:
//                        html += convertFaceMsgToHtml(content);
                break;
            case webim.MSG_ELEMENT_TYPE.IMAGE:
//                        html += convertImageMsgToHtml(content);
                break;
            case webim.MSG_ELEMENT_TYPE.SOUND:
//                        html += convertSoundMsgToHtml(content);
                break;
            case webim.MSG_ELEMENT_TYPE.FILE:
//                        html += convertFileMsgToHtml(content);
                break;
            case webim.MSG_ELEMENT_TYPE.LOCATION://暂不支持地理位置
                //html += convertLocationMsgToHtml(content);
                break;
            case webim.MSG_ELEMENT_TYPE.CUSTOM:
//                        html += convertCustomMsgToHtml(content);
                break;
            case webim.MSG_ELEMENT_TYPE.GROUP_TIP:
//                        html += convertGroupTipMsgToHtml(content);
                break;
            default:
                webim.Log.error('未知消息元素类型: elemType=' + type);
                break;
        }
    }
    return html;
}


function onGetMemberList(ret) {
    console.log("收到成员消息", ret);
    ret.pushers.forEach(function (pusher) {
        RTCRoom.addRemoteView({
            data: {
                divId: "PlayerAreaID",
                userId: pusher.userID
            }
        });
    });

}

function onMemberJoin(ret) {
    console.log("收到进房消息", ret);
    ret.pushers.forEach(function (pusher) {
        RTCRoom.addRemoteView({
            data: {
                divId: "PlayerAreaID",
                userId: pusher.userID
            }
        })
    });
}

function onMemberQuit(ret) {
    console.log("收到退房消息", ret);
    ret.pushers.forEach(function (pusher) {
        RTCRoom.deleteRemoteView({
            data: {
                userId: pusher.userID
            }
        })
    })
}

function onRecvRoomTextMsg(ret) {
    console.log("收到消息:" + ret.textMsg);
    var time = ret.time ? ret.time:"";
    var nickName =  ret.nickName ? ret.nickName:"";
    var textMsg =  ret.textMsg?ret.textMsg:"";
    var mstText = textMsg;

    var newli = document.createElement("li");
    var pfrom = document.createElement("p");
    pfrom.setAttribute("class", "from");

    var pMsg = document.createElement("p");
    pMsg.setAttribute("class", "msg");
    pMsg.innerText = mstText;

    var newdiv = document.createElement("div");
    newdiv.setAttribute("class", "msg-wrap");
    if (ret.nickName == myUserName) {
        newli.setAttribute("class", "sender-msg");
        pfrom.innerText = " :我";
        newdiv.appendChild(pMsg);
        newdiv.appendChild(pfrom);
    }
    else {
        newli.setAttribute("class", "receiver-msg");
        if (nickName != "") {
            nickName = nickName + " :";
        }
        pfrom.innerText = nickName;
        newdiv.appendChild(pfrom);
        newdiv.appendChild(pMsg);
    }

    newli.appendChild(newdiv);
    var msgArea = document.getElementById("chat-list");
    msgArea.appendChild(newli);
}