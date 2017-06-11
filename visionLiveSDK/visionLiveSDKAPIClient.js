var crypto = require('crypto');
var dateFormat = require('dateformat');
var request = require('request');
var rp = require('request-promise');
var queryString = require('querystring');

var vsisionLiveDefault = {
    API_NAME_PREFIX : "vision",
    PARAM_METHOD_KEY : "_method",
    PARAM_APP_KEY_KEY : "_app_key",
    PARAM_FORMAT_KEY : "_format",
    PARAM_TIMESTAMP_KEY : "_timestamp",
    PARAM_VERSION_KEY : "_v",
    PARAM_SIGN_KEY : "_sign",
    recursiveHandler :  {
            get:function(target, name){
                var next = target();
                next.next(name)
                return new Proxy(function(){return next;}, vsisionLiveDefault.recursiveHandler);
            },
            apply:function(target, thisObj, argList){
                var targetObj = target();
                return targetObj.execute(argList);
            }
    }
}

var vsisionLiveAPIClient = module.exports = function(options){
    this.API_VERSION = '1.0'
    this.FORMAT = 'json'; // 'xml'
    this.serverUrl = options.serverUrl;
    this.app_key = options.app_key;
    this.app_secret = options.app_secret;
}

vsisionLiveAPIClient.prototype = {
    _getTimeStamp:function(){
        var now = new Date();
        return now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    },
    _generateParams:function(methodName, parameters){
        params = {}
        if(parameters.length > 0 && typeof(parameters[0]) == 'object'){
            var firstParameter = parameters[0]
            for(var key in firstParameter){
                if(key && typeof firstParameter[key] != 'undefined' && firstParameter[key])
                    params[key] = firstParameter[key]
            }
        }
        
        params[vsisionLiveDefault.PARAM_METHOD_KEY] = methodName;
        params[vsisionLiveDefault.PARAM_VERSION_KEY] = this.API_VERSION;
        params[vsisionLiveDefault.PARAM_APP_KEY_KEY] = this.app_key;
        params[vsisionLiveDefault.PARAM_FORMAT_KEY] = this.FORMAT;
        params[vsisionLiveDefault.PARAM_TIMESTAMP_KEY] = this._getTimeStamp();
        
        params[vsisionLiveDefault.PARAM_SIGN_KEY] = this._sign(params);

        return params
    },
    _sortIgnoreCase:function(keys){
        dictOfKeys = {};
        lowerCaseKeys = [];
        for(var i=0;i<keys.length;i++){
            lowercaseKey = keys[i].toLowerCase();
            dictOfKeys[lowercaseKey] = i;
            lowerCaseKeys[i] = lowercaseKey;
        }
        lowerCaseKeys.sort();
        var result = [];
        for(var i=0;i<lowerCaseKeys.length;i++){
            result[i] = keys[dictOfKeys[lowerCaseKeys[i]]]
        }        
        return result
    },
    _sign:function(params){
        // Step 1: order parameters by name alphabetically
        keys = this._sortIgnoreCase(Object.getOwnPropertyNames(params));
        

        // Step 2: contact all parameters name and parameter value 
        query = this.app_secret
        for(var i=0;i<keys.length;i++){
            var key = keys[i];
            if(key && params[key]){                
                query = query + key + params[key].toString();
            }
        }

        // Step 3: encrypt with MD5
        hash = crypto.createHash("md5");
        hash.update(query, 'utf-8');

        // Step 4: convert the binary to uppercase hexadecimal    
        return hash.digest('hex').toUpperCase();
    },

    getService : function(){
        var $this = this;
        return new Proxy(
            function(){
                return {
                    next: function(propertyName){
                        if(typeof this.methodName == 'undefined')
                            this.methodName = '';
                        if(this.methodName.length>0)
                            this.methodName += ".";
                        this.methodName += "" + propertyName;
                    },
                    execute:function(args){
                        return $this.execute(this.methodName, args);
                    }
                };
            }, 
            vsisionLiveDefault.recursiveHandler)
    },
    execute : function(methodName, args){        
        var params = this._generateParams(methodName, args)
        return rp({
            url: this.serverUrl,
            form: params,
            method: "POST",
            json: true
        });
    }
}