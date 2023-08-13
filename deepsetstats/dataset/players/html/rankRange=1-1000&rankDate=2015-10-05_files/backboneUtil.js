
/*
 *	A utiliy file for backbone compatability functions
 */
define(["jquery", "backbone", "underscore", "util/init"], function($, Backbone, _) {
  var BackboneUtil;
  return BackboneUtil = (function() {
    var PrivateClass, instance;

    function BackboneUtil() {}

    instance = null;

    BackboneUtil.get = function(options) {
      this.options = options;
      return instance != null ? instance : instance = new PrivateClass(this.options);
    };

    PrivateClass = (function() {
      function PrivateClass(options) {
        this.options = options;
        this.options = $.extend(true, {}, this.defaults, this.options);
      }

      PrivateClass.prototype.isAttribute = function(attr) {
        if (attr !== typeof void 0 && attr !== false) {
          return true;
        }
        return false;
      };

      PrivateClass.prototype.shouldBypassLink = function($link, linkData) {
        if (app.BackboneEnabled === false) {
          return false;
        }
        if (linkData.bypass) {
          return false;
        }
        if (this.isAttribute($this.attr('download'))) {
          return false;
        }
      };

      PrivateClass.prototype.initializeEvents = function($rootEl) {
        var _self, notList, notListSelector;
        _self = this;

        /*
        				 * This sets up all the pages links to run through backbone
         */
        notList = ["[data-bypass]", "[download]", "[href*='.pdf']", "[href*='.doc']", "[target='_blank']", ".nav-push"];
        notListSelector = notList.join(',');
        $rootEl.off("click", "a[data-use-ga]");
        $rootEl.on("click", "a[data-use-ga]", function(evt) {
          var $this, gaAction, gaCategory, gaLabel, hrefValue, linkData;
          $this = $(this);
          hrefValue = $this.attr("href");
          linkData = $this.data;
          gaCategory = $this.data("ga-category");
          gaAction = $this.data("ga-action");
          gaLabel = $this.data("ga-label");
          if (hrefValue === "" || hrefValue === "#") {
            app.Analytics.trackEvent(gaCategory, gaAction, gaLabel);
          }
          return true;
        });
        $rootEl.off("click", "a[target=\"_blank\"]");
        $rootEl.on("click", "a[target=\"_blank\"]", function(evt) {
          var $this, gaAction, gaCategory, gaLabel, linkData, useGa;
          $this = $(this);
          linkData = $this.data;
          useGa = $this.attr("data-use-ga");
          if (useGa !== "true") {
            gaCategory = $this.data("ga-category");
            gaAction = $this.data("ga-action");
            gaLabel = $this.data("ga-label");
            app.Analytics.trackEvent(gaCategory, gaAction, gaLabel);
          }
          return true;
        });
        $rootEl.off("click", "a[href*='.pdf']");
        $rootEl.on("click", "a[href*='.pdf']", function(evt) {
          var $this, downloadTitle, gaLabel, pdfUrl;
          $this = $(this);
          downloadTitle = $this.prop("download");
          pdfUrl = $this.prop("href");
          if (typeof attr !== typeof void 0 && attr !== false) {
            gaLabel = downloadTitle;
          } else {
            gaLabel = pdfUrl;
          }
          app.Analytics.trackPageView(gaLabel);
          return true;
        });
        if (app.BackboneEnabled) {
          $rootEl.off("click", "a[href]:not(" + notListSelector + ")", function(evt) {});
          return $rootEl.on("click", "a[href]:not(" + notListSelector + ")", function(evt) {
            var $this, _enterBackboneFunk, anchorLink, href, match, root;
            $this = $(this);
            _enterBackboneFunk = true;
            if ($this.hasClass("nav-push")) {
              if (!$this.hasClass("expand")) {
                _enterBackboneFunk = false;
              }
            }
            if (_enterBackboneFunk) {
              window.app.FilteredModules = false;
              href = {
                prop: $this.prop("href"),
                attr: $this.attr("href"),
                filteredModules: $this.attr("data-filter-modules"),
                overrideTransition: $this.attr("data-override-transition")
              };
              if (href.filteredModules !== void 0) {
                window.app.FilteredModules = true;
              }
              if (href.overrideTransition !== void 0) {
                window.app.OverrideTransition = true;
              }
              match = href.prop.indexOf("#") === -1;
              anchorLink = href.prop.indexOf("#") < href.prop.length - 1 && href.attr.indexOf("#") !== 0;
              root = location.protocol + "//" + location.host;
              if (href.attr.slice(0, root.length) === root) {
                href.attr = href.attr.slice(root.length);
              }
              if (href.prop.slice(0, root.length) === root && match) {
                evt.preventDefault();
                Backbone.history.navigate(href.attr, true);
              } else if (href.prop.slice(0, root.length) === root && !match && anchorLink) {
                evt.preventDefault();
                Backbone.history.navigate(href.attr, true);
              }
            }
          });
        }
      };

      PrivateClass.prototype.defaults = {
        $el: $(document),
        analytics: {
          gaClickAction: "Click",
          gaPDFAction: "PDF",
          gaOutboundCategory: "Outbound",
          gaDownloadCategory: "Download"
        }
      };

      return PrivateClass;

    })();

    return BackboneUtil;

  })();
});
