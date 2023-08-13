define([
    "vue",
    "util/signalRController",
    "modules/scores/liveScoresUpdater",
    "axios",
    "modules/google/adSenseRightRail"
], function (Vue, SignalR, LiveScoresUpdater, axios, AdSense) {
    var RightRail;
    return (RightRail = (function () {
        function RightRail(options) {
            this.liveScoresUpdater = new LiveScoresUpdater();
            this.signalR = SignalR.getInstance();
            this.EventListeners();
            this.tourVm = this.Vues();
            this.newsVm = this.LatestNewsVues();
            this.latestNewsMediaData = null;
            this.tourLevelTournament = "tour";
            this.challengerLevelTournament = "challenger";

            this.defaultTournamentLevel =  this.tourLevelTournament;

            if (options.railDefaultTab.toLowerCase() === "railchallengerscorestab") {
                this.defaultTournamentLevel = this.challengerLevelTournament;
            }

            if (options.railDefaultTab.toLowerCase() === "railchallengerscorestab"
                || options.railDefaultTab.toLowerCase() === "railscorescontainer") {
                this.checkGlobalScores();
            }
            if (options.railDefaultTab.toLowerCase() === "raillatestcontainer") {
                this.getLatestMediaData();
            }

        }

        RightRail.prototype.checkGlobalScores = function () {
            const self = this;
            self.liveScoresUpdater.pollScores(self.defaultTournamentLevel, function () {
                const tournament = self.liveScoresUpdater.getScoresGlobalObjectByTournamentLevel(self.defaultTournamentLevel);

                if (typeof window.GLOBAL_SCORES === "undefined" || tournament.tournaments.length === 0) {
                    self.tourVm.tournaments = {};
                    setTimeout(function () {
                        self.checkGlobalScores(self.defaultTournamentLevel);
                    }, 10000);
                } else {
                    if (self.defaultTournamentLevel.toLowerCase() === "challenger") {
                        self.signalR.getOnlyChallengerScores();
                        self.tourVm.tournaments = tournament.tournaments;
                    }
                    if (self.defaultTournamentLevel.toLowerCase() === "tour") {
                        self.signalR.getOnlyTourScores();
                        self.tourVm.tournaments = tournament.tournaments;
                    }
                }
            });
        };


        RightRail.prototype.getLatestMediaData = function () {
            const newsTab = document.querySelector("#railNewsTab");
            const category = newsTab.classList.contains("current") ? "news" : "videos";

            const pathname = window.location.pathname;
            const language = pathname.length > 0 ? window.location.pathname.substring(0, 3) : "/en";
            const url = window.location.origin + language + "/-/ajax/News/LatestRightRail/" + category;
            axios.get(url)
                .then(response => {
                    this.latestNewsMediaData = response.data;

                    this.newsVm.updatedNews = this.latestNewsMediaData;
                    this.newsVm.category = category;
                })
                .catch(error => {
                    void 0
                })
        };
        RightRail.prototype.updateDefaultTournamentLevel = function (level){
            const self = this;
            self.defaultTournamentLevel = level;
        }

        RightRail.prototype.EventListeners = function () {
            const self = this;
            const scoresTab = document.querySelector("#railScoresTab");
            const tourScoresTab = document.querySelector("#railTourScoresTab");
            const challengerScoresTab = document.querySelector("#railChallengerScoresTab");

            const latestTab = document.querySelector("#railLatestTab");
            const newsTab = document.querySelector("#railNewsTab");
            const videoTab = document.querySelector("#railVideoTab");

            const toggleRailTabs = function (el) {

                if (el.currentTarget.classList.contains("current")) {
                    return;
                }

                if (el.currentTarget.id.toLowerCase() === "railscorestab") {
                    const eventLevel = el.currentTarget.dataset.level;
                    if(typeof(eventLevel)!='undefined'){
                        self.updateDefaultTournamentLevel(eventLevel);
                    }

                    self.checkGlobalScores();
                }

                el.currentTarget.classList.toggle("current");
                const container = el.currentTarget.dataset.container;
                document.querySelector(container).classList.toggle("current");

                const tabs = [scoresTab, latestTab];
                tabs.forEach(function (innerEl) {
                    if (innerEl.id !== el.currentTarget.id) {
                        innerEl.classList.remove("current");
                        const container = innerEl.dataset.container;
                        document.querySelector(container).classList.remove("current");
                    }
                });

                if (el.currentTarget.id.toLowerCase() === "raillatesttab") {
                    self.getLatestMediaData();
                }
            };


            const toggleExpandedTabs = function (el) {

                if (
                    !document.querySelector("#railFixer").classList.contains("expand")
                ) {
                    document.querySelector("#railFixer").classList.add("expand");
                    if (!el.currentTarget.classList.contains("current")) {
                        toggleRailTabs(el);
                    }
                } else {
                    if (el.currentTarget.classList.contains("current")) {
                        document.querySelector("#railFixer").classList.remove("expand");
                    } else {
                        toggleRailTabs(el);
                    }
                }
            };

            const toggleTourChallengerScores = function (el) {
                if (el.currentTarget.classList.contains("current")) {
                    return;
                }

                const eventLevel = el.currentTarget.dataset.level;
                if(typeof(eventLevel)!='undefined'){
                    self.updateDefaultTournamentLevel(eventLevel);
                }

                const tabs = [tourScoresTab, challengerScoresTab];
                tabs.forEach(function (el) {
                    el.classList.toggle("current");
                });
            };
            const toggleNewsVideos = function (el) {
                if (el.currentTarget.classList.contains("current")) {
                    return;
                }
                const tabs = [newsTab, videoTab];
                tabs.forEach(function (el) {
                    el.classList.toggle("current");
                });

                self.getLatestMediaData();
            };


            scoresTab.addEventListener("click", function (el) {
                if (el.currentTarget.offsetWidth === 50) {
                    toggleExpandedTabs(el);
                } else {
                    toggleRailTabs(el);
                }
            });
            tourScoresTab.addEventListener("click", function (el) {

                toggleTourChallengerScores(el);
                self.checkGlobalScores();
            });
            challengerScoresTab.addEventListener("click", function (el) {

                toggleTourChallengerScores(el);
                self.checkGlobalScores();
            });

            latestTab.addEventListener("click", function (el) {

                if (el.currentTarget.offsetWidth === 50) {
                    toggleExpandedTabs(el);
                } else {
                    toggleRailTabs(el);
                }
            });
            newsTab.addEventListener("click", function (el) {
                toggleNewsVideos(el);
            });
            videoTab.addEventListener("click", function (el) {
                toggleNewsVideos(el);
            });

        };


        RightRail.prototype.Vues = function () {
            const self = this;
            const tournamentComponent = Vue.component("tournaments", {
                props: {
                    tournaments: {},
                    isTour: String
                },
                template: document.querySelector("#tournamentTemplate").innerHTML,
                components: {
                    "ads": AdSense
                }
            });

            return new Vue({
                el: "#railScoresContainerData",
                data: function () {
                    return {
                        tournamentData: {}
                    };
                },
                computed: {
                    tournaments: {
                        get: function () {
                            return this.tournamentData;
                        },
                        set: function (val) {
                            this.tournamentData = val
                        }
                    }
                },
                components: {
                    "tournamentComponent": tournamentComponent
                },
            });
        };

        RightRail.prototype.LatestNewsVues = function () {

            return new Vue({
                el: "#media-wrapper",
                data: function () {
                    return {
                        news: [],
                        tab: "news"
                    }
                },
                computed: {
                    updatedNews: {
                        get: function () {
                            document.querySelector("#listing-container").classList.remove("hidden");
                            return this.news;
                        },
                        set: function (val) {
                            this.news = val
                        }
                    },
                    category: {
                        get: function () {
                            return this.tab;
                        },
                        set: function (val) {
                            this.tab = val
                        }
                    }
                },
                components: {
                    "ads": AdSense
                },
            });
        };

        return RightRail;
    })());
});
