/*
   The MIT License (MIT)

   Copyright (c) 2016 Meetecho

   Permission is hereby granted, free of charge, to any person obtaining
   a copy of this software and associated documentation files (the "Software"),
   to deal in the Software without restriction, including without limitation
   the rights to use, copy, modify, merge, publish, distribute, sublicense,
   and/or sell copies of the Software, and to permit persons to whom the
   Software is furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included
   in all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
   OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
   OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
   ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
   OTHER DEALINGS IN THE SOFTWARE.
 */

// List of sessions
Janus.sessions = {};

Janus.isExtensionEnabled = function() {
   if(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      // No need for the extension, getDisplayMedia is supported
      return true;
   }
   if(window.navigator.userAgent.match('Chrome')) {
      var chromever = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
      var maxver = 33;
      if(window.navigator.userAgent.match('Linux'))
         maxver = 35;   // "known" crash in chrome 34 and 35 on linux
      if(chromever >= 26 && chromever <= maxver) {
         // Older versions of Chrome don't support this extension-based approach, so lie
         return true;
      }
      return Janus.extension.isInstalled();
   } else {
      // Firefox and others, no need for the extension (but this doesn't mean it will work)
      return true;
   }
};

var defaultExtension = {
   // Screensharing Chrome Extension ID
   extensionId: 'hapfgfdkleiggjjpfpenajgdnfckjpaj',
   isInstalled: function() { return document.querySelector('#janus-extension-installed') !== null; },
   getScreen: function (callback) {
      var pending = window.setTimeout(function () {
         var error = new Error('NavigatorUserMediaError');
         error.name = 'The required Chrome extension is not installed: click <a href="#">here</a> to install it. (NOTE: this will need you to refresh the page)';
         return callback(error);
      }, 1000);
      this.cache[pending] = callback;
      window.postMessage({ type: 'janusGetScreen', id: pending }, '*');
   },
   init: function () {
      var cache = {};
      this.cache = cache;
      // Wait for events from the Chrome Extension
      window.addEventListener('message', function (event) {
         if(event.origin != window.location.origin)
            return;
         if(event.data.type == 'janusGotScreen' && cache[event.data.id]) {
            var callback = cache[event.data.id];
            delete cache[event.data.id];

            if (event.data.sourceId === '') {
               // user canceled
               var error = new Error('NavigatorUserMediaError');
               error.name = 'You cancelled the request for permission, giving up...';
               callback(error);
            } else {
               callback(null, event.data.sourceId);
            }
         } else if (event.data.type == 'janusGetScreenPending') {
            console.log('clearing ', event.data.id);
            window.clearTimeout(event.data.id);
         }
      });
   }
};

Janus.useDefaultDependencies = function (deps) {
   var f = (deps && deps.fetch) || fetch;
   var p = (deps && deps.Promise) || Promise;
   var socketCls = (deps && deps.WebSocket) || WebSocket;

   return {
      newWebSocket: function(server, proto) { return new socketCls(server, proto); },
      extension: (deps && deps.extension) || defaultExtension,
      isArray: function(arr) { return Array.isArray(arr); },
      webRTCAdapter: (deps && deps.adapter) || adapter,
      httpAPICall: function(url, options) {
         var fetchOptions = {
            method: options.verb,
            headers: {
               'Accept': 'application/json, text/plain, */*'
            },
            cache: 'no-cache'
         };
         if(options.verb === "POST") {
            fetchOptions.headers['Content-Type'] = 'application/json';
         }
         if(options.withCredentials !== undefined) {
            fetchOptions.credentials = options.withCredentials === true ? 'include' : (options.withCredentials ? options.withCredentials : 'omit');
         }
         if(options.body) {
            fetchOptions.body = JSON.stringify(options.body);
         }

         var fetching = f(url, fetchOptions).catch(function(error) {
            return p.reject({message: 'Probably a network error, is the server down?', error: error});
         });

         /*
          * fetch() does not natively support timeouts.
          * Work around this by starting a timeout manually, and racing it agains the fetch() to see which thing resolves first.
          */

         if(options.timeout) {
            var timeout = new p(function(resolve, reject) {
               var timerId = setTimeout(function() {
                  clearTimeout(timerId);
                  return reject({message: 'Request timed out', timeout: options.timeout});
               }, options.timeout);
            });
            fetching = p.race([fetching, timeout]);
         }

         fetching.then(function(response) {
            if(response.ok) {
               if(typeof(options.success) === typeof(Janus.noop)) {
                  return response.json().then(function(parsed) {
                     options.success(parsed);
                  }).catch(function(error) {
                     return p.reject({message: 'Failed to parse response body', error: error, response: response});
                  });
               }
            }
            else {
               return p.reject({message: 'API call failed', response: response});
            }
         }).catch(function(error) {
            if(typeof(options.error) === typeof(Janus.noop)) {
               options.error(error.message || '<< internal error >>', error);
            }
         });

         return fetching;
      }
   }
};

Janus.useOldDependencies = function (deps) {
   var jq = (deps && deps.jQuery) || jQuery;
   var socketCls = (deps && deps.WebSocket) || WebSocket;
   return {
      newWebSocket: function(server, proto) { return new socketCls(server, proto); },
      isArray: function(arr) { return jq.isArray(arr); },
      extension: (deps && deps.extension) || defaultExtension,
      webRTCAdapter: (deps && deps.adapter) || adapter,
      httpAPICall: function(url, options) {
         var payload = options.body !== undefined ? {
            contentType: 'application/json',
            data: JSON.stringify(options.body)
         } : {};
         var credentials = options.withCredentials !== undefined ? {xhrFields: {withCredentials: options.withCredentials}} : {};

         return jq.ajax(jq.extend(payload, credentials, {
            url: url,
            type: options.verb,
            cache: false,
            dataType: 'json',
            async: options.async,
            timeout: options.timeout,
            success: function(result) {
               if(typeof(options.success) === typeof(Janus.noop)) {
                  options.success(result);
               }
            },
            error: function(xhr, status, err) {
               if(typeof(options.error) === typeof(Janus.noop)) {
                  options.error(status, err);
               }
            }
         }));
      }
   };
};

Janus.noop = function() {};

Janus.dataChanDefaultLabel = "JanusDataChannel";

// Note: in the future we may want to change this, e.g., as was
// attempted in https://github.com/meetecho/janus-gateway/issues/1670
Janus.endOfCandidates = null;

// Stop all tracks from a given stream
Janus.stopAllTracks = function(stream) {
   try {
      // Try a MediaStreamTrack.stop() for each track
      var tracks = stream.getTracks();
      for(var mst of tracks) {
         Janus.log(mst);
         if(mst) {
            mst.stop();
         }
      }
   } catch(e) {
      // Do nothing if this fails
   }
}

