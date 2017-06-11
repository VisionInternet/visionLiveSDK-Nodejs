# visionLiveSDK-Node
Node SDK for visionLive API

API Explorer: http://api.visioninternet.com/

API Document: http://api.visioninternet.com/Document

# Install
```
# npm install https://github.com/VisionInternet/visionLiveSDK-Nodejs
```

# Uninstall
```
# npm uninstall https://github.com/VisionInternet/visionLiveSDK-Nodejs
```

# Example
```
var vsisionLiveAPIClient = require("visionlivesdk");

var apiClient = new vsisionLiveAPIClient({
    serverUrl:"http://www.city.gov/API",
    app_key:"{Your App Key}",
    app_secret:"{Your App Secret}"
});
var apiService = apiClient.getService();

// vision.cms.calendarcomponent.event.get is the method name.
// apiService.vision.cms.calendarcomponent.event.get will return a promise.
apiService.vision.cms.calendarcomponent.event.get({Fields:1, ID:3754})
            .then(function (response) {
                if(response.ErrorCode){
                    console.log(response.ErrorCode+":"+response.ErrorMessage);
                }else{
                    // response object, please refer to API document.
                    var event = response.Event;
                    console.log(event);
                }
            })
            .catch(function (err) {
                console.log(err);
            })
```

