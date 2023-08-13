define(["jquery"], function($) {
  var GoogleAnalytics;
  return GoogleAnalytics = (function() {
    function GoogleAnalytics(options) {
      this.options = options;
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
    }

    GoogleAnalytics.prototype.trackPageView = function(page, title) {
    };

    GoogleAnalytics.prototype.trackEvent = function(category, action, label) {
    };

    GoogleAnalytics.prototype.trackSocialEvent = function(network, action, target) {
    };

    GoogleAnalytics.prototype.heartbeat = function() {
    };

    GoogleAnalytics.prototype.additionalSelectors = function() {
    };

    return GoogleAnalytics;

  })();
});
