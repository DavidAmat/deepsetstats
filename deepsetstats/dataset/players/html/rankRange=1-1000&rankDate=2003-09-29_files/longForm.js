define(["jquery"], function($) {
  var LongForm;
  return LongForm = (function() {
    function LongForm(options) {
      this.options = options;
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
      this.delegateEvents();
      this.openLongForm();
    }

    LongForm.prototype.defaults = {
      element: "#longForm",
      html: "html"
    };

    LongForm.prototype.delegateEvents = function() {};

    LongForm.prototype.openLongForm = function() {
      return this.options.$html.addClass("long-form-on");
    };

    LongForm.prototype.closeLongForm = function() {
      return this.options.$html.removeClass("long-form-on");
    };

    LongForm.prototype.additionalSelectors = function() {
      this.options.$element = $(this.options.element);
      return this.options.$html = $(this.options.html);
    };

    return LongForm;

  })();
});
