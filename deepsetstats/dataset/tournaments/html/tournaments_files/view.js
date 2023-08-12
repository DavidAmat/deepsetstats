
/*
 * This is the default view that most Sitecore pages will use for rendering through backbonejs
 */
define(["jquery", "views/baseView", "util/pageTransitions"], function ($, BaseView, PageTransitions) {
    var SitecorePage;
    return SitecorePage = BaseView.View.extend({
        className: "main-container",
        render: function () {
            void 0
            var deviceQueryString, hashIndex, hrefLength, linkPart, ref, self, url;
            self = this;
            hrefLength = location.href.length;
            deviceQueryString = "";
            if ($("body").hasClass("is-tablet")) {
                deviceQueryString = "&t=1";
            }
            if ($("body").hasClass("is-mobile")) {
                deviceQueryString = "&m=1";
            }
            if (location.href.indexOf("m=1") > -1) {
                deviceQueryString = "";
            }
            linkPart = "?";
            if (location.search) {
                linkPart = "&";
            }
            
            if (location.hash) {
                hashIndex = location.href.indexOf("#");
                url = location.href.substring(0, hashIndex) + linkPart + "ajax=true" + deviceQueryString + location.href.substring(hashIndex, hrefLength);
            } else {
                if (location.href.indexOf('?') !== -1 && (location.search === void 0 || location.search === "")) {
                    linkPart = "";
                }
                url = location.href + linkPart + "ajax=true" + deviceQueryString;
            }
            if (Backbone.history.fragment.indexOf('/video') !== -1) {
                
                return window.location = "/"+Backbone.history.fragment;
            }
            if (typeof window.ps !== "undefined") {
                window.ps = null;
                return window.location = "/" + Backbone.history.fragment;
            }
            if ((ref = app.ajaxRequest) != null) {
                ref.abort();
            }

            app.ajaxRequest = $.get(url, function (data) {
                
               
                void 0;
                var pageTransitions;
                self.router.trackPageView();
                pageTransitions = PageTransitions.get();
                pageTransitions.response = data;
                return pageTransitions.transitionEnd();
            });
            return BaseView.View.prototype.render.apply(self, arguments);
        }
    });
});
