define(["jquery", "util/util", "util/lazyLoader", "modules/modal/modal", "jquery.migrate", "jquery.mobile.events", "breakpoints"], function($, Util, LazyLoader, Modal) {
  var Global;
  return Global = (function() {
    function Global(options) {
      this.options = options;
      this.options = $.extend({}, this.defaults, this.options);

      new LazyLoader();
      new Modal();
      this.removeNoJs();
      this.detectMouseTouch();
      this.setIosFlag();
      Util.setModalContainer();
      Util.checkPageHeader($(".page-header-holder"));
      this.adjustWrapper();
      Util.setSponsoredBackground();
    }

    Global.prototype.defaults = {};

    Global.prototype.adjustWrapper = function () {
        // Select the node that will be observed for mutations
        var targetNode = document.querySelector('#header');
        void 0;
        var wrapper = document.querySelector('.is-desktop');
        

        // Options for the observer (which mutations to observe)
        var config = { attributes: true, childList: true };
        // Callback function to execute when mutations are observed
        var callback = function (mutationsList) {
            for (var mutation of mutationsList) {
                if (mutation.type == 'childList') {
                    void 0;
                }
                else if (mutation.type == 'attributes') {
                    void 0;
                    void 0;
                }
            }
        };
        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback);
        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }

    Global.prototype.setIosFlag = function() {
      if (/iPad|iPod|iPhone/i.test(navigator.userAgent)) {
        return $("html").addClass("is-iOS");
      }
    };

    Global.prototype.removeNoJs = function() {
      return $("html.no-js").removeClass("no-js");
    };

    Global.prototype.introAnimation = function() {
      return $(".atp-loader-skrim, .atp-loader").remove();
    };

    Global.prototype.detectMouseTouch = function() {
      var $html, _mouseMove;
      $html = $("html");
      _mouseMove = 1;
      $html.addClass("device-using-touch");
      if (/iPad/i.test(navigator.userAgent)) {
        return false;
      }
      setInterval(function() {
        return _mouseMove = 0;
      }, 500);
      $html.on("touchstart touchmove touchend", function(event) {
        _mouseMove = 0;
        $html.addClass("device-using-touch");
        return $html.removeClass("device-using-mouse");
      });
      return $html.on("mousemove", function(event) {
        _mouseMove++;
        if (_mouseMove > 10) {
          $html.removeClass("device-using-touch");
          return $html.addClass("device-using-mouse");
        }
      });
    };

    return Global;

  })();
});
