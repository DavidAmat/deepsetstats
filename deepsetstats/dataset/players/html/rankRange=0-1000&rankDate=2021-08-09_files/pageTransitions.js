var bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; };

define(["jquery", "modules/global/moreLink", "modules/global/largeDropinAd", "modules/page/filter", "modules/global/subNavigation", "modules/featured/longForm", "modules/modal/modal", "util/util"], function ($, MoreLink, LargeDropinAd, Filter, SubNavigation, LongForm, Modal, Util) {
    var PageTransitions;
    return PageTransitions = (function () {
        var PrivatePageTransitions, instance;

        function PageTransitions() { }

        instance = null;

        PageTransitions.get = function (options) {
            this.options = options;
            return instance != null ? instance : instance = new PrivatePageTransitions(this.options);
        };

        PrivatePageTransitions = (function () {
            new MoreLink({
                element: "#subNavigation",
                navWrap: ".header-sub-navigation-list-wrap",
                navList: ".header-sub-navigation-list",
                wrapperInner: ".container",
                wrapperInnerPadding: 31
            });

            function PrivatePageTransitions(options) {
                this.options = options;
                this.transitionUpdatePage = bind(this.transitionUpdatePage, this);
                this.options = $.extend({}, this.defaults, this.options);
                this.additionalSelectors();
            }

            PrivatePageTransitions.prototype.defaults = {
                pageHeader: "#pageHeader",
                largeDropin: "#largeDropin",
                mainContainer: "#mainContainer",
                filterHolder: "#filterHolder",
                navigation: "#navigation",
                html: "html",
                body: "body",
                wrapper: "body > .wrapper",
                longForm: "#longForm",
                mainNav: "#mainNav",
                mainHeader: "#mainHeader",
                subNavigation: ".header-sub-navigation",
                headerCallouts: ".header-callouts",
                pageHeaderTemplate: "#pageHeaderTemplate",
                subNavigationTemplate: "#subNavigationTemplate",
                largeDropinTemplate: "#largeDropinTemplate",
                longFormTemplate: "#longFormTemplate",
                headerCalloutsTemplate: "#headerCalloutsTemplate",
                haveFilter: false,
                transitionDelay: 250
            };

            PrivatePageTransitions.prototype.additionalSelectors = function () {
                this.options.$pageHeader = $(this.options.pageHeader);
                this.options.$largeDropin = $(this.options.largeDropin);
                this.options.$mainContainer = $(this.options.mainContainer);
                this.options.$filterHolder = $(this.options.filterHolder);
                this.options.$navigation = $(this.options.navigation);
                this.options.$html = $(this.options.html);
                this.options.$body = $(this.options.body);
                this.options.$wrapper = $(this.options.wrapper);
                this.options.$longForm = $(this.options.longForm);
                this.options.$mainNav = $(this.options.mainNav);
                this.options.$mainHeader = $(this.options.mainHeader);
                this.options.$subNavigation = $(this.options.subNavigation);
                this.options.$headerCallouts = $(this.options.headerCallouts);
                this.options.$pageHeaderTemplate = $(this.options.pageHeaderTemplate);
                this.options.$subNavigationTemplate = $(this.options.subNavigationTemplate);
                this.options.$largeDropinTemplate = $(this.options.largeDropinTemplate);
                this.options.$longFormTemplate = $(this.options.longFormTemplate);
                return this.options.$headerCalloutsTemplate = $(this.options.headerCalloutsTemplate);
            };

            PrivatePageTransitions.prototype.isModalOpen = 0;

            PrivatePageTransitions.prototype.willOpenModal = 0;

            PrivatePageTransitions.prototype.transitionStart = function () {
                var ref;
                this.isModalOpen = $("#modal").length;
                this.previousPageTransitionTitle = $("meta[property='pageTransitionTitle']");
                if ((ref = this.previousPageTransitionTitle) != null ? ref.length : void 0) {
                    this.previousPageTransitionTitle = this.previousPageTransitionTitle.attr('content').trim();
                }
                if (window.app.FilteredModules) {
                    if ($("#playerProfileHero").length) {
                        this.options.$html.addClass("transition-content-on--player-profile");
                    }
                }
                if (window.app.FilteredModules || window.app.OverrideTransition) {
                    return false;
                }
                this.additionalSelectors();
                this.closeExpandedItems();
                this.scrollToTop();
                if (!this.isModalOpen) {
                    return this.options.$html.addClass("transition-content-on");
                }
            };

            PrivatePageTransitions.prototype.transitionEnd = function () {
                var $response, _onSamePage, _pageTransitionTitle, _responseContainsModal, _responseContainsOverrideTransition, _responseModal;
                $response = $(this.response);
                _responseContainsModal = $response.find(".modal").length || $response.hasClass('modal');
                _responseContainsOverrideTransition = $response.find("[data-filtered-module]").length;
                _pageTransitionTitle = $response.filter("meta[property='pageTransitionTitle']");
                if (_pageTransitionTitle != null ? _pageTransitionTitle.length : void 0) {
                    _pageTransitionTitle = _pageTransitionTitle.attr('content').trim();
                    _onSamePage = _pageTransitionTitle === this.previousPageTransitionTitle;
                }
                if (window.app.FilteredModules && _responseContainsOverrideTransition && _onSamePage) {
                    this.updateFilteredModules();
                    this.modifyResponse();
                    this.updateOutsideElements(1);
                    this.options.$html.removeClass("transition-content-on--player-profile");
                    return false;
                }
                this.options.$html.removeClass("transition-content-on--player-profile");
                if (_responseContainsModal === false) {
                    this.scrollToTop();
                }
                if (this.isModalOpen) {
                    if (_responseContainsModal) {
                        _responseModal = $response.find("#modal");
                        if (_responseModal.length === 0) {
                            _responseModal = $response;
                        }
                        return this.modal.modalTransition(_responseModal);
                    } else {
                        this.transitionUpdatePage();
                        return setTimeout((function (_this) {
                            return function () {
                                return _this.modal.closeModal(window.location.pathname, true);
                            };
                        })(this), this.options.transitionDelay * 2 + this.modal.options.transitionDelay);
                    }
                } else if (_responseContainsModal) {
                    this.modal.openModal($(this.response));
                    return setTimeout((function (_this) {
                        return function () {
                            return _this.options.$html.removeClass("transition-content-on");
                        };
                    })(this), this.modal.options.transitionDelay);
                } else {
                    return this.transitionUpdatePage();
                }
            };

            PrivatePageTransitions.prototype.transitionUpdatePage = function () {
                return setTimeout((function (_this) {
                    return function () {
                        _this.updatePage();
                        return setTimeout(function () {
                            return _this.options.$html.removeClass("transition-content-on");
                        }, _this.options.transitionDelay);
                    };
                })(this), this.options.transitionDelay);
            };

            PrivatePageTransitions.prototype.closeExpandedItems = function () {
                var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9;
                if ((ref = this.options.$filterHolder) != null) {
                    ref.removeClass("expand");
                }
                if ((ref1 = this.options.$largeDropin) != null) {
                    ref1.removeClass("expand");
                }
                this.options.$navigation.removeClass("expand");
                this.options.$html.removeClass("full-nav");
                if ((ref2 = this.options.$html) != null) {
                    ref2.removeClass("long-form-on");
                }
                $("html").removeClass("modal-carousel-on");
                $(".modal-carousel-wrapper").remove();
                $(".atp-touch-hover").removeClass("atp-touch-hover");
                if ((ref3 = this.options.$mainNav) != null) {
                    ref3.removeClass("expand");
                }
                if ((ref4 = this.options.$subNav) != null) {
                    ref4.removeClass("expand");
                }
                if ((ref5 = this.options.$subNavLink) != null) {
                    ref5.removeClass("expand");
                }
                if ((ref6 = this.options.$menuToggle) != null) {
                    ref6.removeClass("expand");
                }
                if ((ref7 = this.options.$mainHeader) != null) {
                    ref7.removeClass("expand");
                }
                if ((ref8 = this.options.$navigation) != null) {
                    ref8.removeClass("expand");
                }
                if ((ref9 = this.options.$html) != null) {
                    ref9.removeClass("full-nav");
                }
                $("#mainNav, .nav-push, #controlMenu").removeClass("expand");
                return $("#closeSearch").trigger("click");
            };

            PrivatePageTransitions.prototype.scrollToTop = function () {
                return $("html, body").stop().animate({
                    scrollTop: 0
                });
            };

            PrivatePageTransitions.prototype.modal = new Modal();

            PrivatePageTransitions.prototype.updateFilteredModules = function () {

                var $response, that;
                $response = $(this.response);
                $("[data-filtered-module]").each(function () {
                    var _html, _module;
                    _module = "[data-filtered-module='" + ($(this).data("filtered-module")) + "']";
                    _html = $response.find(_module).html() || $response.filter(_module).html();
                    return $(this).html(_html);
                });
                that = $(this);
                return $response.filter("[data-filtered-module-forced]").each(function () {
                    var _element, _module;
                    _module = "[data-filtered-module='" + ($(this).data("filtered-module")) + "']";
                    _element = that.find(_module) || that.filter(_module);
                    if (_element.length) {
                        return _element.html($(this).html());
                    } else {
                        return $("#mainContent").append(this.outerHTML);
                    }
                });
            };

            PrivatePageTransitions.prototype.updatePageHeader = function () {
                var $template, $response, _currentItemTransform, _currentTitle, _filterScript, _previousItemTransform, _previousTitle, _strippedFilterTemplate, _template, defaultPageHeader, trimmedPageHeader;
                $response = $(this.response);
                const pageHeader = $response.find('.page-header-holder').html();
                if (typeof pageHeader !== "undefined") {
                    this.pageHeaderHtml = pageHeader;
                }
                defaultPageHeader = '<div class="page-header-holder"></div>';
                if (this.pageHeaderHtml !== null && this.pageHeaderHtml !== void 0) {
                    trimmedPageHeader = this.pageHeaderHtml.trim();
                    if (trimmedPageHeader !== "") {
                        _template = this.pageHeaderHtml;
                    } else {
                        _template = defaultPageHeader;
                    }
                } else {
                    _template = defaultPageHeader;
                }
                $template = $(_template);
                _previousTitle = (this.options.$pageHeader.find(".page-title").text()).trim() || this.options.$pageHeader.find(".page-title img").attr("src");
                _currentTitle = ($template.filter(".page-title").text()).trim() || this.options.$pageHeader.find(".page-title img").attr("src");
                _filterScript = $template.filter("#filterScript");
                _strippedFilterTemplate = $template.not(_filterScript);
                if (_previousTitle === _currentTitle && (_strippedFilterTemplate != null) && _strippedFilterTemplate !== "") {
                    this.options.$pageHeader.find(".page-header-holder").html(_strippedFilterTemplate);
                    if (_filterScript.length) {
                        this.options.$pageHeader.find(".page-header-holder").append(_filterScript);
                        this.defaults.haveFilter = true;
                    } else {
                        this.defaults.haveFilter = false;
                    }
                    Util.checkPageHeader($(_template));
                    return this.moreLinkInit();
                } else {

                    if (!_strippedFilterTemplate) {

                        return this.options.$pageHeader.find(".page-header-holder").empty();
                    } else {

                        _strippedFilterTemplate = _strippedFilterTemplate.wrapAll("<div class='page-header-holder'></div>").parent();
                        this.options.$pageHeader.append(_strippedFilterTemplate || defaultPageHeader);
                        _previousItemTransform = "translateY(110px)";
                        _currentItemTransform = "translateY(0)";
                        this.options.$html.addClass("transition-header-on");
                        setTimeout((function (_this) {
                            return function () {

                                return _this.options.$pageHeader.find(".page-header-holder").eq(0).css({
                                    "-webkit-transform": _previousItemTransform,
                                    "-moz-transform": _previousItemTransform,
                                    "-ms-transform": _previousItemTransform,
                                    "transform": _previousItemTransform,
                                    "opacity": 0,
                                    "position": "absolute",
                                    "top": 0,
                                    "left": 0,
                                    "z-index": 1
                                });
                            };
                        })(this), this.options.transitionDelay / 2);
                        setTimeout((function (_this) {
                            var self = this;
                            return function () {
                                return _this.options.$pageHeader.find(".page-header-holder").eq(1).css({
                                    "-webkit-transform": _currentItemTransform,
                                    "-moz-transform": _currentItemTransform,
                                    "-ms-transform": _currentItemTransform,
                                    "transform": _currentItemTransform,
                                    "opacity": 1

                                }, setTimeout(function () {
                                    _this.options.$pageHeader.find(".page-header-holder").eq(0).remove();
                                    Util.checkPageHeader($(_template));
                                    if (_filterScript.length) {
                                        document.querySelector('#pageHeader').classList.add('has-filter-toggle');

                                        _this.options.$pageHeader.find(".page-header-holder").append(_filterScript);

                                        _this.defaults.haveFilter = true;
                                    } else {
                                        document.querySelector('#pageHeader').classList.remove('has-filter-toggle');
                                        document.querySelector('#header').classList.remove('filter-expand');
                                        _this.defaults.haveFilter = false;
                                    }
                                    _this.options.$html.removeClass("transition-header-on");
                                    _this.options.$pageHeader.find(".page-header-holder").eq(0).removeAttr("style");
                                    new MoreLink({
                                        element: "#subNavigation",
                                        navWrap: ".header-sub-navigation-list-wrap",
                                        navList: ".header-sub-navigation-list",
                                        wrapperInner: ".container",
                                        wrapperInnerPadding: 31
                                    });
                                }, _this.options.transitionDelay));
                            };
                        })(this), this.options.transitionDelay);

                    }
                }
            };

            PrivatePageTransitions.prototype.moreLinkInit = function () {
                new MoreLink({
                    element: "#subNavigation",
                    navWrap: ".header-sub-navigation-list-wrap",
                    navList: ".header-sub-navigation-list",
                    wrapperInner: ".container",
                    wrapperInnerPadding: 31
                });
                new MoreLink({
                    wrapperInnerPadding: 16
                });

            };

            PrivatePageTransitions.prototype.updatePage = function () {
                this.options.$wrapper.children('[data-outside-element="largeDropin"]').remove();
                this.modifyResponse();
                $("#mainContent").remove();

                this.options.$mainContainer.html(this.modifiedResponse);
                //this.options.$mainContainer.append(this.modifiedResponse);

                this.additionalSelectors();
                this.updateOutsideElements(1000);
                Util.setModalContainer();
                return Util.setSponsoredBackground();
            };

            PrivatePageTransitions.prototype.modifyResponse = function () {
                var $outsideElements, $response, _self, largeDropInAd, largeDropInAdParent, that;
                _self = this;

                $response = $(this.response);

                largeDropInAd = $response.filter("#largeDropin");
                largeDropInAdParent = largeDropInAd.wrap('<div data-outside-element="largeDropin"></div>').parent();
                $outsideElements = $response.filter("[data-outside-element]");
                $outsideElements = $outsideElements.add(largeDropInAdParent);
                this.newMeta = $response.filter("meta");
                this.newTitle = $response.filter("title");

                this.mainContent = $response.find('#mainContainer').html();



                this.modifiedResponse = $response.not($outsideElements);
                this.modifiedResponse = this.modifiedResponse.not(this.newMeta);
                this.modifiedResponse = this.modifiedResponse.not(this.newTitle);
                this.modifiedResponse = this.modifiedResponse.not(largeDropInAd);
                if (typeof this.mainContent !== "undefined") {
                    this.modifiedResponse = this.mainContent;
                }


                that = this;
                $outsideElements.each(function () {
                    var $this, _outsideHtml, _outsideLabel;
                    $this = $(this);
                    _outsideLabel = $this.data("outside-element");
                    _outsideHtml = $this.html();
                    if (_outsideLabel === "pageHeader") {
                        return _self.pageHeaderHtml = _outsideHtml;
                    } else if (_outsideLabel === "largeDropin") {
                        return that.options.$wrapper.prepend($this);
                    } else {
                        return $("[data-outside-element='" + _outsideLabel + "']").html(_outsideHtml);
                    }
                });
                return this.updateHeaderTags();
            };

            PrivatePageTransitions.prototype.updateHeaderTags = function () {
                var head, oldMeta, oldTitle;
                oldMeta = $('meta');
                oldTitle = $('title');
                head = $('head');
                oldMeta.remove();
                head.prepend(this.newMeta);
                oldTitle.remove();
                return head.prepend(this.newTitle);
            };

            PrivatePageTransitions.prototype.updateLargeDropin = function () {
                var dropIn;
                if (this.options.$largeDropin.length) {
                    dropIn = this.options.largeDropin;
                    this.options.$wrapper.children(dropIn).empty().remove();
                }
                new LargeDropinAd({
                    openAdTimeout: 2000
                });
            };

            PrivatePageTransitions.prototype.updateSubNavigation = function (timeOut) {
                return setTimeout((function (_this) {
                    return function () {
                        var _template, ref;
                        _this.additionalSelectors();
                        _template = (ref = _this.options.$subNavigationTemplate) != null ? ref.html() : void 0;
                        if (_template) {
                            _this.options.$subNavigation.remove();
                            $(_template).insertAfter(_this.options.mainHeader);
                            if (_this.options.$body.hasClass("is-mobile")) {
                                return new SubNavigation();
                            }
                        } else {
                            return _this.options.$subNavigation.remove();
                        }
                    };
                })(this), timeOut || this.options.transitionDelay * 2.1);
            };

            PrivatePageTransitions.prototype.updateHeaderCallouts = function () {
                var _template, ref;
                _template = (ref = this.options.$headerCalloutsTemplate) != null ? ref.html() : void 0;
                if (_template) {
                    if (!this.options.$headerCallouts.length) {
                        return $(_template).insertAfter(this.options.mainHeader);
                    } else {
                        return this.options.$headerCallouts[0].outerHTML = _template;
                    }
                } else {
                    return this.options.$headerCallouts.remove();
                }
            };

            PrivatePageTransitions.prototype.updateLongForm = function () {
                var _template, ref;
                _template = (ref = this.options.$longFormTemplate) != null ? ref.html() : void 0;
                if (_template) {
                    if (!this.options.$longForm.length) {
                        this.options.$body.append(_template);
                    } else {
                        this.options.$longForm[0].outerHTML = _template;
                    }
                    return setTimeout((function (_this) {
                        return function () {
                            return new LongForm();
                        };
                    })(this), this.options.transitionDelay);
                } else {
                    return setTimeout((function (_this) {
                        return function () {
                            var ref1;
                            return (ref1 = _this.options.$longForm) != null ? ref1.remove() : void 0;
                        };
                    })(this), this.options.transitionDelay);
                }
            };

            PrivatePageTransitions.prototype.updateStickyNav = function () { };

            PrivatePageTransitions.prototype.updateOutsideElements = function (timeOut) {
                this.additionalSelectors();
                this.updateSubNavigation(timeOut);
                this.updateHeaderCallouts();
                this.updatePageHeader();
                this.updateLongForm();
                return this.updateStickyNav();
            };

            return PrivatePageTransitions;

        })();

        return PageTransitions;

    })();
});
