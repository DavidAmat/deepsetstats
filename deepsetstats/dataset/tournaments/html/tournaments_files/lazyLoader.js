define(["jquery", "isInViewport"], function($) {
  var LazyLoader;
  return LazyLoader = (function() {
    function LazyLoader(options) {
      this.options = options;
      this.options = $.extend({}, this.defaults, this.options);
      this.delegateEvents();
      this.triggerScroll();
    }

    LazyLoader.prototype.defaults = {
      isScrolling: [],
      scrollIntervalDelay: 500
    };

    LazyLoader.prototype.startScrollTimer = function() {
      this.scrollTimer = 0;
      return setInterval((function(_this) {
        return function() {
          return _this.scrollTimer += 50;
        };
      })(this), 50);
    };

    LazyLoader.prototype.startScrollTimerDos = function() {
      this.scrollTimerDos = 0;
      return setInterval((function(_this) {
        return function() {
          return _this.scrollTimerDos += 50;
        };
      })(this), 50);
    };

    LazyLoader.prototype.delegateEvents = function() {
      var _self;
      _self = this;
      this.startScrollTimer();
      this.startScrollTimerDos();
      this.loadInView({
        $scrollEvent: $(window),
        viewportName: "window",
        mainSelector: ".lazy-loader"
      });
      this.loadInView({
        scrollEvent: ".lazy-scrollable",
        viewportName: ".lazy-scrollable",
        mainSelector: ".lazy-scrollable .lazy-scroll",
        ajax: true
      });
      this.displayInView({
        $scrollEvent: $(window),
        viewportName: "window",
        mainSelector: ".invisibility",
        otherSelector: ".hide-me"
      });
      return $(document).ajaxComplete((function(_this) {
        return function() {
          _this.triggerScroll();
          return setTimeout(function() {
            return _this.triggerScroll();
          }, 1000);
        };
      })(this));
    };

    LazyLoader.prototype.displayInView = function(selectors) {
      var _self;
      _self = this;
      setTimeout((function(_this) {
        return function() {
          return _this.displayInViewCallback(selectors);
        };
      })(this), this.options.scrollIntervalDelay);
      return selectors.$scrollEvent.on('scroll', (function(_this) {
        return function() {
          if (_this.scrollTimerDos > _this.options.scrollIntervalDelay) {
            _this.scrollTimerDos = 0;
            return _this.displayInViewCallback(selectors);
          }
        };
      })(this));
    };

    LazyLoader.prototype.loadInView = function(selectors) {
      var _self;
      _self = this;
      setTimeout((function(_this) {
        return function() {
          return _this.loadInViewCallback(selectors);
        };
      })(this), this.options.scrollIntervalDelay);
      if (selectors.ajax) {
        return $(document).on('scroll', selectors.scrollEvent, (function(_this) {
          return function() {
            if (_this.scrollTimer > _this.options.scrollIntervalDelay) {
              _this.scrollTimer = 0;
              return _this.loadInViewCallback(selectors);
            }
          };
        })(this));
      } else {
        return selectors.$scrollEvent.on('scroll', (function(_this) {
          return function() {
            if (_this.scrollTimer > _this.options.scrollIntervalDelay) {
              $(".lazy-scrollable").scroll();
              _this.scrollTimer = 0;
              return _this.loadInViewCallback(selectors);
            }
          };
        })(this));
      }
    };

    LazyLoader.prototype.loadInViewCallback = function(selectors) {
      var $destroyNotInView, $inView, $notInView, _self;
      _self = this;
      $inView = $(selectors.mainSelector + ":in-viewport");
      $notInView = $("" + selectors.mainSelector).not($inView);
      $destroyNotInView = $notInView.not("* .spinner").not('[data-type="background"].already-loaded').not('[data-type="image"].already-loaded');
      $destroyNotInView.empty();
      $destroyNotInView.removeClass("already-loaded");
      $inView.not(".already-loaded").each(function() {
        return _self.createItem($(this));
      });
      this.createLoader($("" + selectors.mainSelector));
      return this.triggerScroll();
    };

    LazyLoader.prototype.displayInViewCallback = function(selectors) {
      var $inView, $notInView, _self;
      _self = this;
      $inView = $(selectors.mainSelector + ":in-viewport");
      $notInView = $("" + selectors.otherSelector).not($inView);
      $inView.each(function() {
        return $(this).addClass('hide-me');
      });
      $notInView.each(function() {
        return $(this).removeClass('hide-me');
      });
      return this.triggerScroll();
    };

    LazyLoader.prototype.triggerScroll = function(timeOut) {
      if (timeOut == null) {
        timeOut = 500;
      }
      return setTimeout((function(_this) {
        return function() {
          $(window).trigger("scroll");
          return $(".lazy-scrollable").trigger("scroll");
        };
      })(this), timeOut);
    };

    LazyLoader.prototype.loaderTemplate = function() {
      return "<div class=\"spinner\">\n  <div class=\"bounce1\"></div>\n  <div class=\"bounce2\"></div>\n  <div class=\"bounce3\"></div>\n</div>";
    };

    LazyLoader.prototype.videoTemplate = function(data) {
      return "<video class=\"lazy-video\" autoplay looped muted>\n	<source src=\"" + data.webm + "\" type=\"video/webm\">\n	<source src=\"" + data.mp4 + "\" type=\"video/mp4\">\n</video>";
    };

    LazyLoader.prototype.backgroundTemplate = function(data) {
      return "<div class=\"lazy-background\" style=\"background-image:url('" + data.src + "')\"></div>";
    };

    LazyLoader.prototype.imageTemplate = function(data) {
      if (!data.src.length) {
        return;
      }
      return "<div class=\"lazy-image\">\n	<img src=\"" + data.src + "\" />\n</div>";
    };

    LazyLoader.prototype.createItem = function($this) {
      var _data, _html;
      _data = $this.data();
      switch (_data.type) {
        case "video":
          _html = this.videoTemplate(_data);
          break;
        case "background":
          _html = this.backgroundTemplate(_data);
          break;
        case "image":
          _html = this.imageTemplate(_data);
          break;
        default:
          return false;
      }
      $this.html(_html);
      return $this.addClass("already-loaded");
    };

    LazyLoader.prototype.createLoader = function($selector) {
      var _self;
      _self = this;
      return $selector.not("* .spinner, .already-loaded").each(function() {
        var $this;
        $this = $(this);
        return $this.append(_self.loaderTemplate());
      });
    };

    return LazyLoader;

  })();
});