// Initialization
Janus.init = function(options) {
   options = options || {};
   options.callback = (typeof options.callback == "function") ? options.callback : Janus.noop;
   if(Janus.initDone) {
      // Already initialized
      options.callback();
   } else {
      if(typeof console == "undefined" || typeof console.log == "undefined") {
         console = { log: function() {} };
      }
      // Console logging (all debugging disabled by default)
      Janus.trace = Janus.noop;
      Janus.debug = Janus.noop;
      Janus.vdebug = Janus.noop;
      Janus.log = Janus.noop;
      Janus.warn = Janus.noop;
      Janus.error = Janus.noop;
      if(options.debug === true || options.debug === "all") {
         // Enable all debugging levels
         Janus.trace = console.trace.bind(console);
         Janus.debug = console.debug.bind(console);
         Janus.vdebug = console.debug.bind(console);
         Janus.log = console.log.bind(console);
         Janus.warn = console.warn.bind(console);
         Janus.error = console.error.bind(console);
      } else if(Array.isArray(options.debug)) {
         for(var d of options.debug) {
            switch(d) {
               case "trace":
                  Janus.trace = console.trace.bind(console);
                  break;
               case "debug":
                  Janus.debug = console.debug.bind(console);
                  break;
               case "vdebug":
                  Janus.vdebug = console.debug.bind(console);
                  break;
               case "log":
                  Janus.log = console.log.bind(console);
                  break;
               case "warn":
                  Janus.warn = console.warn.bind(console);
                  break;
               case "error":
                  Janus.error = console.error.bind(console);
                  break;
               default:
                  console.error("Unknown debugging option '" + d + "' (supported: 'trace', 'debug', 'vdebug', 'log', warn', 'error')");
                  break;
            }
         }
      }
      Janus.log("Initializing library");

      var usedDependencies = options.dependencies || Janus.useDefaultDependencies();
      Janus.isArray = usedDependencies.isArray;
      Janus.webRTCAdapter = usedDependencies.webRTCAdapter;
      Janus.httpAPICall = usedDependencies.httpAPICall;
      Janus.newWebSocket = usedDependencies.newWebSocket;
      Janus.extension = usedDependencies.extension;
      Janus.extension.init();

      // Helper method to enumerate devices
      Janus.listDevices = function(callback, config) {
         callback = (typeof callback == "function") ? callback : Janus.noop;
         if (config == null) config = { audio: true, video: true };
         if(Janus.isGetUserMediaAvailable()) {
            navigator.mediaDevices.getUserMedia(config)
            .then(function(stream) {
               navigator.mediaDevices.enumerateDevices().then(function(devices) {
                  Janus.debug(devices);
                  callback(devices);
                  // Get rid of the now useless stream
                  Janus.stopAllTracks(stream)
               });
            })
            .catch(function(err) {
               Janus.error(err);
               callback([]);
            });
         } else {
            Janus.warn("navigator.mediaDevices unavailable");
            callback([]);
         }
      };
      // Helper methods to attach/reattach a stream to a video element (previously part of adapter.js)
      Janus.attachMediaStream = function(element, stream) {
         try {
            element.srcObject = stream;
         } catch (e) {
            try {
               element.src = URL.createObjectURL(stream);
            } catch (e) {
               Janus.error("Error attaching stream to element");
            }
         }
      };
      Janus.reattachMediaStream = function(to, from) {
         try {
            to.srcObject = from.srcObject;
         } catch (e) {
            try {
               to.src = from.src;
            } catch (e) {
               Janus.error("Error reattaching stream to element");
            }
         }
      };
      // Detect tab close: make sure we don't loose existing onbeforeunload handlers
      // (note: for iOS we need to subscribe to a different event, 'pagehide', see
      // https://gist.github.com/thehunmonkgroup/6bee8941a49b86be31a787fe8f4b8cfe)
      var iOS = ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
      var eventName = iOS ? 'pagehide' : 'beforeunload';
      var oldOBF = window["on" + eventName];
      window.addEventListener(eventName, function(event) {
         Janus.log("Closing window");
         for(var s in Janus.sessions) {
            if(Janus.sessions[s] && Janus.sessions[s].destroyOnUnload) {
               Janus.log("Destroying session " + s);
               Janus.sessions[s].destroy({unload: true, notifyDestroyed: false});
            }
         }
         if(oldOBF && typeof oldOBF == "function") {
            oldOBF();
         }
      });
      // If this is a Safari Technology Preview, check if VP8 is supported
      Janus.safariVp8 = false;
      if(Janus.webRTCAdapter.browserDetails.browser === 'safari' &&
            Janus.webRTCAdapter.browserDetails.version >= 605) {
         // Let's see if RTCRtpSender.getCapabilities() is there
         if(RTCRtpSender && RTCRtpSender.getCapabilities && RTCRtpSender.getCapabilities("video") &&
               RTCRtpSender.getCapabilities("video").codecs && RTCRtpSender.getCapabilities("video").codecs.length) {
            for(var codec of RTCRtpSender.getCapabilities("video").codecs) {
               if(codec && codec.mimeType && codec.mimeType.toLowerCase() === "video/vp8") {
                  Janus.safariVp8 = true;
                  break;
               }
            }
            if(Janus.safariVp8) {
               Janus.log("This version of Safari supports VP8");
            } else {
               Janus.warn("This version of Safari does NOT support VP8: if you're using a Technology Preview, " +
                  "try enabling the 'WebRTC VP8 codec' setting in the 'Experimental Features' Develop menu");
            }
         } else {
            // We do it in a very ugly way, as there's no alternative...
            // We create a PeerConnection to see if VP8 is in an offer
            var testpc = new RTCPeerConnection({});
            testpc.createOffer({offerToReceiveVideo: true}).then(function(offer) {
               Janus.safariVp8 = offer.sdp.indexOf("VP8") !== -1;
               if(Janus.safariVp8) {
                  Janus.log("This version of Safari supports VP8");
               } else {
                  Janus.warn("This version of Safari does NOT support VP8: if you're using a Technology Preview, " +
                     "try enabling the 'WebRTC VP8 codec' setting in the 'Experimental Features' Develop menu");
               }
               testpc.close();
               testpc = null;
            });
         }
      }
      // Check if this browser supports Unified Plan and transceivers
      // Based on https://codepen.io/anon/pen/ZqLwWV?editors=0010
      Janus.unifiedPlan = false;
      if(Janus.webRTCAdapter.browserDetails.browser === 'firefox' &&
            Janus.webRTCAdapter.browserDetails.version >= 59) {
         // Firefox definitely does, starting from version 59
         Janus.unifiedPlan = true;
      } else if(Janus.webRTCAdapter.browserDetails.browser === 'chrome' &&
            Janus.webRTCAdapter.browserDetails.version >= 72) {
         // Chrome does, but it's only usable from version 72 on
         Janus.unifiedPlan = true;
      } else if(!window.RTCRtpTransceiver || !('currentDirection' in RTCRtpTransceiver.prototype)) {
         // Safari supports addTransceiver() but not Unified Plan when
         // currentDirection is not defined (see codepen above).
         Janus.unifiedPlan = false;
      } else {
         // Check if addTransceiver() throws an exception
         var tempPc = new RTCPeerConnection();
         try {
            tempPc.addTransceiver('audio');
            Janus.unifiedPlan = true;
         } catch (e) {}
         tempPc.close();
      }
      Janus.initDone = true;
      options.callback();
   }
};

// Helper method to check whether WebRTC is supported by this browser
Janus.isWebrtcSupported = function() {
   return !!window.RTCPeerConnection;
};
// Helper method to check whether devices can be accessed by this browser (e.g., not possible via plain HTTP)
Janus.isGetUserMediaAvailable = function() {
   return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
};

// Helper method to create random identifiers (e.g., transaction)
Janus.randomString = function(len) {
   var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var randomString = '';
   for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
   }
   return randomString;
};

