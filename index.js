var conf = require('./config.js');
var request = require('request');
var mqtt = require('mqtt');
var  _motionState = 'ON';
var _map = _buildMap(conf);
var _initC = false;

var client  = mqtt.connect('mqtt://'+conf.broker.address); 
client.on('connect', function () {  
    if(_initC == false){
        _initC = true;
        _initF();
    }    
});
 
client.on('message', function (topic, message) {
  console.log('mqtt.message',topic, message.toString());    
  var cmd = _getCmdByAction(message);  
  if(cmd != false){
    _sendHttpRequest(cmd);
  }  
});

client.on('error', function (error) {
    console.log('mqtt.error', error);  
  })

function _initF()
{
    var topic = _getTopicByAction('ON');
    client.subscribe(topic);
    console.log('_initF()', topic, _getState(), conf.mqtt.options);
    setInterval(_publishTasker,conf.client.publishInterval);
    setInterval(_updateTasker,conf.motion.updateInterval);
    console.log("Init...Ok!");
}

function _publishTasker()
{
    _publishState();
}

function _updateTasker()
{
    var cmd = _getCmdByAction('UPDATE');  
    if(cmd != false){
      _sendHttpRequest(cmd);
    }  
}

function _publishState()
{
    var topic = _getTopicByAction('UPDATE');
    if(topic != false){
        client.publish(topic, _getState(), conf.mqtt.options);
        console.log('_publishState()', topic, _getState(), conf.mqtt.options);
    }    
}

function _sendHttpRequest(command){    
    var uri = 'http://' + conf.motion.address + ':' + conf.motion.port + '/' + command;
    console.log(' _sendHttpRequest(command)', uri);
    var options = {
        uri: uri,
        encoding: 'latin1' 
    }
    request(options, _onHttpRequest);
}

function _onHttpRequest(error, response, body) {
    if(response && response.statusCode)
    {        
        switch(response.statusCode)
        {
            case 200:            
                _decodeMotionReply(body);
                break;
        }
    }
}

function _decodeMotionReply(body)
{
    if(body.indexOf('Detection paused') > 0) {_setState(false); console.log('_decodeMotionReply(body)','Detection paused');}
    else if(body.indexOf('Detection resumed') > 0) {_setState(true); console.log('_decodeMotionReply(body)','Detection resumed');} 
    else if(body.indexOf('Detection status PAUSE') > 0) {_setState(false); console.log('_decodeMotionReply(body)','Detection status PAUSE');}
    else if(body.indexOf('Detection status ACTIVE') > 0) {_setState(true); console.log('_decodeMotionReply(body)','Detection status ACTIVE');}    
}

function _setState(enable)
{
    (enable == true)?(_motionState = 'ON'):(_motionState = 'OFF');
    console.log('_setState(enable)', _motionState);
}

function _getState()
{
    return _motionState;
}

function _getTopicByAction(action)
{
    for(entry of _map)
    {
        if(entry.action == action) return entry.mqttTopic;
    }   
    console.log('_getTopicByAction(action) -> Not found', action);
    return false;
}

function _getCmdByAction(action)
{
    for(entry of _map)
    {
        if(entry.action == action) return entry.motionCmd;
    }   
    console.log('_getCmdByAction(action) -> Not found', action);
    return false;
}

function _buildMap(config)
{
    var map = []    ;
    for(entry of config.map)
    {
        entry.motionCmd = entry.motionCmd.replace('%threadNumber%',config.motion.threadNumber);
        entry.mqttTopic = entry.mqttTopic.replace('%clientName%',config.client.clientName);
        map.push(entry);
    }

    console.log(map);
    return map;
}



