var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(["jquery", "util/util", "jquery.mobile.events", "jquery.cookie"], function($, Util) {
  var Modal;
  return Modal = (function() {
    function Modal(options) {
      this.options = options;
      this.openModal = bind(this.openModal, this);
      this.openModalOld = bind(this.openModalOld, this);
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
      this.delegateEvents();
    }

    Modal.prototype.defaults = {
      element: "#modal",
      modalCloseFlag: "modal-close",
      openButtonAttr: "data-modal-open",
      closeButtonAttr: "href",
      modalTransitionAttr: "data-modal-transition",
      scrollTopDelay: 0,
      modalOnFlag: "modal-on",
      modalOnTransitionFlag: "modal-on-transition",
      modalOnIntroFlag: "modal-on-transition-intro",
      transitionDelay: 300,
      drawUrl:""
    };

    Modal.prototype.pageUrl = "";

    Modal.prototype.additionalSelectors = function() {
      this.options.$element = $(this.options.element);
      this.options.openButton = "[" + this.options.openButtonAttr + "]";
      return this.options.modalTransition = "[" + this.options.modalTransitionAttr + "]";
    };

    Modal.prototype.delegateEvents = function() {
      $("body").on("click", this.options.openButton, (function(_this) {
        return function(event) {
          var _url;
          _url = $(event.target).attr(_this.options.openButtonAttr);
          return _this.openModal(_url);
        };
      })(this));
      $("body").on("click", this.options.modalTransition, (function(_this) {
        return function(event) {
          var _url;
          _url = $(event.target).attr(_this.options.modalTransitionAttr);
          return _this.modalTransition({
            url: _url
          });
        };
      })(this));
      return $("body").on("click", this.options.element, (function(_this) {
        return function(event) {
          var _url;
          if ($(event.target).hasClass(_this.options.modalCloseFlag)) {
            event.preventDefault();
            _url = $(event.target).attr(_this.options.closeButtonAttr);
            return _this.closeModal(_url);
          }
        };
      })(this));
    };

    Modal.prototype.scrollOffset = 0;

    Modal.prototype.scrollBackOffset = function() {
      return setTimeout((function(_this) {
        return function() {
          $(window).scrollTop(_this.scrollOffset);
          return $("#mainLayoutWrapper").attr("style", "");
        };
      })(this), this.options.scrollTopDelay);
    };

    Modal.prototype.openModalOld = function(url) {
      var _url, modalUrl;
      Util.updateUrl(url);
      _url = $.trim(url);
      _url = modalUrl = Util.updateQueryStringParameter(_url, "ajax", "true");
      if (_url.length) {
        if (!$("html").hasClass(this.options.modalOnFlag)) {
          this.pageUrl = window.location.href;
          this.scrollOffset = $(window).scrollTop();
        }
        this.additionalSelectors();
       
		$(this.options.$element).show();
		
        return this.additionalSelectors();
      }
    };

    Modal.prototype.openModal = function(response) {
      this.transitionStart();
      this.scrollOffset = $(window).scrollTop();
      return Util.ajaxModalSuccess({
        $element: this.options.$element,
        callBack: (function(_this) {
          return function(response) {
            return _this.transitionEnd();
          };
        })(this)
      }, response);
    };

    Modal.prototype.closeModalClickEvent = function() {
      var pageUrl;
      pageUrl = $.cookie('atpUrl');
      if (pageUrl === void 0) {
        Util.navigateTo(window.location.hostname, true);
      } else if ($('#mainContent *.not[script]').length) {
        Util.navigateTo(pageUrl, true);
      } else {
        Util.updateUrl(pageUrl);
      }
      return this.options.$element.remove();
    };

    Modal.prototype.closeModal = function(url, scrollToTop) {

      this.additionalSelectors();
      $("html").removeClass(this.options.modalOnFlag);
      Util.updateUrl(this.options.drawUrl);
		  window.location = this.options.drawUrl; 
      this.scrollBackOffset();
      return $("html").removeClass(this.options.modalOnIntroFlag);    
    }

    Modal.prototype.transitionStart = function() {
      $("html").addClass(this.options.modalOnTransitionFlag);
      if ($("html").hasClass(this.options.modalOnFlag)) {
        return $("html").addClass(this.options.modalOnTransitionFlag);
      }
    };

    Modal.prototype.transitionEnd = function() {
      if (!$("html").hasClass(this.options.modalOnFlag)) {
        setTimeout((function(_this) {
          return function() {
            $("html").addClass(_this.options.modalOnFlag);
            return $("#mainLayoutWrapper").attr("style", "margin-top: -" + _this.scrollOffset + "px;");
          };
        })(this), 50);
        setTimeout((function(_this) {
          return function() {
            return $("html").addClass(_this.options.modalOnIntroFlag);
          };
        })(this), this.options.transitionDelay * 2);
      }
      return setTimeout((function(_this) {
        return function() {
          $("html").removeClass(_this.options.modalOnTransitionFlag);
          return $("#mainLayoutWrapper").attr("style", "margin-top: -" + _this.scrollOffset + "px;");
        };
      })(this), this.options.transitionDelay);
    };

    Modal.prototype.modalTransition = function(data) {
      var $modal;
      $modal = $(this.options.$element.selector);
      $modal.empty();
      return $modal.html($(data).children());
    };

    return Modal;

  })();
});
