define(["jquery", "jquery.mobile.events"], function($) {
  var ContentAccordion;
  return ContentAccordion = (function() {
    function ContentAccordion(options) {
      this.options = options;
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
      this.delegateEvents();
      this.loadInitalEvents();
    }

    ContentAccordion.prototype.defaults = {
      body: "body",
      element: "#contentAccordionWrapper",
      toggle: "#toggleAll",
      openText: "open all",
      closeText: "close all",
      labelClass: ".accordion-label",
      panelClass: ".centered-content-wrapper",
      gaCategory: "accordion",
      gaAction: "click"
    };

    ContentAccordion.prototype.additionalSelectors = function() {
      this.options.$body = $(this.options.body);
      this.options.$element = $(this.options.element);
      this.options.$toggle = $(this.options.toggle);
      this.options.$labels = this.options.$element.find(this.options.labelClass);
      return this.options.$panels = this.options.$element.find(this.options.panelClass);
    };

    ContentAccordion.prototype.loadInitalEvents = function() {
      this.loadToggleState(this.options.$toggle);
      return this.renderAccordionContent();
    };

    ContentAccordion.prototype.delegateEvents = function() {
      var _self;
      _self = this;
      this.options.$element.on("click", this.options.labelClass, function() {
        var $panel, $this;
        $this = $(this);
        $panel = $this.siblings(_self.options.panelClass);
        $this.parent().toggleClass("expand");
        return _self.toggleAccordion($panel, true);
      });
      this.options.$toggle.on("click", function(event) {
        var $this;
        event.preventDefault();
        $this = $(this);
        return _self.reloadToggleState($this, true);
      });
      return $(window).on("resize", function() {
        return _self.options.$panels.each(function() {
          var $this;
          $this = $(this);
          _self.setMaxHeightAttr($this);
          return _self.toggleAccordion($this);
        });
      });
    };

    ContentAccordion.prototype.renderAccordionContent = function() {
      var _self;
      _self = this;
      return this.options.$labels.each(function() {
        var $panel, $this;
        $this = $(this);
        $panel = $this.siblings(_self.options.panelClass);
        return _self.renderAjaxContent($this);
      });
    };

    ContentAccordion.prototype.updateContent = function($panel) {
      $panel.wrapInner("<div class='accordion-panel-wrapper'></div>");
      this.setMaxHeightAttr($panel);
      return this.toggleAccordion($panel);
    };

    ContentAccordion.prototype.setMaxHeightAttr = function($panel) {
      return setTimeout((function(_this) {
        return function() {
          var $panelInnerWrapper, _panelHeight;
          $panelInnerWrapper = $panel.find(".accordion-panel-wrapper");
          _panelHeight = $panelInnerWrapper.outerHeight();
          if (_this.options.$body.hasClass("is-mobile")) {
            _panelHeight += 30;
          }
          return $panel.attr("data-max-height", _panelHeight);
        };
      })(this), 250);
    };

    ContentAccordion.prototype.toggleAccordion = function($panel, trackAnalytics) {
      var _self, gaLabel;
      _self = this;
      gaLabel = $panel.find(".accordion-label").html();
      if ($panel.parent().hasClass("expand")) {
        _self.resizeAccordion($panel);
        gaLabel += ' Open';
      } else {
        $panel.attr("style", "max-height: 0px;");
        gaLabel += ' Close';
      }
      if (trackAnalytics) {
        return window.app.Analytics.trackEvent(this.options.gaCategory, this.options.gaAction, gaLabel);
      }
    };

    ContentAccordion.prototype.loadToggleState = function($this) {
      var _toggleValue;
      _toggleValue = $this.attr("data-toggle");
      $this.attr("data-toggle", _toggleValue);
      return $this.html("" + _toggleValue);
    };

    ContentAccordion.prototype.reloadToggleState = function($this, trackAnalytics) {
      var _self, _toggleValue;
      _self = this;
      _toggleValue = $this.attr("data-toggle");
      if (_toggleValue === this.options.openText) {
        _toggleValue = this.options.closeText;
        this.options.$panels.parent().addClass("expand");
      } else {
        _toggleValue = this.options.openText;
        this.options.$panels.parent().removeClass("expand");
      }
      if (trackAnalytics) {
        window.app.Analytics.trackEvent(this.options.gaCategory, this.options.gaAction, _toggleValue);
      }
      this.options.$panels.each(function() {
        var $panel;
        $panel = $(this);
        return _self.toggleAccordion($panel, trackAnalytics);
      });
      $this.attr("data-toggle", _toggleValue);
      return $this.html("" + _toggleValue);
    };

    ContentAccordion.prototype.renderAjaxContent = function($this) {
      var $panel, ajaxUrl, that;
      that = this;
      ajaxUrl = $this.data('ajax-url');
      if (ajaxUrl !== void 0 && $this.siblings(this.options.panelClass).html() === "") {
        return $.ajax({
          type: "GET",
          dataType: "html",
          url: ajaxUrl,
          success: (function(_this) {
            return function(response) {
              var $panel;
              $panel = $this.siblings(_this.options.panelClass);
              $panel.html(response);
              return that.updateContent($panel);
            };
          })(this)
        });
      } else {
        $panel = $this.siblings(this.options.panelClass);
        return that.updateContent($panel);
      }
    };

    ContentAccordion.prototype.resizeAccordion = function($this) {
      var _panelHeight;
      _panelHeight = $this.attr("data-max-height");
      return $this.attr("style", "max-height: " + _panelHeight + "px;");
    };

    return ContentAccordion;

  })();
});
