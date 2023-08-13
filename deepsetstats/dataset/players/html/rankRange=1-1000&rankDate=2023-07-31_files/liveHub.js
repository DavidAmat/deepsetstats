define(["jquery", "signalr.min"], function($) {
  return (function($, window, undefined_) {
    "use strict";
    var makeProxyCallback, registerHubProxies, signalR, signalRUrl;
    if (typeof $.signalR !== "function") {
      throw new Error("SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/js.");
    }
    signalR = $.signalR;
    makeProxyCallback = function(hub, callback) {
      return function() {
        callback.apply(hub, $.makeArray(arguments));
      };
    };
    registerHubProxies = function(instance, shouldSubscribe) {
      var hub, key, memberKey, memberValue, subscriptionMethod;
      key = void 0;
      hub = void 0;
      memberKey = void 0;
      memberValue = void 0;
      subscriptionMethod = void 0;
      for (key in instance) {
        if (instance.hasOwnProperty(key)) {
          hub = instance[key];
          if (!hub.hubName) {
            continue;
          }
          if (shouldSubscribe) {
            subscriptionMethod = hub.on;
          } else {
            subscriptionMethod = hub.off;
          }
          for (memberKey in hub.client) {
            if (hub.client.hasOwnProperty(memberKey)) {
              memberValue = hub.client[memberKey];
              if (!$.isFunction(memberValue)) {
                continue;
              }
              subscriptionMethod.call(hub, memberKey, makeProxyCallback(hub, memberValue));
            }
          }
        }
      }
    };
    $.hubConnection.prototype.createHubProxies = function() {
      var proxies;
      proxies = {};
      this.starting(function() {
        registerHubProxies(proxies, true);
        this._registerSubscribedHubs();
      }).disconnected(function() {
        registerHubProxies(proxies, false);
      });
      proxies["atpLiveScoresHub"] = this.createHubProxy("atpLiveScoresHub");
      proxies["atpLiveScoresHub"].client = {};
      proxies['atpLiveScoresHub'].server = {
          joinScoresChannel: function (liveScoresChannel) {
              return proxies['atpLiveScoresHub'].invoke.apply(proxies['atpLiveScoresHub'], $.merge(["JoinScoresChannel"], $.makeArray(arguments)));
          },

          leaveScoresChannel: function (liveScoresChannel) {
              return proxies['atpLiveScoresHub'].invoke.apply(proxies['atpLiveScoresHub'], $.merge(["LeaveScoresChannel"], $.makeArray(arguments)));
          }
      };
      return proxies;
    };
    signalRUrl = $('body').data().signalrUrl;
    signalR.hub = $.hubConnection(signalRUrl, {
      useDefaultPath: false
    });
    return $.extend(signalR, signalR.hub.createHubProxies());
  })(window.jQuery, window);
});
