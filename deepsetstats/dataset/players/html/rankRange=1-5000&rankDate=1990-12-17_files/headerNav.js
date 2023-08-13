define(["jquery", "underscore", "jquery.mobile.events", "jquery.cookie"], function($, _) {
  var HeaderNav;
  return HeaderNav = (function() {
    var HeaderNavPrivate, instance;

    function HeaderNav() {}

    instance = null;

    HeaderNav.get = function(options) {
      this.options = options;
      return instance != null ? instance : instance = new HeaderNavPrivate(this.options);
    };

    HeaderNavPrivate = (function() {
      function HeaderNavPrivate(options) {
        this.options = options;
        this.options = $.extend({}, this.defaults, this.options);
        this.additionalSelectors();
        this.insertMenuTemplate();
        this.additionalSelectors();
        this.testCookiesCookie();
        this.delegateEvents();
        this.addClassOnOccasion();
      }

      HeaderNavPrivate.prototype.defaults = {
        _navExpanded: false,
        tabletMenuTemplate: "#tabletMenuTemplate",
        menuToggle: "#controlMenu",
        menuClose: "#closeNav",
        mainNav: "#mainNav",
        navigation: "#navigation",
        mainHeader: "#mainHeader",
        headerCallouts: "#headerCallouts",
        subNavLink: "#mainNav .nav-push",
        subNav: "#subNav",
        body: "body",
        html: "html",
        document: document,
        subNavTemplate: "#subNavTemplate",
        cookieClose: "#cookieClose",
        subNavList: ".sub-nav-list"
      };

      HeaderNavPrivate.prototype.delegateEvents = function() {
        var _self;
        _self = this;
        this.options.$menuToggle.on("click", (function(_this) {
          return function(event) {
            _this.additionalSelectors();
            event.stopPropagation();
            $(".modal-carousel-social-close").trigger("click");
            if (_this.options.$mainNav.hasClass("expand")) {
              _this.closeSubNav();
              return _this.options.$headerCallouts.show();
            } else {
              _this.options.$headerCallouts.hide();
              _this.options._navExpanded = true;
              _this.options.$mainNav.addClass("expand");
              _this.options.$menuToggle.addClass("expand");
              _this.options.$mainHeader.addClass("expand");
              _this.options.$navigation.addClass("expand");
              return _this.options.$html.addClass("full-nav");
            }
          };
        })(this));
        this.options.$menuClose.on("click", (function(_this) {
          return function() {
            return _this.closeSubNav();
          };
        })(this));
        this.options.$subNavLink.on("click", function(event) {
          var $this;
          $this = $(this);
            event.preventDefault();
            return _self.subNavLinkAction($this);
        });
        this.options.$document.on("click", function(event) {
          if (_self.options._navExpanded && $(event.target).is(":not(#navigation *)")) {
            _self.options.$menuClose.trigger("click");
            _self.options._navExpanded = false;
          }
          return true;
        });
        return this.options.$cookieClose.on("click", function(event) {
          event.preventDefault();
          return _self.setCookie();
        });
      };

        HeaderNavPrivate.prototype.testCookiesCookie = function () {
            if (!$.cookie("cookieMessage") && $(".cookie-message").length) {
                this.options.$html.addClass("cookies-flag");
            }
        };

      HeaderNavPrivate.prototype.setCookie = function() {
        $.cookie('cookieMessage', true, {
          expires: 365,
          path: '/'
        });
        this.options.$html.removeClass("cookies-flag");
      };

      HeaderNavPrivate.prototype.closeSubNav = function() {
        this.options._navExpanded = false;
        this.options.$mainNav.removeClass("expand");
        this.options.$subNav.removeClass("expand");
        this.options.$subNavLink.removeClass("expand");
        this.options.$menuToggle.removeClass("expand");
        this.options.$mainHeader.removeClass("expand");
        this.options.$navigation.removeClass("expand");
        return this.options.$html.removeClass("full-nav");
      };

      HeaderNavPrivate.prototype.subNavLinkAction = function($this) {
        this.options.$mainNav = $("#mainNav");
        this.options.$subNavLink = this.options.$mainNav.find(".nav-push");
        this.options.$subNav = $("#subNav");
        if ($this.hasClass("expand")) {
          $this.removeClass("expand");
          this.options.$subNav.removeClass("expand");
        } else {
          if (!this.options.$body.hasClass("is-mobile")) {
            this.loadSubNav($this);
          }
          this.options.$subNavLink.removeClass("expand");
          $this.addClass("expand");
          this.options.$subNav.addClass("expand");
        }
      };

      HeaderNavPrivate.prototype.loadSubNav = function($this) {
        var $li, data, subNavJson, template;
        _.templateSettings.variable = "rc";
        $li = $this.parent();
        data = $li.data();
        subNavJson = data.subNavigationJson;
        template = _.template(this.options.$subNavTemplate.html());
        return this.options.$subNav.html(template(subNavJson));
      };

      HeaderNavPrivate.prototype.insertMenuTemplate = function() {
        var $tabletMenuTemplate, $tabletTempletHtml;
        $tabletMenuTemplate = $("#tabletMenuTemplate");
        if ($tabletMenuTemplate.length) {
          $tabletTempletHtml = $($tabletMenuTemplate.html());
          if ($tabletTempletHtml.length) {
            return $tabletTempletHtml.insertBefore($tabletMenuTemplate);
          }
        }
      };

      HeaderNavPrivate.prototype.addClassOnOccasion = function() {
        var $liveScoresItem;
        $liveScoresItem = this.options.$subNavList.find(".live-scores-app");
        if ($liveScoresItem.length) {
          return $liveScoresItem.parent("li").addClass($liveScoresItem.attr("class"));
        }
      };

      HeaderNavPrivate.prototype.additionalSelectors = function() {
        this.options.$menuToggle = $(this.options.menuToggle);
        this.options.$menuClose = $(this.options.menuClose);
        this.options.$headerCallouts = $(this.options.headerCallouts);
        this.options.$mainNav = $(this.options.mainNav);
        this.options.$navigation = $(this.options.navigation);
        this.options.$mainHeader = $(this.options.mainHeader);
        this.options.$subNavLink = $(this.options.subNavLink);
        this.options.$subNav = $(this.options.subNav);
        this.options.$body = $(this.options.body);
        this.options.$html = $(this.options.html);
        this.options.$document = $(this.options.document);
        this.options.$subNavTemplate = $(this.options.subNavTemplate);
        this.options.$cookieClose = $(this.options.cookieClose);
        return this.options.$subNavList = $(this.options.subNavList);
      };

      return HeaderNavPrivate;

    })();

    return HeaderNav;

  })();
});
