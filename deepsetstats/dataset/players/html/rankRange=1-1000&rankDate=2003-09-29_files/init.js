define(["jquery", "backbone", "util/global", "util/googleAnalytics"], function ($, Backbone, Global, GoogleAnalytics) {
    void 0;
    /*
           * Create the main backbone application object
           * This is here and not in a require module as it has to be added as a global variable
           * for all other backbone objects to reference
     */
    var isMobile;
    isMobile = $('body').hasClass("is-mobile");

    window.videoListeners = {
        videoPlayListScroller: null,
        stickyVideoScroll: null
    }
    window.GLOBAL_SCORES = {
        tourList: { tournaments: [] },
        challengerList: { tournaments: [] },
        tourCurrentTournamentsScoreData: { matches: [] },
        challengerCurrentTournamentsScoreData: { matches: [] }
    };
    window.app = {
        BackboneEnabled: false,
        BackboneUtil: null,
        Views: {},
        Extensions: {},
        Router: null,
        Analytics: new GoogleAnalytics(),
        MainNavigation: null,
        FilteredModules: false,
        OverrideTransition: false,
        ModalContainerCookie: 'atpModalContainer',
        AutoPlayCount: 0,
        Video: {
            PlaylistScroller: null,
            StickyVideo: null
        },
        init: function () {
            void 0;

            this.instance = new app.Views.App();
            if (location.port === "4000" || typeof history.pushState === "undefined" || isMobile) {
                app.BackboneEnabled = false;
                return false;
            }
            var landingPage = document.querySelector('#mainContainer').dataset.page;
            if (landingPage.includes('video')) {
                app.BackboneEnabled = true;
            }
            return Backbone.history.start({
                pushState: true,
                silent: true
            });
        }
    };
    void 0;
    new Global();
    if (location.port === "4000" || typeof history.pushState === "undefined" || isMobile) {
        app.BackboneEnabled = false;
    }
    return require(["router", "util/googleAnalytics", "views/app", "views/default/view", "util/backboneUtil"], function (Router, GoogleAnalytics, AppView, DefaultAction, BackboneUtil) {
        void 0;
        app.Video.PlaylistScroller = null;
        app.Video.StickyVideo = null;
        app.Router = Router;
        app.Views.App = AppView;
        app.Views.DefaultAction = DefaultAction;
        $(function () {
            window.app.Analytics = new GoogleAnalytics();
            window.app.init();
            window.app.BackboneUtil = BackboneUtil.get();
            return window.app.BackboneUtil.initializeEvents($('body'));
        });
    });
});
