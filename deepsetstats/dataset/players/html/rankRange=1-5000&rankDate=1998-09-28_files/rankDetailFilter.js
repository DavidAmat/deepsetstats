var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;


define(["backbone", "underscore", "jquery", "util/util", "modules/page/filter", "jquery.migrate", "jquery.mobile.events"], function(Backbone, _, $, Util, Filter) {
    var RankDetailFilter;
    return RankDetailFilter = (function(superClass) {
        extend(RankDetailFilter, superClass);

        function RankDetailFilter(options) {
            this.options = options;
            this.options = $.extend(true, {}, this.defaults, this.options);
            this.additionalSelectors();
            this.delegateEvents();
        }

        RankDetailFilter.prototype.submitFilter = function() {
            var $dropdownItem, i, len, ref, url;
            url = this.options.filterSubmitUrl;
            ref = this.options.$dropdownList;
            for (i = 0, len = ref.length; i < len; i++) {
                $dropdownItem = ref[i];
                url = this.updateUrlFromDropdown(url, $dropdownItem);
            }
            return Util.navigateTo(url, true);
        };

        RankDetailFilter.prototype.resetFilter = function(_container) {
            window.location = this.options.filterSubmitUrl;
        };

        RankDetailFilter.prototype.updateUrlFromDropdown = function(url, $dropdownItem) {
            var $item, $selectedItem, dataValue;
            $item = $($dropdownItem);
            dataValue = $item.attr('data-value');
            $selectedItem = $item.children('.current');
            if ($selectedItem.length !== 0) {
                url = this.updateQueryStringParameter(url, dataValue, $selectedItem.attr('data-value'));
            }
            return url;
        };

        return RankDetailFilter;

    })(Filter);
});
