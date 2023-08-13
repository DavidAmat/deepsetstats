var bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; };

define(["jquery", "modules/global/subNavigation", "util/util"], function ($, SubNavigation, Util) {
    var FixedHeader;
    return FixedHeader = (function () {
        function FixedHeader(options) {
            this.options = options;
            this.removeHoverClassEvent = bind(this.removeHoverClassEvent, this);
            this.touchDropdownEvent = bind(this.touchDropdownEvent, this);
            this.options = $.extend({}, this.defaults, this.options);
            this.additionalSelectors();
            this.delegateEvents();
        }

        FixedHeader.prototype.defaults = {
            element: "#mainHeader",
            logo: ".atp-logo",
            navWrap: ".atp-nav-wrap",
            navWrapInner: ".atp-nav-wrap-inner",
            sponsor: ".atp-nav-sponsor",
            container: ".atp-header-container",
            navList: ".atp-nav-list",
            navItems: ".atp-nav-item",
            header: "#header",
            menuToggle: "#controlMenu",
            hoverClass: "atp-touch-hover",
            headerContainer: ".atp-header-container",
            moreText: "more",
            searchControl: "#controlSearch",
            moreWidth: 98
        };

        FixedHeader.prototype.additionalSelectors = function () {
            this.options.$element = $(this.options.element);
            this.options.$logo = $(this.options.logo);
            this.options.$menuToggle = $(this.options.menuToggle);
            this.options.$navWrap = this.options.$element.find(this.options.navWrap);
            this.options.$navWrapInner = this.options.$element.find(this.options.navWrapInner);
            this.options.$sponsor = this.options.$element.find(this.options.sponsor);
            this.options.$container = this.options.$element.find(this.options.container);
            this.options.$navList = this.options.$element.find(this.options.navList);
            this.options.$navItems = this.options.$element.find(this.options.navItems);
            this.options.$window = $(window);
            this.options.$body = $("body");
            this.options.$html = $("html");
            this.options.$header = $(this.options.header);
            this.options.$headerContainer = this.options.$header.find(this.options.headerContainer);
            this.options.$searchControl = $(this.options.searchControl);
        };


        FixedHeader.prototype.delegateEvents = function () {
            this.fixedEvent();
            //$("body").on("click", "*", this.removeHoverClassEvent);
            //return this.options.$element.on("click", this.options.navList + " > " + this.options.navItems + " > a[href]:not([href='#'])", this.touchDropdownEvent);
        };

        FixedHeader.prototype.fixedEvent = function () {
            var _headerHeight, self;
            self = this;
            if (self.options.$body.hasClass("is-mobile")) {
                _headerHeight = self.options.$header.height();
                if (_headerHeight > 170) {
                    _headerHeight = 170;
                }
                //self.options.$body.css("margin-top", _headerHeight);
                if ($('#headerSubNavigationDrawer').length) {
                    return self.navSlideSubNav();
                }
            } else {
                return self.options.$window.on("scroll", function () {
                    var _currentScrollLocation;
                    _currentScrollLocation = self.options.$window.pageYOffset;
                    if (_currentScrollLocation > 80 && !self.options.$body.hasClass("fixed")) {
                        return self.options.$body.addClass("fixed");
                    } else if (_currentScrollLocation <= 80 && self.options.$body.hasClass("fixed")) {
                        return self.options.$body.removeClass("fixed");
                    }
                });
            }
        };

        FixedHeader.prototype.navSlideSubNav = function () {
            var $breakingNews, $header, $subNavigation, _drawerHeight, _self;
            _self = this;
            $header = $('#header');
            _drawerHeight = $('header-sub-navigation-drawer').outerHeight();
            $breakingNews = $('#breakingNews');
            $subNavigation = $('#subNavigation');
            return this.options.$window.on("scroll", function () {
                var scroll_top;
                scroll_top = _self.options.$window.scrollTop();
                if (scroll_top > _drawerHeight) {
                    $breakingNews.removeClass("expand");
                    return $subNavigation.removeClass("dropdown-on");
                }
            });
        };

        FixedHeader.prototype.touchDropdownEvent = function (event) {
            var $currentItem, $currentLink, _target, _url;
            event.preventDefault();
            $currentLink = $(event.currentTarget);
            $currentItem = $currentLink.parent();
            _url = $currentLink.attr("href");
            _target = $currentLink.attr("target" != null ? "target" : "_self");
            if (this.options.$html.hasClass("device-using-touch") || Util.isIpad()) {
                if ($currentItem.hasClass(this.options.hoverClass)) {
                    return Util.navigateTo(_url, true, false, _target);
                } else {
                    $currentItem.siblings().removeClass(this.options.hoverClass);
                    return $currentItem.addClass(this.options.hoverClass);
                }
            } else {
                return Util.navigateTo(_url, true, false, _target);
            }
        };

        FixedHeader.prototype.removeHoverClassEvent = function (event) {
            var $current, $currentTarget;
            $current = $(event.target);
            $currentTarget = $(event.currentTarget);
            if (!$current.closest("." + this.options.hoverClass).length || $current.hasClass(this.options.hoverClass)) {
                return $("." + this.options.hoverClass).removeClass(this.options.hoverClass);
            }
        };

        return FixedHeader;

    })();
});
