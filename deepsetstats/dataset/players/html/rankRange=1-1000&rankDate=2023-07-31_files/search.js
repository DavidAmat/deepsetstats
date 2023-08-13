define(["jquery", "util/util", "jquery.mobile.events"], function($, Util) {
  var Search;
  return Search = (function() {
    function Search(options1) {
      this.options = options1;
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
      this.delegateEvents();
      Util.placeholderFix();
    }

    Search.prototype.defaults = {
      html: "html",
      body: "body",
      siteSearch: "#siteSearch",
      controlSearch: "#controlSearch",
      closeSearch: "#closeSearch",
      wrapper: "body > .wrapper",
      clearSearch: "#clearSearch",
      searchInput: "#siteSearch input.search",
      predictiveResults: "#predictiveResults",
      searchTermKey: "searchTerm",
      tournamentsUrl: "/-/ajax/PredictiveContentSearch/GetTournamentResults/",
      playersUrl: "/-/ajax/PredictiveContentSearch/GetPlayerResults/",
      tournamentsWrapper: "#tournamentsWrapper",
      playersWrapper: "#playersWrapper",
      tournamentsResults: "#tournamentListing",
      playersResults: "#playerListing",
      isMobile: $("body").hasClass("is-mobile"),
      isTablet: $("body").hasClass("breakpoint-768"),
      analytics: {
        gaCategory: "Main Navigation",
        gaAction: "Click",
        gaSLabel: "Search"
      },
      profilePhrase: "Profile",
      newsPhrase: "News",
      videosPhrase: "Videos"
    };

    Search.prototype.delegateEvents = function() {
      var self;
      self = this;
      this.options.$controlSearch.on('click', (function(_this) {
        return function(event) {
          var $label;
          $label = _this.options.$controlSearch.find('.atp-search-label');
          event.preventDefault();
          event.stopPropagation();
          if (_this.options.$html.hasClass("search-active")) {
            _this.options.$html.removeClass("search-active");
            if (_this.options.isMobile || _this.options.isTablet) {
              return _this.scrollBackOffset();
            }
          } else {
            //window.app.Analytics.trackEvent(self.options.analytics.gaCategory, self.options.analytics.gaAction, self.options.analytics.gaLabel);
            if (_this.options.isMobile || _this.options.isTablet) {
              _this.scrollOffset = $(window).scrollTop();
            }
            _this.options.$html.addClass("search-active");
            if (!_this.options.isMobile) {
              _this.options.$searchInput.focus();
            }
            return Util.modalOpenFixScroll();
          }
        };
      })(this));
      this.options.$closeSearch.on('click', (function(_this) {
        return function(event) {
          _this.options.$html.removeClass("search-active");
          _this.options.$searchInput.val("");
          _this.options.$predictiveResults.hide();
          if (_this.options.isMobile || _this.options.isTablet) {
            return _this.scrollBackOffset();
          }
        };
      })(this));
      this.options.$clearSearch.on('click', (function(_this) {
        return function(event) {
          return _this.options.$searchInput.val("");
        };
      })(this));
      this.options.$searchInput.on('keyup', (function(_this) {
          return function (event){
              void 0;
              if (event.target.value.length >= 3) {
                  _this.ajaxSearch({
                      url : _this.options.tournamentsUrl,
                      query : event.target.value,
                      renderTo : _this.options.$tournamentsWrapper,
                      type : "tournaments",
                      dataType : "json"
                  });
                  return _this.ajaxSearch({
                      url : _this.options.playersUrl,
                      query : event.target.value,
                      renderTo : _this.options.$playersWrapper,
                      type : "players",
                      dataType : "json"
                  });
              }
          };
      })(this));
      this.options.$siteSearch.on("submit", function(event) {
        $(event.currentTarget).find("input").blur();
        return false;
      });
    };

    Search.prototype.additionalSelectors = function() {
      this.options.$html = $(this.options.html);
      this.options.$body = $(this.options.body);
      this.options.$siteSearch = $(this.options.siteSearch);
      this.options.$controlSearch = $(this.options.controlSearch);
      this.options.$closeSearch = $(this.options.closeSearch);
      this.options.$wrapper = $(this.options.wrapper);
      this.options.$clearSearch = $(this.options.clearSearch);
      this.options.$searchInput = $(this.options.searchInput);
      this.options.$predictiveResults = $(this.options.predictiveResults);
      this.options.$tournamentsWrapper = $(this.options.tournamentsWrapper);
      this.options.$playersWrapper = $(this.options.playersWrapper);
      this.options.$tournamentsResults = $(this.options.tournamentsResults);
      return this.options.$playersResults = $(this.options.playersResults);
    };

    Search.prototype.ajax = new Array();

    Search.prototype.ajaxSearch = function(options) {
      var _self, ref;
      _self = this;
      if (!options.query) {
        this.options.$predictiveResults.hide();
      } else {
        this.options.$predictiveResults.show();
      }
      if ((ref = this.ajax[options.type]) != null) {
        ref.abort();
      }
      this.ajax[options.type] = $.ajax({
        url: options.url + options.query,
        type: "GET",
        dataType: options.dataType
      });
      return this.ajax[options.type].done(function(data) {
        if (options.type === "players") {
            if (data.items.length && options.query) {
                
                let players = data.items;
                let playerList = [];
                players.forEach(function (el) {
                    const nameByPath = el.Url.split("/")[3];
                    if (nameByPath.indexOf("-") !== -1 && nameByPath.indexOf("unknown") === -1) {
                        playerList.push(el);
                    }
                });
                options.renderTo.html(_self.playersTemplate(playerList));
            return _self.options.$playersResults.show();
          } else {
            options.renderTo.html("");
            return _self.options.$playersResults.hide();
          }
        } else if (options.type === "tournaments") {
          if (data.items.length && options.query) {
            options.renderTo.html(_self.tournamentTemplate(data.items));
            return _self.options.$tournamentsResults.show();
          } else {
            options.renderTo.html("");
            return _self.options.$tournamentsResults.hide();
          }
        }
      });
    };

    Search.prototype.scrollBackOffset = function() {
      return $(window).scrollTop(this.scrollOffset);
    };

    Search.prototype.resultImage = function(item) {
      return "<div class=\"predictive-result-image\">\n	<a href=\"" + item.Url + "\"><img onerror=\"this.remove()\" alt=\"\" src=\"" + item.ImageUrl + "\"></a>\n</div>";
    };

    Search.prototype.resultButton = function(item) {
      if (this.options.isMobile) {
        return "				";
      } else {
        return "<div class=\"predictive-result-buttons\">\n	<div class=\"button-row-holder\">\n		<div class=\"button-row\"><a href=\"" + item.ProfileUrl + "\" class=\"button-border\">" + this.options.profilePhrase + "</a><a href=\"" + item.NewsUrl + "\" class=\"button-border\">" + this.options.newsPhrase + "</a><a href=\"" + item.VideosUrl + "\" class=\"button-border\">" + this.options.videosPhrase + "</a></div>\n	</div>\n</div>";
      }
    };

    Search.prototype.playersTemplate = function(data) {
      var _template, i, item, len;
      _template = "";
      for (i = 0, len = data.length; i < len; i++) {
        item = data[i];
        _template += "<div class=\"predictive-result\">\n	" + (this.resultImage(item)) + "\n	<div class=\"predictive-result-title\"><a href=\"" + item.Url + "\">" + item.FirstName + " " + item.LastName + "</a></div>\n	" + (this.resultButton(item)) + "\n</div>";
      }
      return _template;
    };

    Search.prototype.tournamentTemplate = function(data) {
      var _template, i, item, len;
      _template = "";
      for (i = 0, len = data.length; i < len; i++) {
        item = data[i];
        _template += "<div class=\"predictive-result\">\n	" + (this.resultImage(item)) + "\n	<div class=\"predictive-result-title\"><a href=\"" + item.Url + "\">" + item.SponsorTitle + "</a><span class=\"predictive-result-sub-title\"><span class=\"tourney-location\">" + item.CityLocation + ", " + item.CountryLocation + "</span></span></div>\n	" + (this.resultButton(item)) + "\n</div>";
      }
      return _template;
    };

    return Search;

  })();
});
