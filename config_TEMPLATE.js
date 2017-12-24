module.exports = {
    client:{
        clientName: 'motion1', //OSLL: Set here your MQTT CLIENT name.
        publishInterval: 5000
    },
    
    motion:{
        version: 'Motion-httpd/3.2.12+git20140228', //OSLL: This is only a reference...
		port: 80, //OSLL: Set here your MOTION HTTP port.		
        address: '127.0.0.1', //OSLL: Set here your MOTION HTTP address.
        threadNumber: 0,
        updateInterval: 15000
    },
    
    broker:{
		port: 1883,		
		address: '127.0.0.1' //OSLL: Set here your MQTT BROQUER address.
    },

    mqtt:{
        options: {
            qos: 1,
            retain: true,
            dup: false
        }
    },
	
	map:[ //OSLL: This is according to 'Motion-httpd/3.2.12+git20140228' web interface
	{
        motionCmd:'%threadNumber%/detection/status',
        mqttTopic:'stat/%clientName%/DETECTION',
        action: 'UPDATE'
    },

	{
        motionCmd:'%threadNumber%/detection/pause',
        mqttTopic:'cmnd/%clientName%/DETECTION',
        action: 'OFF'
    },
    
    {
        motionCmd:'%threadNumber%/detection/start',
        mqttTopic:'cmnd/%clientName%/DETECTION',
        action: 'ON'
	}        
	]
};
