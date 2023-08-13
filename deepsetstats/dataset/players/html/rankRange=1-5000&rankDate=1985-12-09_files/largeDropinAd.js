define(["jquery", "jquery.mobile.events"], function($) {
  var LargeDropinAd;
  return LargeDropinAd = (function() {
    function LargeDropinAd(options) {
      this.options = options;
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
      this.delegateEvents();
      this.openAd();
    }

    LargeDropinAd.prototype.defaults = {
      window: window,
      largeDropinAd: "#largeDropin",
      dropinClose: "#closeAd",
      openAdTimeout: 500,
      closeAdTimeout: 0
    };

    LargeDropinAd.prototype.additionalSelectors = function() {
      this.options.$window = $(this.options.window);
      this.options.$largeDropinAd = $(this.options.largeDropinAd);
      return this.options.$dropinClose = $(this.options.dropinClose);
    };

    LargeDropinAd.prototype.delegateEvents = function() {
      return this.options.$dropinClose.on('click', (function(_this) {
        return function() {
          return _this.closeAd();
        };
      })(this));
    };

    LargeDropinAd.prototype.openAd = function() {
      return this.options.$largeDropinAd.addClass("expand");
    };

    LargeDropinAd.prototype.closeAd = function() {
      return this.options.$largeDropinAd.removeClass("expand");
    };

    return LargeDropinAd;

  })();
});
