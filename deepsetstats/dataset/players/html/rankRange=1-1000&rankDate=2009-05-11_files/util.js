define(["jquery", "backbone"], function ($, Backbone) {
    var Util;
    return Util = (function () {
        function Util() { }

        Util.ajaxModal = function (options) {
            var $ajaxCall;
            return $ajaxCall = $.ajax({
                type: "GET",
                url: options.url,
                dataType: "html",
                success: function (response) {
                    return Util.ajaxModalSuccess(options, response);
                }
            });
        };

        Util.ajaxModalSuccess = function (options, response) {
            options.$element.remove();
            $("body").append(response);
            if (typeof options.callBack === "function") {
                return options.callBack(response);
            }
        };

        Util.modalOpenFixScroll = function () {
            var _scrollTop;
            _scrollTop = $(window).scrollTop();
            if (_scrollTop < 40 && _scrollTop > 1 && !$("body").hasClass("is-mobile")) {
                return $("html, body").stop().animate({
                    scrollTop: 0
                });
            }
        };

        Util.navigateTo = function (href, trigger, filteredModules, target, overrideTransition) {
            void 0;
            var navigateToHref;

            if (target == null) {
                target = "_self";
            }

            navigateToHref = this.parseUrl(href);
            if (navigateToHref.hostname !== window.location.hostname) {
                window.open(href, target);
                return false;
            }
            return window.location = href;
        };

        Util.updateUrl = function (url) {
            if (typeof history.pushState !== "undefined" || !this.isIE9()) {
                return Backbone.history.history['pushState']({}, document.title, url);
            }
        };

        Util.updateQuery = function (key, value) {
            var _url;
            _url = this.updateQueryStringParameter(document.URL, key, value);
            return this.updateUrl(_url);
        };

        Util.isMobile = function () {
            return /iPod|iPhone|Blackberry|Android|Windows Phone/i.test(navigator.userAgent);
        };

        Util.isIE = function () {
            return /MSIE/.test(navigator.userAgent);
        };

        Util.isIE11 = function () {
            return /Windows/.test(navigator.userAgent) && /rv:11.0/.test(navigator.userAgent);
        };

        Util.isIE9 = function () {
            return /MSIE 9.0/.test(navigator.userAgent);
        };

        Util.isFirefox = function () {
            return /Firefox/.test(navigator.userAgent);
        };

        Util.isWindowsPhone = function () {
            return /Windows Phone/i.test(navigator.userAgent);
        };

        Util.isIpad = function () {
            return /iPad/i.test(navigator.userAgent);
        };

        Util.closeMobileKeyboard = function () {
            var ref;
            if ((ref = document.activeElement) != null) {
                ref.blur();
            }
            return $("input").blur();
        };

        Util.supportsMP4 = function () {
            return !!document.createElement('video').canPlayType('video/mp4; codecs=avc1.42E01E,mp4a.40.2');
        };

        Util.numberWithCommas = function (originalNumber) {
            return originalNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        Util.padNumbers = function (originalNumber, size) {
            var _numberString;
            if (size == null) {
                size = 2;
            }
            _numberString = originalNumber + "";
            while (_numberString.length < size) {
                _numberString = "0" + _numberString;
            }
            return _numberString;
        };

        Util.placeholderFix = function () {
            if (this.isIE9()) {
                return $("input").each(function () {
                    var $this;
                    $this = $(this);
                    if ($this.val() === "" && $this.attr("placeholder") !== "") {
                        $this.val($this.attr("placeholder"));
                        $this.off("focus");
                        $this.on("focus", function () {
                            if ($(this).val() === $(this).attr("placeholder")) {
                                return $(this).val("");
                            }
                        });
                        $this.off("blur");
                        return $this.on("blur", function () {
                            if ($(this).val() === "") {
                                return $(this).val($(this).attr("placeholder"));
                            }
                        });
                    }
                });
            }
        };

        Util.turnOffAutoPlayRoyalSlider = function (timeOut) {
            if (timeOut == null) {
                timeOut = 0;
            }
            return setTimeout(function () {
                return $(".royalSlider").each(function () {
                    var ref;
                    return (ref = $(this).data("royalSlider")) != null ? ref.stopAutoPlay() : void 0;
                });
            }, timeOut);
        };

        Util.turnOnAutoPlayRoyalSlider = function (timeOut) {
            if (timeOut == null) {
                timeOut = 0;
            }
            return setTimeout(function () {
                return $(".royalSlider").each(function () {
                    var ref;
                    return (ref = $(this).data("royalSlider")) != null ? ref.startAutoPlay() : void 0;
                });
            }, timeOut);
        };

        Util.waypointsRefresh = function () {
            return window.waypointsRefresh = setInterval((function (_this) {
                return function () {
                    return $ != null ? $.waypoints("refresh") : void 0;
                };
            })(this), 250);
        };

        Util.killWaypointsRefresh = function () {
            if (window.waypointsRefresh) {
                return clearInterval(window.waypointsRefresh);
            }
        };

        Util.forceRedraw = function (element) {
            var disp, n;
            if (!element) {
                return;
            }
            n = document.createTextNode(" ");
            disp = element.style.display;
            element.appendChild(n);
            element.style.display = "none";
            setTimeout((function () {
                element.style.display = disp;
                n.parentNode.removeChild(n);
            }), 20);
        };

        Util.equalHeight = function ($selector) {
            var _heightValues, _newHeight;
            if ($selector.length && !$("body").hasClass("is-mobile")) {
                $selector.removeAttr("style");
                _heightValues = new Array();
                $selector.each(function (index, value) {
                    return _heightValues[index] = $(this).height();
                });
                _newHeight = _heightValues.reduce(function (previous, current) {
                    if (previous > current) {
                        return previous;
                    } else {
                        return current;
                    }
                });
                return $selector.css({
                    height: _newHeight
                });
            }
        };

        Util.updateQueryStringParameter = function (uri, key, value) {
            var re, separator;
            re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            separator = "";
            if (uri.indexOf('?') !== -1) {
                separator = "&";
            } else {
                separator = "?";
            }
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                return uri + separator + key + "=" + value;
            }
        };

        Util.convertDataScript = function () {
            return $("[data-placeholder-script]").each(function () {
                var $script, _attrs, _script;
                $script = $(this);
                _attrs = " ";
                $.each($script.get(0).attributes, function (index, value) {
                    if ("data-placeholder-script" !== value.name) {
                        return _attrs += value.name + "='" + value.value + "'";
                    }
                });
                _script = $script.html();
                return $script.replaceWith("<script " + _attrs + ">" + _script + "</script>");
            });
        };

        Util.getModalContainer = function () {
            return $.cookie(window.app.ModalContainerCookie);
        };

        Util.setModalContainer = function () {
            var pageModal;
            pageModal = $("html").hasClass("modal-on");
            return pageModal || $.cookie(window.app.ModalContainerCookie, window.location.pathname, {
                expires: 1,
                path: "/"
            });
        };

        Util.checkPageHeader = function ($selector) {
            var $headerHolder, hasChildren, $header;
            $headerHolder = $(".page-header-holder");
            $header = $("#header");
            hasChildren = $selector.children().length || !$selector.hasClass("page-header-holder") && $selector.filter("*").length;
            if (hasChildren) {
                $header.removeClass('empty-subnav')
                return $headerHolder.removeClass("is-empty");
            } else {
                $header.addClass('empty-subnav')
                return $headerHolder.addClass("is-empty");
            }
        };

        Util.setSponsoredBackground = function () {
            var $mainContent, $wrapper, _data;
            $mainContent = $("#mainContent");
            $wrapper = $(".wrapper:eq(0)");
            _data = $mainContent.data() || {};
            if (_data.takeoverTheme) {
                $wrapper.removeClass("background-takeover takeover-light takeover-dark").addClass("background-takeover takeover-" + _data.takeoverTheme);
                return $wrapper.css({
                    "background-image": "url(" + _data.takeoverBackground + ")"
                });
            } else {
                $wrapper.removeClass("background-takeover takeover-light takeover-dark");
                return $wrapper.removeAttr("style");
            }
        };

        Util.parseUrl = function (url) {
            var parser;
            parser = document.createElement('a');
            parser.href = url;
            if (parser.hostname === "") {
                parser.href = parser.href;
            }
            return parser;
        };

        Util.renderBeginAnalyticsLink = function (href, analytics, parameters) {
            var elementAttributes;
            elementAttributes = "";
            if (analytics !== void 0) {
                elementAttributes = " data-ga-category=\"" + analytics.category + "\" data-ga-label=\"" + analytics.label + "\" data-ga-action=\"" + analytics.action + "\" ";
            }
            if (parameters !== void 0) {
                $.each(parameters, function (key, value) {
                    if (value !== void 0 && value !== "") {
                        return elementAttributes = elementAttributes + (" " + key + "=\"" + value + "\" ");
                    }
                });
            }
            return "<a href=\"" + href + "\" " + elementAttributes + " data-use-ga>";
        };

        Util.renderAnalyticsLink = function (href, innerHtml, analytics, parameters) {
            var beginLink;
            beginLink = this.renderBeginAnalyticsLink(href, analytics, parameters);
            return "" + beginLink + innerHtml + "</a>";
        };

        return Util;

    })();
});
