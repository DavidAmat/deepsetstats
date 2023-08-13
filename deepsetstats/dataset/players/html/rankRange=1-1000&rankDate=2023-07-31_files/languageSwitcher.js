define(["jquery", "jquery.mobile.events"], function($) {
  var LanguageSwitcher;
  return LanguageSwitcher = (function() {
    function LanguageSwitcher(options) {
      this.options = options;
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
      this.delegateEvents();
    }

    LanguageSwitcher.prototype.defaults = {
      languageLinkClass: ".languageLink",
      elementId: ""
    };

    LanguageSwitcher.prototype.additionalSelectors = function() {
      return this.options.$el = $(this.options.elementId);
    };

    LanguageSwitcher.prototype.delegateEvents = function() {
      var $languageLinks, _self;
      _self = this;
      $languageLinks = this.options.$el.find(this.options.languageLinkClass);
      return $languageLinks.on("click", this.languageSwitch);
    };

    LanguageSwitcher.prototype.languageSwitch = function() {
      var currentPath, newLanguage, newPath, pathSegments;
      currentPath = window.location.pathname;
      newLanguage = $(this).data("language-code");
      if (currentPath !== "") {
        pathSegments = currentPath.split("/");
        pathSegments[1] = newLanguage;
        newPath = pathSegments.join("/");
      } else {
        newPath = newLanguage + "/";
      }
      return window.location.href = newPath;
    };

    return LanguageSwitcher;

  })();
});