function Janus(gatewayCallbacks) {
   gatewayCallbacks = gatewayCallbacks || {};
   gatewayCallbacks.success = (typeof gatewayCallbacks.success == "function") ? gatewayCallbacks.success : Janus.noop;
   gatewayCallbacks.error = (typeof gatewayCallbacks.error == "function") ? gatewayCallbacks.error : Janus.noop;
   gatewayCallbacks.destroyed = (typeof gatewayCallbacks.destroyed == "function") ? gatewayCallbacks.destroyed : Janus.noop;
   if(!Janus.initDone) {
      gatewayCallbacks.error("Library not initialized");
      return {};
   }
   if(!Janus.isWebrtcSupported()) {
      gatewayCallbacks.error("WebRTC not supported by this browser");
      return {};
   }
   Janus.log("Library initialized: " + Janus.initDone);
   if(!gatewayCallbacks.server) {
      gatewayCallbacks.error("Invalid server url");
      return {};
   }
   var websockets = false;
   var ws = null;
   var wsHandlers = {};
   var wsKeepaliveTimeoutId = null;
   var servers = null;
   var serversIndex = 0;
   var server = gatewayCallbacks.server;
   if(Janus.isArray(server)) {
      Janus.log("Multiple servers provided (" + server.length + "), will use the first that works");
      server = null;
      servers = gatewayCallbacks.server;
      Janus.debug(servers);
   } else {
      if(server.indexOf("ws") === 0) {
         websockets = true;
         Janus.log("Using WebSockets to contact Janus: " + server);
      } else {
         websockets = false;
         Janus.log("Using REST API to contact Janus: " + server);
      }
   }
   var iceServers = gatewayCallbacks.iceServers || [{urls: "stun:stun.l.google.com:19302"}];
   var iceTransportPolicy = gatewayCallbacks.iceTransportPolicy;
   var bundlePolicy = gatewayCallbacks.bundlePolicy;
   // Whether IPv6 candidates should be gathered
   var ipv6Support = (gatewayCallbacks.ipv6 === true);
   // Whether we should enable the withCredentials flag for XHR requests
   var withCredentials = false;
   if(gatewayCallbacks.withCredentials !== undefined && gatewayCallbacks.withCredentials !== null)
      withCredentials = gatewayCallbacks.withCredentials === true;
   // Optional max events
   var maxev = 10;
   if(gatewayCallbacks.max_poll_events !== undefined && gatewayCallbacks.max_poll_events !== null)
      maxev = gatewayCallbacks.max_poll_events;
   if(maxev < 1)
      maxev = 1;
   // Token to use (only if the token based authentication mechanism is enabled)
   var token = null;
   if(gatewayCallbacks.token !== undefined && gatewayCallbacks.token !== null)
      token = gatewayCallbacks.token;
   // API secret to use (only if the shared API secret is enabled)
   var apisecret = null;
   if(gatewayCallbacks.apisecret !== undefined && gatewayCallbacks.apisecret !== null)
      apisecret = gatewayCallbacks.apisecret;
   // Whether we should destroy this session when onbeforeunload is called
   this.destroyOnUnload = true;
   if(gatewayCallbacks.destroyOnUnload !== undefined && gatewayCallbacks.destroyOnUnload !== null)
      this.destroyOnUnload = (gatewayCallbacks.destroyOnUnload === true);
   // Some timeout-related values
   var keepAlivePeriod = 25000;
   if(gatewayCallbacks.keepAlivePeriod !== undefined && gatewayCallbacks.keepAlivePeriod !== null)
      keepAlivePeriod = gatewayCallbacks.keepAlivePeriod;
   if(isNaN(keepAlivePeriod))
      keepAlivePeriod = 25000;
   var longPollTimeout = 60000;
   if(gatewayCallbacks.longPollTimeout !== undefined && gatewayCallbacks.longPollTimeout !== null)
      longPollTimeout = gatewayCallbacks.longPollTimeout;
   if(isNaN(longPollTimeout))
      longPollTimeout = 60000;

   // overrides for default maxBitrate values for simulcasting
   function getMaxBitrates(simulcastMaxBitrates) {
      var maxBitrates = {
         high: 900000,
         medium: 300000,
         low: 100000,
      };

      if (simulcastMaxBitrates !== undefined && simulcastMaxBitrates !== null) {
         if (simulcastMaxBitrates.high)
            maxBitrates.high = simulcastMaxBitrates.high;
         if (simulcastMaxBitrates.medium)
            maxBitrates.medium = simulcastMaxBitrates.medium;
         if (simulcastMaxBitrates.low)
            maxBitrates.low = simulcastMaxBitrates.low;
      }

      return maxBitrates;
   }

   var connected = false;
   var sessionId = null;
   var pluginHandles = {};
   var that = this;
   var retries = 0;
   var transactions = {};
   createSession(gatewayCallbacks);

   // Public methods
   this.getServer = function() { return server; };
   this.isConnected = function() { return connected; };
   this.reconnect = function(callbacks) {
      callbacks = callbacks || {};
      callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
      callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
      callbacks["reconnect"] = true;
      createSession(callbacks);
   };
   this.getSessionId = function() { return sessionId; };
   this.getInfo = function(callbacks) { getInfo(callbacks); };
   this.destroy = function(callbacks) { destroySession(callbacks); };
   this.attach = function(callbacks) { createHandle(callbacks); };

   function eventHandler() {
      if(sessionId == null)
         return;
      Janus.debug('Long poll...');
      if(!connected) {
         Janus.warn("Is the server down? (connected=false)");
         return;
      }
      var longpoll = server + "/" + sessionId + "?rid=" + new Date().getTime();
      if(maxev)
         longpoll = longpoll + "&maxev=" + maxev;
      if(token)
         longpoll = longpoll + "&token=" + encodeURIComponent(token);
      if(apisecret)
         longpoll = longpoll + "&apisecret=" + encodeURIComponent(apisecret);
      Janus.httpAPICall(longpoll, {
         verb: 'GET',
         withCredentials: withCredentials,
         success: handleEvent,
         timeout: longPollTimeout,
         error: function(textStatus, errorThrown) {
            Janus.error(textStatus + ":", errorThrown);
            retries++;
            if(retries > 3) {
               // Did we just lose the server? :-(
               connected = false;
               gatewayCallbacks.error("Lost connection to the server (is it down?)");
               return;
            }
            eventHandler();
         }
      });
   }

   // Private event handler: this will trigger plugin callbacks, if set
   function handleEvent(json, skipTimeout) {
      retries = 0;
      if(!websockets && sessionId !== undefined && sessionId !== null && skipTimeout !== true)
         eventHandler();
      if(!websockets && Janus.isArray(json)) {
         // We got an array: it means we passed a maxev > 1, iterate on all objects
         for(var i=0; i<json.length; i++) {
            handleEvent(json[i], true);
         }
         return;
      }
      if(json["janus"] === "keepalive") {
         // Nothing happened
         Janus.vdebug("Got a keepalive on session " + sessionId);
         return;
      } else if(json["janus"] === "server_info") {
         // Just info on the Janus instance
         Janus.debug("Got info on the Janus instance");
         Janus.debug(json);
         var transaction = json["transaction"];
         if(transaction) {
            var reportSuccess = transactions[transaction];
            if(reportSuccess)
               reportSuccess(json);
            delete transactions[transaction];
         }
         return;
      } else if(json["janus"] === "ack") {
         // Just an ack, we can probably ignore
         Janus.debug("Got an ack on session " + sessionId);
         Janus.debug(json);
         var transaction = json["transaction"];
         if(transaction) {
            var reportSuccess = transactions[transaction];
            if(reportSuccess)
               reportSuccess(json);
            delete transactions[transaction];
         }
         return;
      } else if(json["janus"] === "success") {
         // Success!
         Janus.debug("Got a success on session " + sessionId);
         Janus.debug(json);
         var transaction = json["transaction"];
         if(transaction) {
            var reportSuccess = transactions[transaction];
            if(reportSuccess)
               reportSuccess(json);
            delete transactions[transaction];
         }
         return;
      } else if(json["janus"] === "trickle") {
         // We got a trickle candidate from Janus
         var sender = json["sender"];
         if(!sender) {
            Janus.warn("Missing sender...");
            return;
         }
         var pluginHandle = pluginHandles[sender];
         if(!pluginHandle) {
            Janus.debug("This handle is not attached to this session");
            return;
         }
         var candidate = json["candidate"];
         Janus.debug("Got a trickled candidate on session " + sessionId);
         Janus.debug(candidate);
         var config = pluginHandle.webrtcStuff;
         if(config.pc && config.remoteSdp) {
            // Add candidate right now
            Janus.debug("Adding remote candidate:", candidate);
            if(!candidate || candidate.completed === true) {
               // end-of-candidates
               config.pc.addIceCandidate(Janus.endOfCandidates);
            } else {
               // New candidate
               config.pc.addIceCandidate(candidate);
            }
         } else {
            // We didn't do setRemoteDescription (trickle got here before the offer?)
            Janus.debug("We didn't do setRemoteDescription (trickle got here before the offer?), caching candidate");
            if(!config.candidates)
               config.candidates = [];
            config.candidates.push(candidate);
            Janus.debug(config.candidates);
         }
      } else if(json["janus"] === "webrtcup") {
         // The PeerConnection with the server is up! Notify this
         Janus.debug("Got a webrtcup event on session " + sessionId);
         Janus.debug(json);
         var sender = json["sender"];
         if(!sender) {
            Janus.warn("Missing sender...");
            return;
         }
         var pluginHandle = pluginHandles[sender];
         if(!pluginHandle) {
            Janus.debug("This handle is not attached to this session");
            return;
         }
         pluginHandle.webrtcState(true);
         return;
      } else if(json["janus"] === "hangup") {
         // A plugin asked the core to hangup a PeerConnection on one of our handles
         Janus.debug("Got a hangup event on session " + sessionId);
         Janus.debug(json);
         var sender = json["sender"];
         if(!sender) {
            Janus.warn("Missing sender...");
            return;
         }
         var pluginHandle = pluginHandles[sender];
         if(!pluginHandle) {
            Janus.debug("This handle is not attached to this session");
            return;
         }
         pluginHandle.webrtcState(false, json["reason"]);
         pluginHandle.hangup();
      } else if(json["janus"] === "detached") {
         // A plugin asked the core to detach one of our handles
         Janus.debug("Got a detached event on session " + sessionId);
         Janus.debug(json);
         var sender = json["sender"];
         if(!sender) {
            Janus.warn("Missing sender...");
            return;
         }
         var pluginHandle = pluginHandles[sender];
         if(!pluginHandle) {
            // Don't warn here because destroyHandle causes this situation.
            return;
         }
         pluginHandle.detached = true;
         pluginHandle.ondetached();
         pluginHandle.detach();
      } else if(json["janus"] === "media") {
         // Media started/stopped flowing
         Janus.debug("Got a media event on session " + sessionId);
         Janus.debug(json);
         var sender = json["sender"];
         if(!sender) {
            Janus.warn("Missing sender...");
            return;
         }
         var pluginHandle = pluginHandles[sender];
         if(!pluginHandle) {
            Janus.debug("This handle is not attached to this session");
            return;
         }
         pluginHandle.mediaState(json["type"], json["receiving"]);
      } else if(json["janus"] === "slowlink") {
         Janus.debug("Got a slowlink event on session " + sessionId);
         Janus.debug(json);
         // Trouble uplink or downlink
         var sender = json["sender"];
         if(!sender) {
            Janus.warn("Missing sender...");
            return;
         }
         var pluginHandle = pluginHandles[sender];
         if(!pluginHandle) {
            Janus.debug("This handle is not attached to this session");
            return;
         }
         pluginHandle.slowLink(json["uplink"], json["lost"]);
      } else if(json["janus"] === "error") {
         // Oops, something wrong happened
         Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
         Janus.debug(json);
         var transaction = json["transaction"];
         if(transaction) {
            var reportSuccess = transactions[transaction];
            if(reportSuccess) {
               reportSuccess(json);
            }
            delete transactions[transaction];
         }
         return;
      } else if(json["janus"] === "event") {
         Janus.debug("Got a plugin event on session " + sessionId);
         Janus.debug(json);
         var sender = json["sender"];
         if(!sender) {
            Janus.warn("Missing sender...");
            return;
         }
         var plugindata = json["plugindata"];
         if(!plugindata) {
            Janus.warn("Missing plugindata...");
            return;
         }
         Janus.debug("  -- Event is coming from " + sender + " (" + plugindata["plugin"] + ")");
         var data = plugindata["data"];
         Janus.debug(data);
         var pluginHandle = pluginHandles[sender];
         if(!pluginHandle) {
            Janus.warn("This handle is not attached to this session");
            return;
         }
         var jsep = json["jsep"];
         if(jsep) {
            Janus.debug("Handling SDP as well...");
            Janus.debug(jsep);
         }
         var callback = pluginHandle.onmessage;
         if(callback) {
            Janus.debug("Notifying application...");
            // Send to callback specified when attaching plugin handle
            callback(data, jsep);
         } else {
            // Send to generic callback (?)
            Janus.debug("No provided notification callback");
         }
      } else if(json["janus"] === "timeout") {
         Janus.error("Timeout on session " + sessionId);
         Janus.debug(json);
         if (websockets) {
            ws.close(3504, "Gateway timeout");
         }
         return;
      } else {
         Janus.warn("Unknown message/event  '" + json["janus"] + "' on session " + sessionId);
         Janus.debug(json);
      }
   }

   // Private helper to send keep-alive messages on WebSockets
   function keepAlive() {
      if(!server || !websockets || !connected)
         return;
      wsKeepaliveTimeoutId = setTimeout(keepAlive, keepAlivePeriod);
      var request = { "janus": "keepalive", "session_id": sessionId, "transaction": Janus.randomString(12) };
      if(token)
         request["token"] = token;
      if(apisecret)
         request["apisecret"] = apisecret;
      ws.send(JSON.stringify(request));
   }

   // Private method to create a session
   function createSession(callbacks) {
      var transaction = Janus.randomString(12);
      var request = { "janus": "create", "transaction": transaction };
      if(callbacks["reconnect"]) {
         // We're reconnecting, claim the session
         connected = false;
         request["janus"] = "claim";
         request["session_id"] = sessionId;
         // If we were using websockets, ignore the old connection
         if(ws) {
            ws.onopen = null;
            ws.onerror = null;
            ws.onclose = null;
            if(wsKeepaliveTimeoutId) {
               clearTimeout(wsKeepaliveTimeoutId);
               wsKeepaliveTimeoutId = null;
            }
         }
      }
      if(token)
         request["token"] = token;
      if(apisecret)
         request["apisecret"] = apisecret;
      if(!server && Janus.isArray(servers)) {
         // We still need to find a working server from the list we were given
         server = servers[serversIndex];
         if(server.indexOf("ws") === 0) {
            websockets = true;
            Janus.log("Server #" + (serversIndex+1) + ": trying WebSockets to contact Janus (" + server + ")");
         } else {
            websockets = false;
            Janus.log("Server #" + (serversIndex+1) + ": trying REST API to contact Janus (" + server + ")");
         }
      }
      if(websockets) {
         ws = Janus.newWebSocket(server, 'janus-protocol');
         wsHandlers = {
            'error': function() {
               Janus.error("Error connecting to the Janus WebSockets server... " + server);
               if (Janus.isArray(servers) && !callbacks["reconnect"]) {
                  serversIndex++;
                  if (serversIndex === servers.length) {
                     // We tried all the servers the user gave us and they all failed
                     callbacks.error("Error connecting to any of the provided Janus servers: Is the server down?");
                     return;
                  }
                  // Let's try the next server
                  server = null;
                  setTimeout(function() {
                     createSession(callbacks);
                  }, 200);
                  return;
               }
               callbacks.error("Error connecting to the Janus WebSockets server: Is the server down?");
            },

            'open': function() {
               // We need to be notified about the success
               transactions[transaction] = function(json) {
                  Janus.debug(json);
                  if (json["janus"] !== "success") {
                     Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
                     callbacks.error(json["error"].reason);
                     return;
                  }
                  wsKeepaliveTimeoutId = setTimeout(keepAlive, keepAlivePeriod);
                  connected = true;
                  sessionId = json["session_id"] ? json["session_id"] : json.data["id"];
                  if(callbacks["reconnect"]) {
                     Janus.log("Claimed session: " + sessionId);
                  } else {
                     Janus.log("Created session: " + sessionId);
                  }
                  Janus.sessions[sessionId] = that;
                  callbacks.success();
               };
               ws.send(JSON.stringify(request));
            },

            'message': function(event) {
               handleEvent(JSON.parse(event.data));
            },

            'close': function() {
               if (!server || !connected) {
                  return;
               }
               connected = false;
               // FIXME What if this is called when the page is closed?
               gatewayCallbacks.error("Lost connection to the server (is it down?)");
            }
         };

         for(var eventName in wsHandlers) {
            ws.addEventListener(eventName, wsHandlers[eventName]);
         }

         return;
      }
      Janus.httpAPICall(server, {
         verb: 'POST',
         withCredentials: withCredentials,
         body: request,
         success: function(json) {
            Janus.debug(json);
            if(json["janus"] !== "success") {
               Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
               callbacks.error(json["error"].reason);
               return;
            }
            connected = true;
            sessionId = json["session_id"] ? json["session_id"] : json.data["id"];
            if(callbacks["reconnect"]) {
               Janus.log("Claimed session: " + sessionId);
            } else {
               Janus.log("Created session: " + sessionId);
            }
            Janus.sessions[sessionId] = that;
            eventHandler();
            callbacks.success();
         },
         error: function(textStatus, errorThrown) {
            Janus.error(textStatus + ":", errorThrown);   // FIXME
            if(Janus.isArray(servers) && !callbacks["reconnect"]) {
               serversIndex++;
               if(serversIndex === servers.length) {
                  // We tried all the servers the user gave us and they all failed
                  callbacks.error("Error connecting to any of the provided Janus servers: Is the server down?");
                  return;
               }
               // Let's try the next server
               server = null;
               setTimeout(function() { createSession(callbacks); }, 200);
               return;
            }
            if(errorThrown === "")
               callbacks.error(textStatus + ": Is the server down?");
            else
               callbacks.error(textStatus + ": " + errorThrown);
         }
      });
   }

   // Private method to get info on the server
   function getInfo(callbacks) {
      callbacks = callbacks || {};
      // FIXME This method triggers a success even when we fail
      callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
      callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
      Janus.log("Getting info on Janus instance");
      if(!connected) {
         Janus.warn("Is the server down? (connected=false)");
         callbacks.error("Is the server down? (connected=false)");
         return;
      }
      // We just need to send an "info" request
      var transaction = Janus.randomString(12);
      var request = { "janus": "info", "transaction": transaction };
      if(token)
         request["token"] = token;
      if(apisecret)
         request["apisecret"] = apisecret;
      if(websockets) {
         transactions[transaction] = function(json) {
            Janus.log("Server info:");
            Janus.debug(json);
            if(json["janus"] !== "server_info") {
               Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
            }
            callbacks.success(json);
         }
         ws.send(JSON.stringify(request));
         return;
      }
      Janus.httpAPICall(server, {
         verb: 'POST',
         withCredentials: withCredentials,
         body: request,
         success: function(json) {
            Janus.log("Server info:");
            Janus.debug(json);
            if(json["janus"] !== "server_info") {
               Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
            }
            callbacks.success(json);
         },
         error: function(textStatus, errorThrown) {
            Janus.error(textStatus + ":", errorThrown);   // FIXME
            if(errorThrown === "")
               callbacks.error(textStatus + ": Is the server down?");
            else
               callbacks.error(textStatus + ": " + errorThrown);
         }
      });
   }

   // Private method to destroy a session
   function destroySession(callbacks) {
      callbacks = callbacks || {};
      // FIXME This method triggers a success even when we fail
      callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
      callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
      var unload = (callbacks.unload === true);
      var notifyDestroyed = true;
      if(callbacks.notifyDestroyed !== undefined && callbacks.notifyDestroyed !== null)
         notifyDestroyed = (callbacks.notifyDestroyed === true);
      var cleanupHandles = (callbacks.cleanupHandles === true);
      Janus.log("Destroying session " + sessionId + " (unload=" + unload + ")");
      if(!sessionId) {
         Janus.warn("No session to destroy");
         callbacks.success();
         if(notifyDestroyed)
            gatewayCallbacks.destroyed();
         return;
      }
      if(cleanupHandles) {
         for(var handleId in pluginHandles)
            destroyHandle(handleId, { noRequest: true });
      }
      if(!connected) {
         Janus.warn("Is the server down? (connected=false)");
         sessionId = null;
         callbacks.success();
         return;
      }
      // No need to destroy all handles first, Janus will do that itself
      var request = { "janus": "destroy", "transaction": Janus.randomString(12) };
      if(token)
         request["token"] = token;
      if(apisecret)
         request["apisecret"] = apisecret;
      if(unload) {
         // We're unloading the page: use sendBeacon for HTTP instead,
         // or just close the WebSocket connection if we're using that
         if(websockets) {
            ws.onclose = null;
            ws.close();
            ws = null;
         } else {
            navigator.sendBeacon(server + "/" + sessionId, JSON.stringify(request));
         }
         Janus.log("Destroyed session:");
         sessionId = null;
         connected = false;
         callbacks.success();
         if(notifyDestroyed)
            gatewayCallbacks.destroyed();
         return;
      }
      if(websockets) {
         request["session_id"] = sessionId;

         var unbindWebSocket = function() {
            for(var eventName in wsHandlers) {
               ws.removeEventListener(eventName, wsHandlers[eventName]);
            }
            ws.removeEventListener('message', onUnbindMessage);
            ws.removeEventListener('error', onUnbindError);
            if(wsKeepaliveTimeoutId) {
               clearTimeout(wsKeepaliveTimeoutId);
            }
            ws.close();
         };

         var onUnbindMessage = function(event){
            var data = JSON.parse(event.data);
            if(data.session_id == request.session_id && data.transaction == request.transaction) {
               unbindWebSocket();
               callbacks.success();
               if(notifyDestroyed)
                  gatewayCallbacks.destroyed();
            }
         };
         var onUnbindError = function(event) {
            unbindWebSocket();
            callbacks.error("Failed to destroy the server: Is the server down?");
            if(notifyDestroyed)
               gatewayCallbacks.destroyed();
         };

         ws.addEventListener('message', onUnbindMessage);
         ws.addEventListener('error', onUnbindError);

         if (ws.readyState === 1) {
            ws.send(JSON.stringify(request));
         } else {
            onUnbindError();
         }

         return;
      }
      Janus.httpAPICall(server + "/" + sessionId, {
         verb: 'POST',
         withCredentials: withCredentials,
         body: request,
         success: function(json) {
            Janus.log("Destroyed session:");
            Janus.debug(json);
            sessionId = null;
            connected = false;
            if(json["janus"] !== "success") {
               Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
            }
            callbacks.success();
            if(notifyDestroyed)
               gatewayCallbacks.destroyed();
         },
         error: function(textStatus, errorThrown) {
            Janus.error(textStatus + ":", errorThrown);   // FIXME
            // Reset everything anyway
            sessionId = null;
            connected = false;
            callbacks.success();
            if(notifyDestroyed)
               gatewayCallbacks.destroyed();
         }
      });
   }

   // Private method to create a plugin handle
   function createHandle(callbacks) {
      callbacks = callbacks || {};
      callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
      callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
      callbacks.consentDialog = (typeof callbacks.consentDialog == "function") ? callbacks.consentDialog : Janus.noop;
      callbacks.iceState = (typeof callbacks.iceState == "function") ? callbacks.iceState : Janus.noop;
      callbacks.mediaState = (typeof callbacks.mediaState == "function") ? callbacks.mediaState : Janus.noop;
      callbacks.webrtcState = (typeof callbacks.webrtcState == "function") ? callbacks.webrtcState : Janus.noop;
      callbacks.slowLink = (typeof callbacks.slowLink == "function") ? callbacks.slowLink : Janus.noop;
      callbacks.onmessage = (typeof callbacks.onmessage == "function") ? callbacks.onmessage : Janus.noop;
      callbacks.onlocalstream = (typeof callbacks.onlocalstream == "function") ? callbacks.onlocalstream : Janus.noop;
      callbacks.onremotestream = (typeof callbacks.onremotestream == "function") ? callbacks.onremotestream : Janus.noop;
      callbacks.ondata = (typeof callbacks.ondata == "function") ? callbacks.ondata : Janus.noop;
      callbacks.ondataopen = (typeof callbacks.ondataopen == "function") ? callbacks.ondataopen : Janus.noop;
      callbacks.oncleanup = (typeof callbacks.oncleanup == "function") ? callbacks.oncleanup : Janus.noop;
      callbacks.ondetached = (typeof callbacks.ondetached == "function") ? callbacks.ondetached : Janus.noop;
      if(!connected) {
         Janus.warn("Is the server down? (connected=false)");
         callbacks.error("Is the server down? (connected=false)");
         return;
      }
      var plugin = callbacks.plugin;
      if(!plugin) {
         Janus.error("Invalid plugin");
         callbacks.error("Invalid plugin");
         return;
      }
      var opaqueId = callbacks.opaqueId;
      var handleToken = callbacks.token ? callbacks.token : token;
      var transaction = Janus.randomString(12);
      var request = { "janus": "attach", "plugin": plugin, "opaque_id": opaqueId, "transaction": transaction };
      if(handleToken)
         request["token"] = handleToken;
      if(apisecret)
         request["apisecret"] = apisecret;
      if(websockets) {
         transactions[transaction] = function(json) {
            Janus.debug(json);
            if(json["janus"] !== "success") {
               Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
               callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
               return;
            }
            var handleId = json.data["id"];
            Janus.log("Created handle: " + handleId);
            var pluginHandle =
               {
                  session : that,
                  plugin : plugin,
                  id : handleId,
                  token : handleToken,
                  detached : false,
                  webrtcStuff : {
                     started : false,
                     myStream : null,
                     streamExternal : false,
                     remoteStream : null,
                     mySdp : null,
                     mediaConstraints : null,
                     pc : null,
                     dataChannel : {},
                     dtmfSender : null,
                     trickle : true,
                     iceDone : false,
                     volume : {
                        value : null,
                        timer : null
                     },
                     bitrate : {
                        value : null,
                        bsnow : null,
                        bsbefore : null,
                        tsnow : null,
                        tsbefore : null,
                        timer : null
                     }
                  },
                  getId : function() { return handleId; },
                  getPlugin : function() { return plugin; },
                  getVolume : function() { return getVolume(handleId, true); },
                  getRemoteVolume : function() { return getVolume(handleId, true); },
                  getLocalVolume : function() { return getVolume(handleId, false); },
                  isAudioMuted : function() { return isMuted(handleId, false); },
                  muteAudio : function() { return mute(handleId, false, true); },
                  unmuteAudio : function() { return mute(handleId, false, false); },
                  isVideoMuted : function() { return isMuted(handleId, true); },
                  muteVideo : function() { return mute(handleId, true, true); },
                  unmuteVideo : function() { return mute(handleId, true, false); },
                  getBitrate : function() { return getBitrate(handleId); },
                  send : function(callbacks) { sendMessage(handleId, callbacks); },
                  data : function(callbacks) { sendData(handleId, callbacks); },
                  dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
                  consentDialog : callbacks.consentDialog,
                  iceState : callbacks.iceState,
                  mediaState : callbacks.mediaState,
                  webrtcState : callbacks.webrtcState,
                  slowLink : callbacks.slowLink,
                  onmessage : callbacks.onmessage,
                  createOffer : function(callbacks) { prepareWebrtc(handleId, true, callbacks); },
                  createAnswer : function(callbacks) { prepareWebrtc(handleId, false, callbacks); },
                  handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
                  onlocalstream : callbacks.onlocalstream,
                  onremotestream : callbacks.onremotestream,
                  ondata : callbacks.ondata,
                  ondataopen : callbacks.ondataopen,
                  oncleanup : callbacks.oncleanup,
                  ondetached : callbacks.ondetached,
                  hangup : function(sendRequest) { cleanupWebrtc(handleId, sendRequest === true); },
                  detach : function(callbacks) { destroyHandle(handleId, callbacks); }
               };
            pluginHandles[handleId] = pluginHandle;
            callbacks.success(pluginHandle);
         };
         request["session_id"] = sessionId;
         ws.send(JSON.stringify(request));
         return;
      }
      Janus.httpAPICall(server + "/" + sessionId, {
         verb: 'POST',
         withCredentials: withCredentials,
         body: request,
         success: function(json) {
            Janus.debug(json);
            if(json["janus"] !== "success") {
               Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
               callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
               return;
            }
            var handleId = json.data["id"];
            Janus.log("Created handle: " + handleId);
            var pluginHandle =
               {
                  session : that,
                  plugin : plugin,
                  id : handleId,
                  token : handleToken,
                  detached : false,
                  webrtcStuff : {
                     started : false,
                     myStream : null,
                     streamExternal : false,
                     remoteStream : null,
                     mySdp : null,
                     mediaConstraints : null,
                     pc : null,
                     dataChannel : {},
                     dtmfSender : null,
                     trickle : true,
                     iceDone : false,
                     volume : {
                        value : null,
                        timer : null
                     },
                     bitrate : {
                        value : null,
                        bsnow : null,
                        bsbefore : null,
                        tsnow : null,
                        tsbefore : null,
                        timer : null
                     }
                  },
                  getId : function() { return handleId; },
                  getPlugin : function() { return plugin; },
                  getVolume : function() { return getVolume(handleId, true); },
                  getRemoteVolume : function() { return getVolume(handleId, true); },
                  getLocalVolume : function() { return getVolume(handleId, false); },
                  isAudioMuted : function() { return isMuted(handleId, false); },
                  muteAudio : function() { return mute(handleId, false, true); },
                  unmuteAudio : function() { return mute(handleId, false, false); },
                  isVideoMuted : function() { return isMuted(handleId, true); },
                  muteVideo : function() { return mute(handleId, true, true); },
                  unmuteVideo : function() { return mute(handleId, true, false); },
                  getBitrate : function() { return getBitrate(handleId); },
                  send : function(callbacks) { sendMessage(handleId, callbacks); },
                  data : function(callbacks) { sendData(handleId, callbacks); },
                  dtmf : function(callbacks) { sendDtmf(handleId, callbacks); },
                  consentDialog : callbacks.consentDialog,
                  iceState : callbacks.iceState,
                  mediaState : callbacks.mediaState,
                  webrtcState : callbacks.webrtcState,
                  slowLink : callbacks.slowLink,
                  onmessage : callbacks.onmessage,
                  createOffer : function(callbacks) { prepareWebrtc(handleId, true, callbacks); },
                  createAnswer : function(callbacks) { prepareWebrtc(handleId, false, callbacks); },
                  handleRemoteJsep : function(callbacks) { prepareWebrtcPeer(handleId, callbacks); },
                  onlocalstream : callbacks.onlocalstream,
                  onremotestream : callbacks.onremotestream,
                  ondata : callbacks.ondata,
                  ondataopen : callbacks.ondataopen,
                  oncleanup : callbacks.oncleanup,
                  ondetached : callbacks.ondetached,
                  hangup : function(sendRequest) { cleanupWebrtc(handleId, sendRequest === true); },
                  detach : function(callbacks) { destroyHandle(handleId, callbacks); }
               }
            pluginHandles[handleId] = pluginHandle;
            callbacks.success(pluginHandle);
         },
         error: function(textStatus, errorThrown) {
            Janus.error(textStatus + ":", errorThrown);   // FIXME
            if(errorThrown === "")
               callbacks.error(textStatus + ": Is the server down?");
            else
               callbacks.error(textStatus + ": " + errorThrown);
         }
      });
   }

   // Private method to send a message
   function sendMessage(handleId, callbacks) {
      callbacks = callbacks || {};
      callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
      callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
      if(!connected) {
         Janus.warn("Is the server down? (connected=false)");
         callbacks.error("Is the server down? (connected=false)");
         return;
      }
      var pluginHandle = pluginHandles[handleId];
      if(!pluginHandle || !pluginHandle.webrtcStuff) {
         Janus.warn("Invalid handle");
         callbacks.error("Invalid handle");
         return;
      }
      var message = callbacks.message;
      var jsep = callbacks.jsep;
      var transaction = Janus.randomString(12);
      var request = { "janus": "message", "body": message, "transaction": transaction };
      if(pluginHandle.token)
         request["token"] = pluginHandle.token;
      if(apisecret)
         request["apisecret"] = apisecret;
      if(jsep) {
         request.jsep = {
            type: jsep.type,
            sdp: jsep.sdp
         };
         if(jsep.e2ee)
            request.jsep.e2ee = true;
         if(jsep.rid_order === "hml" || jsep.rid_order === "lmh")
            request.jsep.rid_order = jsep.rid_order;
      }
      Janus.debug("Sending message to plugin (handle=" + handleId + "):");
      Janus.debug(request);
      if(websockets) {
         request["session_id"] = sessionId;
         request["handle_id"] = handleId;
         transactions[transaction] = function(json) {
            Janus.debug("Message sent!");
            Janus.debug(json);
            if(json["janus"] === "success") {
               // We got a success, must have been a synchronous transaction
               var plugindata = json["plugindata"];
               if(!plugindata) {
                  Janus.warn("Request succeeded, but missing plugindata...");
                  callbacks.success();
                  return;
               }
               Janus.log("Synchronous transaction successful (" + plugindata["plugin"] + ")");
               var data = plugindata["data"];
               Janus.debug(data);
               callbacks.success(data);
               return;
            } else if(json["janus"] !== "ack") {
               // Not a success and not an ack, must be an error
               if(json["error"]) {
                  Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
                  callbacks.error(json["error"].code + " " + json["error"].reason);
               } else {
                  Janus.error("Unknown error");   // FIXME
                  callbacks.error("Unknown error");
               }
               return;
            }
            // If we got here, the plugin decided to handle the request asynchronously
            callbacks.success();
         };
         ws.send(JSON.stringify(request));
         return;
      }
      Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
         verb: 'POST',
         withCredentials: withCredentials,
         body: request,
         success: function(json) {
            Janus.debug("Message sent!");
            Janus.debug(json);
            if(json["janus"] === "success") {
               // We got a success, must have been a synchronous transaction
               var plugindata = json["plugindata"];
               if(!plugindata) {
                  Janus.warn("Request succeeded, but missing plugindata...");
                  callbacks.success();
                  return;
               }
               Janus.log("Synchronous transaction successful (" + plugindata["plugin"] + ")");
               var data = plugindata["data"];
               Janus.debug(data);
               callbacks.success(data);
               return;
            } else if(json["janus"] !== "ack") {
               // Not a success and not an ack, must be an error
               if(json["error"]) {
                  Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
                  callbacks.error(json["error"].code + " " + json["error"].reason);
               } else {
                  Janus.error("Unknown error");   // FIXME
                  callbacks.error("Unknown error");
               }
               return;
            }
            // If we got here, the plugin decided to handle the request asynchronously
            callbacks.success();
         },
         error: function(textStatus, errorThrown) {
            Janus.error(textStatus + ":", errorThrown);   // FIXME
            callbacks.error(textStatus + ": " + errorThrown);
         }
      });
   }

   // Private method to send a trickle candidate
   function sendTrickleCandidate(handleId, candidate) {
      if(!connected) {
         Janus.warn("Is the server down? (connected=false)");
         return;
      }
      var pluginHandle = pluginHandles[handleId];
      if(!pluginHandle || !pluginHandle.webrtcStuff) {
         Janus.warn("Invalid handle");
         return;
      }
      var request = { "janus": "trickle", "candidate": candidate, "transaction": Janus.randomString(12) };
      if(pluginHandle.token)
         request["token"] = pluginHandle.token;
      if(apisecret)
         request["apisecret"] = apisecret;
      Janus.vdebug("Sending trickle candidate (handle=" + handleId + "):");
      Janus.vdebug(request);
      if(websockets) {
         request["session_id"] = sessionId;
         request["handle_id"] = handleId;
         ws.send(JSON.stringify(request));
         return;
      }
      Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
         verb: 'POST',
         withCredentials: withCredentials,
         body: request,
         success: function(json) {
            Janus.vdebug("Candidate sent!");
            Janus.vdebug(json);
            if(json["janus"] !== "ack") {
               Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
               return;
            }
         },
         error: function(textStatus, errorThrown) {
            Janus.error(textStatus + ":", errorThrown);   // FIXME
         }
      });
   }

   // Private method to create a data channel
   function createDataChannel(handleId, dclabel, dcprotocol, incoming, pendingData) {
      var pluginHandle = pluginHandles[handleId];
      if(!pluginHandle || !pluginHandle.webrtcStuff) {
         Janus.warn("Invalid handle");
         return;
      }
      var config = pluginHandle.webrtcStuff;
      if(!config.pc) {
         Janus.warn("Invalid PeerConnection");
         return;
      }
      var onDataChannelMessage = function(event) {
         Janus.log('Received message on data channel:', event);
         var label = event.target.label;
         pluginHandle.ondata(event.data, label);
      };
      var onDataChannelStateChange = function(event) {
         Janus.log('Received state change on data channel:', event);
         var label = event.target.label;
         var protocol = event.target.protocol;
         var dcState = config.dataChannel[label] ? config.dataChannel[label].readyState : "null";
         Janus.log('State change on <' + label + '> data channel: ' + dcState);
         if(dcState === 'open') {
            // Any pending messages to send?
            if(config.dataChannel[label].pending && config.dataChannel[label].pending.length > 0) {
               Janus.log("Sending pending messages on <" + label + ">:", config.dataChannel[label].pending.length);
               for(var data of config.dataChannel[label].pending) {
                  Janus.log("Sending data on data channel <" + label + ">");
                  Janus.debug(data);
                  config.dataChannel[label].send(data);
               }
               config.dataChannel[label].pending = [];
            }
            // Notify the open data channel
            pluginHandle.ondataopen(label, protocol);
         }
      };
      var onDataChannelError = function(error) {
         Janus.error('Got error on data channel:', error);
         // TODO
      };
      if(!incoming) {
         // FIXME Add options (ordered, maxRetransmits, etc.)
         var dcoptions = { ordered: true };
         if(dcprotocol)
            dcoptions.protocol = dcprotocol;
         config.dataChannel[dclabel] = config.pc.createDataChannel(dclabel, dcoptions);
      } else {
         // The channel was created by Janus
         config.dataChannel[dclabel] = incoming;
      }
      config.dataChannel[dclabel].onmessage = onDataChannelMessage;
      config.dataChannel[dclabel].onopen = onDataChannelStateChange;
      config.dataChannel[dclabel].onclose = onDataChannelStateChange;
      config.dataChannel[dclabel].onerror = onDataChannelError;
      config.dataChannel[dclabel].pending = [];
      if(pendingData)
         config.dataChannel[dclabel].pending.push(pendingData);
   }

   // Private method to send a data channel message
   function sendData(handleId, callbacks) {
      callbacks = callbacks || {};
      callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
      callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
      var pluginHandle = pluginHandles[handleId];
      if(!pluginHandle || !pluginHandle.webrtcStuff) {
         Janus.warn("Invalid handle");
         callbacks.error("Invalid handle");
         return;
      }
      var config = pluginHandle.webrtcStuff;
      var data = callbacks.text || callbacks.data;
      if(!data) {
         Janus.warn("Invalid data");
         callbacks.error("Invalid data");
         return;
      }
      var label = callbacks.label ? callbacks.label : Janus.dataChanDefaultLabel;
      if(!config.dataChannel[label]) {
         // Create new data channel and wait for it to open
         createDataChannel(handleId, label, callbacks.protocol, false, data, callbacks.protocol);
         callbacks.success();
         return;
      }
      if(config.dataChannel[label].readyState !== "open") {
         config.dataChannel[label].pending.push(data);
         callbacks.success();
         return;
      }
      Janus.log("Sending data on data channel <" + label + ">");
      Janus.debug(data);
      config.dataChannel[label].send(data);
      callbacks.success();
   }

   // Private method to send a DTMF tone
   function sendDtmf(handleId, callbacks) {
      callbacks = callbacks || {};
      callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
      callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
      var pluginHandle = pluginHandles[handleId];
      if(!pluginHandle || !pluginHandle.webrtcStuff) {
         Janus.warn("Invalid handle");
         callbacks.error("Invalid handle");
         return;
      }
      var config = pluginHandle.webrtcStuff;
      if(!config.dtmfSender) {
         // Create the DTMF sender the proper way, if possible
         if(config.pc) {
            var senders = config.pc.getSenders();
            var audioSender = senders.find(function(sender) {
               return sender.track && sender.track.kind === 'audio';
            });
            if(!audioSender) {
               Janus.warn("Invalid DTMF configuration (no audio track)");
               callbacks.error("Invalid DTMF configuration (no audio track)");
               return;
            }
            config.dtmfSender = audioSender.dtmf;
            if(config.dtmfSender) {
               Janus.log("Created DTMF Sender");
               config.dtmfSender.ontonechange = function(tone) { Janus.debug("Sent DTMF tone: " + tone.tone); };
            }
         }
         if(!config.dtmfSender) {
            Janus.warn("Invalid DTMF configuration");
            callbacks.error("Invalid DTMF configuration");
            return;
         }
      }
      var dtmf = callbacks.dtmf;
      if(!dtmf) {
         Janus.warn("Invalid DTMF parameters");
         callbacks.error("Invalid DTMF parameters");
         return;
      }
      var tones = dtmf.tones;
      if(!tones) {
         Janus.warn("Invalid DTMF string");
         callbacks.error("Invalid DTMF string");
         return;
      }
      var duration = (typeof dtmf.duration === 'number') ? dtmf.duration : 500; // We choose 500ms as the default duration for a tone
      var gap = (typeof dtmf.gap === 'number') ? dtmf.gap : 50; // We choose 50ms as the default gap between tones
      Janus.debug("Sending DTMF string " + tones + " (duration " + duration + "ms, gap " + gap + "ms)");
      config.dtmfSender.insertDTMF(tones, duration, gap);
      callbacks.success();
   }

   // Private method to destroy a plugin handle
   function destroyHandle(handleId, callbacks) {
      callbacks = callbacks || {};
      callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : Janus.noop;
      callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : Janus.noop;
      var noRequest = (callbacks.noRequest === true);
      Janus.log("Destroying handle " + handleId + " (only-locally=" + noRequest + ")");
      cleanupWebrtc(handleId);
      var pluginHandle = pluginHandles[handleId];
      if(!pluginHandle || pluginHandle.detached) {
         // Plugin was already detached by Janus, calling detach again will return a handle not found error, so just exit here
         delete pluginHandles[handleId];
         callbacks.success();
         return;
      }
      if(noRequest) {
         // We're only removing the handle locally
         delete pluginHandles[handleId];
         callbacks.success();
         return;
      }
      if(!connected) {
         Janus.warn("Is the server down? (connected=false)");
         callbacks.error("Is the server down? (connected=false)");
         return;
      }
      var request = { "janus": "detach", "transaction": Janus.randomString(12) };
      if(pluginHandle.token)
         request["token"] = pluginHandle.token;
      if(apisecret)
         request["apisecret"] = apisecret;
      if(websockets) {
         request["session_id"] = sessionId;
         request["handle_id"] = handleId;
         ws.send(JSON.stringify(request));
         delete pluginHandles[handleId];
         callbacks.success();
         return;
      }
      Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
         verb: 'POST',
         withCredentials: withCredentials,
         body: request,
         success: function(json) {
            Janus.log("Destroyed handle:");
            Janus.debug(json);
            if(json["janus"] !== "success") {
               Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason);   // FIXME
            }
            delete pluginHandles[handleId];
            callbacks.success();
         },
         error: function(textStatus, errorThrown) {
            Janus.error(textStatus + ":", errorThrown);   // FIXME
            // We cleanup anyway
            delete pluginHandles[handleId];
            callbacks.success();
         }
      });
   }

   // WebRTC stuff
   function streamsDone(handleId, jsep, media, callbacks, stream) {
      var pluginHandle = pluginHandles[handleId];
      if(!pluginHandle || !pluginHandle.webrtcStuff) {
         Janus.warn("Invalid handle");
         // Close all tracks if the given stream has been created internally
         if(!callbacks.stream) {
            Janus.stopAllTracks(stream);
         }
         callbacks.error("Invalid handle");
         return;
      }
      var config = pluginHandle.webrtcStuff;
      Janus.debug("streamsDone:", stream);
      if(stream) {
         Janus.debug("  -- Audio tracks:", stream.getAudioTracks());
         Janus.debug("  -- Video tracks:", stream.getVideoTracks());
      }
      // We're now capturing the new stream: check if we're updating or if it's a new thing
      var addTracks = false;
      if(!config.myStream || !media.update || config.streamExternal) {
         config.myStream = stream;
         addTracks = true;
      } else {
         // We only need to update the existing stream
         if(((!media.update && isAudioSendEnabled(media)) || (media.update && (media.addAudio || media.replaceAudio))) &&
               stream.getAudioTracks() && stream.getAudioTracks().length) {
            config.myStream.addTrack(stream.getAudioTracks()[0]);
            if(Janus.unifiedPlan) {
               // Use Transceivers
               Janus.log((media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
               var audioTransceiver = null;
               var transceivers = config.pc.getTransceivers();
               if(transceivers && transceivers.length > 0) {
                  for(var t of transceivers) {
                     if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
                           (t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
                        audioTransceiver = t;
                        break;
                     }
                  }
               }
               if(audioTransceiver && audioTransceiver.sender) {
                  audioTransceiver.sender.replaceTrack(stream.getAudioTracks()[0]);
               } else {
                  config.pc.addTrack(stream.getAudioTracks()[0], stream);
               }
            } else {
               Janus.log((media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
               config.pc.addTrack(stream.getAudioTracks()[0], stream);
            }
         }
         if(((!media.update && isVideoSendEnabled(media)) || (media.update && (media.addVideo || media.replaceVideo))) &&
               stream.getVideoTracks() && stream.getVideoTracks().length) {
            config.myStream.addTrack(stream.getVideoTracks()[0]);
            if(Janus.unifiedPlan) {
               // Use Transceivers
               Janus.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
               var videoTransceiver = null;
               var transceivers = config.pc.getTransceivers();
               if(transceivers && transceivers.length > 0) {
                  for(var t of transceivers) {
                     if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
                           (t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
                        videoTransceiver = t;
                        break;
                     }
                  }
               }
               if(videoTransceiver && videoTransceiver.sender) {
                  videoTransceiver.sender.replaceTrack(stream.getVideoTracks()[0]);
               } else {
                  config.pc.addTrack(stream.getVideoTracks()[0], stream);
               }
            } else {
               Janus.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTrac