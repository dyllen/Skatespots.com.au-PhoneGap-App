cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.phonegap.plugins.facebookconnect/www/phonegap/plugin/facebookConnectPlugin/facebookConnectPlugin.js",
        "id": "com.phonegap.plugins.facebookconnect.FacebookConnectPlugin",
        "clobbers": [
            "window.facebookConnectPlugin"
        ]
    },
    {
        "file": "plugins/com.ohh2ahh.plugins.appavailability/www/AppAvailability.js",
        "id": "com.ohh2ahh.plugins.appavailability.AppAvailability",
        "clobbers": [
            "appAvailability"
        ]
    },
    {
        "file": "plugins/com.philmerrell.cordova.canopen/www/canOpen.js",
        "id": "com.philmerrell.cordova.canopen.canopen",
        "clobbers": [
            "window.CanOpen"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.phonegap.plugins.facebookconnect": "0.5.0",
    "com.ohh2ahh.plugins.appavailability": "0.3.0",
    "com.philmerrell.cordova.canopen": "0.1",
    "org.apache.cordova.geolocation": "0.3.11-dev"
}
// BOTTOM OF METADATA
});