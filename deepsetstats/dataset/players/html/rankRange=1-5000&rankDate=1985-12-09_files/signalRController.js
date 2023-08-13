define(["util/util", "jquery", "underscore", "jquery.migrate", "jquery.mobile.events", "signalr/liveHub"], function(Util, $, _) {
  var SignalRController;
  return SignalRController = (function() {
    var PrivateSignalRController, instance;

    function SignalRController() {}

    instance = null;

    SignalRController.getInstance = function() {
      return instance != null ? instance : instance = new PrivateSignalRController();
    };

    PrivateSignalRController = (function() {
      function PrivateSignalRController(options) {
        this.options = options;
        if (location.port === "4000") {
          return false;
        }
        this.options = $.extend({}, this.defaults, this.options);
        this.scoreEvents = [];
        this.challengerScoreEvents = [];
        this.newsEvents = [];
        this.hub = $.connection.atpLiveScoresHub;
        this.delegateEvents();
        $.connection.hub.start().done((function(_this) {
          return function() {
            return _this.options.isConnected = true;
          };
        })(this));
      }

      PrivateSignalRController.prototype.registerScoresEvent = function (tournamentLevel, callback) {
          if (callback && _.isFunction(callback)) {
              if (tournamentLevel.toLowerCase() === "tour") {
                  return this.scoreEvents.push(callback);
              }
              if (tournamentLevel.toLowerCase() === "challenger") {
                  return this.challengerScoreEvents.push(callback);
              }
          }
      };

      PrivateSignalRController.prototype.getOnlyChallengerScores = function () {
          $.connection.hub.start().done(function () {
              // try to DISconnect from the other Group
              /*$.connection.atpLiveScoresHub.server.leaveScoresChannel("Tour").done(function () {
                  console.log('Invocation of LeaveScoresChannel(Tour) succeeded');
              }).fail(function (error) {
                  console.log('Invocation of LeaveScoresChannel(Tour) failed. Error: ' + error);
              });*/

              // try to connect to the proper Group
              $.connection.atpLiveScoresHub.server.joinScoresChannel("Challenger").done(function () {
                  void 0;
              }).fail(function (error) {
                  void 0;
              });
          });
      };

      PrivateSignalRController.prototype.getOnlyTourScores = function () {
          $.connection.hub.start().done(function () {
              // try to DISconnect from the other Group
              /*$.connection.atpLiveScoresHub.server.leaveScoresChannel("Challenger").done(function () {
                  console.log('Invocation of LeaveScoresChannel(Challenger) succeeded');
              }).fail(function (error) {
                  console.log('Invocation of LeaveScoresChannel(Challenger) failed. Error: ' + error);
              });*/

              // try to connect to the proper Group
              $.connection.atpLiveScoresHub.server.joinScoresChannel("Tour").done(function () {
                  void 0;
              }).fail(function (error) {
                  void 0;
              });
          });
      };

      PrivateSignalRController.prototype.delegateEvents = function() {
        var _self;
        _self = this;
        setInterval;
        $.connection.hub.disconnected(function() {
          _self.options.isConnected = false;
          setTimeout(function() {
            return $.connection.hub.start().done(function() {
              _self.options.isConnected = true;
            }, 5000);
          });
        });
        this.hub.client.pushNewScores = function(data) {
          var event, i, len, ref, results;
          ref = _self.scoreEvents;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            event = ref[i];
            results.push(event(data));
          }
          return results;
        };
        this.hub.client.pushNewChallengerScores = function (data) {
            var event, i, len, ref, results;
            ref = _self.challengerScoreEvents;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
                event = ref[i];
                results.push(event(data));
            }
            return results;
        };
      };

      return PrivateSignalRController;

    })();

    return SignalRController;

  })();
});
