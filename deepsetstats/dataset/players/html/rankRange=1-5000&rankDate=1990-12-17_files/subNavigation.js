var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(["jquery", "modules/global/moreLink", "jquery.mobile.events"], function($, MoreLink) {
  var SubNavigation;
  return SubNavigation = (function () {
    function SubNavigation(options) {
      this.options = options;
      this.pagerHeaderVisible = bind(this.pagerHeaderVisible, this);
      this.checkPageHeaderElements = bind(this.checkPageHeaderElements, this);
      this.mobileToggleSubNavigationEvent = bind(this.mobileToggleSubNavigationEvent, this);
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
      this.delegateEvents();
      this.checkPageHeaderElements();
    }

    SubNavigation.prototype.defaults = {
      element: "#subNavigation",
      header: "#header",
      pageHeader: "#pageHeader",
      body: "body",
      mainContainer: "#mainContainer",
      mobileToggleSubNavigation: "#headerSubNavigationDrawerToggle"
    };

    SubNavigation.prototype.delegateEvents = function() {
      if ($("body").hasClass("is-mobile")) {
        return this.options.$element.on("click", this.options.mobileToggleSubNavigation, this.mobileToggleSubNavigationEvent);
      } else {
        return this.desktopWaypointSubNavigation();
      }
    };

    SubNavigation.prototype.mobileToggleSubNavigationEvent = function(event) {
      return this.options.$element.toggleClass("dropdown-on");
    };

    SubNavigation.prototype.desktopWaypointSubNavigation = function() {
      return $(window).on("load scroll resize", this.pagerHeaderVisible);
    };

    SubNavigation.prototype.checkPageHeaderElements = function() {
      var checkFilter, checkFilterControl, checkFirstLi, checkImage, checkSubNavWrap, extraWidth, isExtraWidth, isFilter, isFilterControl, isImage;
      checkSubNavWrap = $('#pageHeader .sub-navigation-wrap').outerWidth();
      isImage = $('#pageHeader .page-title-image img').size();
      isFilter = $('#pageHeader .filter-holder.exposed').size();
      isFilterControl = $('#pageHeader .filter-control').size();
      checkFirstLi = $('#pageHeader li:first-child a').outerWidth();
      isExtraWidth = 0;
      extraWidth = 0;
      checkImage = 0;
      checkFilter = 0;
      checkFilterControl = 0;
      if (isImage) {
        checkImage = $('#pageHeader .page-title-image img').outerWidth();
      }
      if (isFilter) {
        checkFilter = $('#pageHeader .filter-holder.exposed').outerWidth();
      }
      if (isFilterControl) {
        checkFilterControl = $('#pageHeader .filter-control').outerWidth();
      }
      if (isImage) {
        isExtraWidth = isImage;
        extraWidth = checkImage;
      }
      if (isFilter) {
        isExtraWidth = isFilter;
        extraWidth = checkFilter;
      }
      if (isFilterControl) {
        isExtraWidth = isFilterControl;
        extraWidth = checkFilterControl;
      }
      if (isImage && isFilter || isImage && isFilterControl) {
        isExtraWidth = isImage;
        extraWidth = checkImage;
      }
      if (isExtraWidth && extraWidth < 30) {
        return setTimeout(function() {
          return SubNavigation.prototype.checkPageHeaderElements();
        }, 10);
      } else {
        if (checkFirstLi < 40) {
          return setTimeout(function() {
            return SubNavigation.prototype.checkPageHeaderElements();
          }, 10);
        } else {
            checkSubNavWrap = checkSubNavWrap - extraWidth;
            alert.log(checkSubNavWrap);
          $('#pageHeader .sub-navigation-wrap').width(checkSubNavWrap);
          new MoreLink({
            element: "#subNavigation",
            navWrap: ".header-sub-navigation-list-wrap",
            navList: ".header-sub-navigation-list",
            wrapperInner: ".container",
            wrapperInnerPadding: 31
          });
          return new MoreLink({
            wrapperInnerPadding: 16
          });
        }
      }
    };

    SubNavigation.prototype.pagerHeaderVisible = function() {
      var _offsetPreCalc, _pageHeaderOffset, _scrollTop, _subNavTop;
      this.additionalSelectors();
      if (this.options.$pageHeader.length && this.options.$element.length) {
        _offsetPreCalc = parseInt(this.options.$pageHeader.css("padding-top")) + (this.options.$pageHeader.height() - this.options.$pageHeader.find("#filterControl + #filterHolder").outerHeight());
        _pageHeaderOffset = this.options.$pageHeader.offset().top - this.options.$header.outerHeight() + (_offsetPreCalc - this.options.$element.outerHeight());
        if (this.options.$pageHeader.offset().top - this.options.$header.outerHeight() + (_offsetPreCalc - this.options.$element.outerHeight()) > 0) {
          _pageHeaderOffset = this.options.$pageHeader.offset().top - this.options.$header.outerHeight() + (_offsetPreCalc - this.options.$element.outerHeight());
        }
        _scrollTop = window.pageYOffset;
        if (_pageHeaderOffset <= _scrollTop) {
          this.options.$body.addClass("fixed-sub-navigation");
        } else {
          this.options.$body.removeClass("fixed-sub-navigation");
        }
        _subNavTop = this.options.$header.outerHeight();
        return this.options.$element.css({
          top: _subNavTop
        });
      }
    };

    SubNavigation.prototype.additionalSelectors = function() {
      this.options.$element = $(this.options.element);
      this.options.$mainContainer = $(this.options.mainContainer);
      this.options.$header = $(this.options.header);
      this.options.$pageHeader = $(this.options.pageHeader);
      return this.options.$body = $(this.options.body);
    };

    return SubNavigation;

  })();
});
