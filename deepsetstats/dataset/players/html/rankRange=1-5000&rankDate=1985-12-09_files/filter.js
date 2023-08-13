var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

define(["backbone", "underscore", "jquery", "util/util", "jquery.migrate", "jquery.mobile.events"], function(Backbone, _, $, Util) {
  var Filter;
  return Filter = (function() {
    function Filter(options1) {
      this.options = options1;
      this.options = $.extend(true, {}, this.defaults, this.options);
      this.additionalSelectors();
      this.delegateEvents();
      this.setDefaultDropdownSelection();
      this.enableInputs();
      void 0;
      if (this.options.filterExpanded) {
          void 0;
          document.querySelector('#header').classList.add('filter-expand');
      }

      //sub nav with filter e.g. tournament or player page -> needs more space
      if(this.options.isSubNavFilter){
        document.querySelector('#pageHeader').classList.add('has-filter-toggle');
      }
    }

    Filter.prototype.defaults = {
      element: "#filterHolder .page-header-holder",
      dataValueEmptyAttr: "data-value-empty",
      dataRequiredAttr: "data-filter-required",
      filterControl: "#filterControl",
      filterHolder: "#filterHolder",
      filterSubmit: "#filterSubmit",
      filterSubmitUrl: null,
      filterSubmitUrlType: null,
      filterReset: "#filterReset",
      wildcardTokens: null,
      autofillDropdown: ".autofillDropdown",
      autofillHolder: ".autofillHolder",
      autoCompleteInput: ".auto-complete-input",
      autoSubmitDropdown: "auto-submit-dropdown",
      forceAutoSubmitDropdown: false,
      tournamentDropdown: "#tournamentDropdown",
      yearDropdown: "#yearDropdown",
      playerSearchUrl: "-/ajax/playersearch/playernamesearch/",
      dropdownList: "#filterHolder .dropdown",
      filterLabelList: ".search-filter-label",
      searchResultsUrl: "/search-results?searchTerm=",
      $document: $(document),
      pageUrl: "",
      dropdownExpanded: false,
      filterExpanded: false,
      singleFilter: false,
      filteredModules: false,
      filterDepedencyGraph: null,
      overrideTransition: false,
      isSubNavFilter: true,
      analytics: {
        gaCategory: "Analytics Category",
        gaClickAction: "Click",
        gaSelectAction: "Select",
        gaToggleAction: "Toggle",
        gaSubmitLabel: "Go",
        gaResetLabel: "Restore Defaults",
        gaHideLabel: "Hide",
        gaShowLabel: "Show",
        gaLabelSearch: "Search",
        gaLabelGo: "Go",
        gaResultLabel: "Result",
        gaClickFilterLabel: "Click Filter"
      }
    };

    Filter.prototype.additionalSelectors = function() {
      this.options.$element = $(this.options.element);
      this.options.$filterControl = $(this.options.filterControl);
      this.options.$filterHolder = $(this.options.filterHolder);
      this.options.$filterSubmit = $(this.options.filterSubmit);
      this.options.$filterReset = $(this.options.filterReset);
      this.options.$autofillDropdown = $(this.options.autofillDropdown);
      this.options.$autofillHolder = $(this.options.autofillHolder);
      this.options.$autoCompleteInput = $(this.options.autoCompleteInput);
      this.options.$tournamentDropdown = $(this.options.tournamentDropdown);
      this.options.$yearDropdown = $(this.options.yearDropdown);
      this.options.$dropdownList = $(this.options.dropdownList);
      return this.options.$filterLabelList = $(this.options.filterLabelList);
    };

    Filter.prototype.delegateEvents = function() {
      var self;
      self = this;
      this.options.$filterControl.on("click", function() {
        var _this, hideText, showText;
        _this = $(this);
        hideText = _this.data("hide-text");
        showText = _this.data("show-text");
        if (self.options.filterExpanded === false) {
            self.options.$filterHolder.addClass("expand");
            document.querySelector("#header").classList.add("filter-expand");
          _this.find(".filter-label").text(hideText);
          window.app.Analytics.trackEvent(self.options.analytics.gaCategory, self.options.analytics.gaToggleAction, self.options.analytics.gaShowLabel);
          return self.options.filterExpanded = true;
        } else {
            self.options.$filterHolder.removeClass("expand");
            document.querySelector("#header").classList.remove("filter-expand");
          _this.find(".filter-label").text(showText);
          window.app.Analytics.trackEvent(self.options.analytics.gaCategory, self.options.analytics.gaToggleAction, self.options.analytics.gaHideLabel);
          return self.options.filterExpanded = false;
        }
      });
      this.options.$document.off("click");
      this.options.$document.on("click", function(event) {
        if (self.options.dropdownExpanded && $(event.target).is(":not(.dropdown-label)")) {
          if (!$(event.target).closest('[multiselectable]').length) {
            self.options.$filterHolder.find(".dropdown-holder.expand").removeClass("expand");
            self.options.dropdownExpanded = false;
          }
        }
        return true;
      });
      $(".dropdown-holder").on("click", function(event) {
        var $this, _class;
        _class = "expand";
        $this = $(this);
        if (!$(event.target).closest(".dropdown").length && $(event.target).hasClass(_class) && !$(event.target).hasClass("player-input")) {
          $(".dropdown-holder").removeClass(_class);
          self.options.dropdownExpanded = false;
        }
        return true;
      });
      this.options.$filterHolder.on("click", ".dropdown-label:not([disabled])", function(event) {
        var _dropdownExpanded, _helperBool, _parent;
        event.stopPropagation();
        _parent = $(this).closest(".dropdown-holder");
        _helperBool = false;
        if (!_parent.hasClass("player-input")) {
          $(".dropdown-holder").removeClass("expand");
          if (!_parent.hasClass("disabled") && _parent.hasClass("expand")) {
            _parent.removeClass("expand").siblings().removeClass("expand");
            _dropdownExpanded = false;
          } else {
            _helperBool = true;
          }
        } else {
          _helperBool = true;
        }
        if (_helperBool) {
          if (!_parent.hasClass("disabled") && !_parent.hasClass("expand")) {
            _parent.addClass("expand").siblings().removeClass("expand");
            return self.options.dropdownExpanded = true;
          }
        }
      });
      this.options.$filterHolder.on("click", "ul:not([multiselectable]) li:not([data-modal-open], .current), ul[multiselectable] li:not([data-modal-open])", function(event) {
        event.stopPropagation();
        self.valueReplace($(this));
        if ($(this).parent().data("value")) {
          self.filterTitle = $(this).parent().data("value");
        }
        if (!$(this).parent().data("value")) {
          self.filterTitle = $.trim($(this).siblings(":first-child").text());
        }
        self.checkAndUpdateRequiredFieldStatus.call(self);
        if ($(this).closest(".dropdown").hasClass(self.options.autoSubmitDropdown)) {
          self.submitFilter(self.options.$filterHolder);
        }
      });
      this.options.$filterHolder.on("change", "select", function(event) {
        var $this, selOption;
        event.stopPropagation();
        $this = $(this);
        self.valueReplaceMobile($this);
        if (self.options.forceAutoSubmitDropdown) {
          $this.children().removeClass("current");
          selOption = $this.find("option[value='" + $this.val() + "']");
          selOption.addClass("current");
          return self.submitFilter(self.options.$filterHolder);
        }
      });
      this.options.$filterReset.on("click", function() {
        window.app.Analytics.trackEvent(self.options.analytics.gaCategory, self.options.analytics.gaClickAction, self.options.analytics.gaResetLabel);
        return self.resetFilter(self.options.$filterHolder);
      });
      this.options.$element.on("focus", this.options.autoCompleteInput + ":not([disabled])", function(event) {
        $(event.target).closest(".dropdown-holder").siblings(".dropdown-holder").removeClass("expand");
        return window.app.Analytics.trackEvent(self.options.analytics.gaCategory, self.options.analytics.gaClickAction, self.options.analytics.gaLabelSearch);
      });
      this.options.$autoCompleteInput.on("keyup", function(event) {
        event.preventDefault();
          if (event.which !== 32 && $.trim(event.target.value) !== "" || event.which !== 8 && $.trim(event.target.value) !== "") {
              if (event.target.value.length >= 3) {
                  return self.autoCompleteUpdate({
                      $element : $(event.target).closest(".dropdown-holder"),
                      query : event.target.value
                  });
              }
          }
      });
      this.options.$autoCompleteInput.keypress(function(event) {
        if (event.which !== 13) {
          return;
        }
        //long enough word to trigger search
        //player input - user needs to select from choices
        if(event.target.value.length < 3 || event.target.id==="playerInput"){
            return;
        }
        return self.navigateToSearchResults();
      });
      this.options.$filterSubmit.on("click", function() {
        return self.submitFilter(self.options.$filterHolder);
      });
      $("#playerInput").focusin(function() {
        if (!$("#filterControl").length) {
          return $("html").addClass("sub-nav-hidden");
        }
      });
      return $("#playerInput").focusout(function() {
        return $("html").removeClass("sub-nav-hidden");
      });
    };

    Filter.prototype.setDefaultDropdownSelection = function() {
      return this.options.$filterHolder.find(".dropdown").each(function() {
        var $dropdown;
        $dropdown = $(this);
        return $dropdown.find(".current").length || $dropdown.find(".dropdown-default-label").first().addClass("current");
      });
    };

    Filter.prototype.navigateToSearchResults = function() {
        var navigateUrl, searchTerm;
        var _self = this;
      searchTerm = this.options.$autoCompleteInput.val();
      navigateUrl = this.options.searchResultsUrl + searchTerm;
      window.app.Analytics.trackEvent(_self.options.analytics.gaCategory, _self.options.analytics.gaClickAction, _self.options.analytics.gaLabelGo + " " + searchTerm);
      return Util.navigateTo(navigateUrl, true);
    };

    Filter.prototype.valueReplace = function(_this) {
      var $dropdownHolder, $dropdownLabel, _label, dependentFilter, dropdownId, graph, i, len, nextDropdown, ref, ref1, results;
      if (_this.parent().attr('multiselectable') !== void 0) {
        this.multipleSelect(_this);
        return false;
      }
      $dropdownHolder = _this.closest(".dropdown-holder");
      _this.addClass("current").siblings().removeClass("current");
      $dropdownLabel = _this.closest(".dropdown-holder").children(".dropdown-label");
      _label = $.trim(_this.text());
      if ($dropdownLabel.is("input")) {
        $dropdownLabel.val(_label);
      } else {
        $dropdownLabel.text(_label);
      }
      $dropdownHolder.removeClass("expand");
      if ($dropdownHolder.data("autofillurl") !== void 0 && $dropdownHolder.data("autofillurl") !== null && $dropdownHolder.data("autofillurl") !== "") {
        nextDropdown = $dropdownHolder.parent().next().find(".dropdown-holder");
        nextDropdown.addClass("disabled");
        this.valueReset(nextDropdown.children(".dropdown"));
        $.ajax({
          url: $dropdownHolder.data("autofillurl") + _this.data('value'),
          type: 'GET',
          context: this,
          converters: {
            "* text": function(result) {
              return $.parseJSON(result);
            }
          },
          success: (function(_this) {
            return function(data) {
              if (data.length) {
                return _this.populateDropdown($dropdownHolder.parent(), data);
              }
            };
          })(this),
          error: (function(_this) {
            return function(xhr, status, error) {
              void 0;
              void 0;
              return void 0;
            };
          })(this)
        });
      }
      dropdownId = _this.closest(".dropdown").attr("id");
      ref1 = (ref = this.options.filterDependencyGraph) != null ? ref : [];
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        graph = ref1[i];
        if (indexOf.call(graph, dropdownId) >= 0) {
          results.push((function() {
            var j, len1, results1;
            results1 = [];
            for (j = 0, len1 = graph.length; j < len1; j++) {
              dependentFilter = graph[j];
              if (dependentFilter !== dropdownId) {
                results1.push(this.valueReset($("#" + dependentFilter)));
              }
            }
            return results1;
          }).call(this));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Filter.prototype.multipleSelect = function(_this) {
      if (_this.hasClass('current')) {
        return _this.removeClass('current');
      } else {
        return _this.addClass('current');
      }
    };

    Filter.prototype.valueReplaceMobile = function(_this) {
      var _selectedOption;
      _selectedOption = _this.find("option:selected").text();
      return _this.prev().html(_selectedOption);
    };

    Filter.prototype.valueReset = function(_this) {
      var $dropdownHolder, $dropdownLabel, _label, _labelText, ref;
      $dropdownHolder = _this.closest(".dropdown-holder");
      _this.children().removeClass("current");
      $dropdownLabel = $dropdownHolder.children(".dropdown-label");
      _label = _this.find("li.dropdown-default-label");
      _labelText = $.trim(((ref = _this.data("force-label")) != null ? ref : '') || (_label != null ? _label.text() : void 0));
      $dropdownLabel.text(_labelText);
      $dropdownHolder.removeClass("expand");
      return ($dropdownHolder.data("autofillurl") == null) || (_label != null ? _label.click() : void 0);
    };

    Filter.prototype.resetFilter = function(_container) {
      var $inputLabel, _self, i, len, ref;
      _self = this;
      _container.find(".dropdown").each(function() {
        var $defaultLabel, $dropdown, $dropdownLabel, $parent;
        $dropdown = $(this);
        $dropdownLabel = $(this).prev();
        if ($dropdownLabel.is("input")) {
          $dropdownLabel.val("");
          $dropdown.empty();
        } else if (!$dropdown.hasClass("keepValue")) {
          _self.valueReset($dropdown);
        }
        if ($dropdown.hasClass("autofillDropdown")) {
          $defaultLabel = $dropdown.find(".dropdown-default-label");
          $parent = $dropdown.closest(".dropdown-holder");
          $parent.addClass("disabled");
          $defaultLabel = $parent.find("li.dropdown-default-label");
          $dropdown.empty();
          $dropdown.append($defaultLabel);
          return (typeof defaultLabel === "undefined" || defaultLabel === null) || $dropdown.append($defaultLabel);
        }
      });
      ref = this.options.$filterLabelList;
      for (i = 0, len = ref.length; i < len; i++) {
        $inputLabel = ref[i];
        $($inputLabel).val("");
      }
      return this.checkAndUpdateRequiredFieldStatus();
    };

    Filter.prototype.populateDropdown = function(currentDropDown, json) {
      var $autofillDropdown, $autofillDropdownHolder, $defaultLabel, $dropdownLabel, dropdownCurrentQueryValue, i, item, j, jElement, k, len, len1, len2;
      $autofillDropdownHolder = currentDropDown.next().find(".dropdown-holder");
      $autofillDropdown = $autofillDropdownHolder.find("ul.dropdown");
      $defaultLabel = $autofillDropdownHolder.find("li.dropdown-default-label");
      $autofillDropdown.empty();
      $autofillDropdown.append($defaultLabel);
      dropdownCurrentQueryValue = this.getCurrentQueryValueForDropdown($autofillDropdown);
      for (i = 0, len = json.length; i < len; i++) {
        item = json[i];
        if (item.Value === dropdownCurrentQueryValue) {
          item.Selected = true;
        }
      }
      if (json.length > 0) {
        for (j = 0, len1 = json.length; j < len1; j++) {
          jElement = json[j];
          this.appendToList($autofillDropdown, jElement);
        }
        $dropdownLabel = $autofillDropdownHolder.find(".dropdown-label");
        for (k = 0, len2 = json.length; k < len2; k++) {
          item = json[k];
          if (item.Selected === true) {
            $dropdownLabel.text(item.Key);
          }
        }
        $autofillDropdownHolder.removeClass("disabled");
      }
      return this.checkAndUpdateRequiredFieldStatus();
    };

    Filter.prototype.appendToList = function(dropdown, item) {
      var attr, val;
      return dropdown.append('<li data-value="' + item.Value + '" ' + ((((item.Selected != null) && item.Selected === true) || '') && ' class="current dropdown-default-label" ') + (((item.DataAttributes != null) || '') && ' ' + ((function() {
        var ref, results;
        ref = item.DataAttributes;
        results = [];
        for (attr in ref) {
          val = ref[attr];
          results.push("data-" + attr + "=\"" + val + "\"");
        }
        return results;
      })()).join(' ')) + '>' + item.Key + '</li>');
    };

    Filter.prototype.appendSingleFilterToList = function(dropdown, item) {
      var attr, val;
      return dropdown.append('<li data-value="' + item.Value + '" ' + ((((item.Selected != null) && item.Selected === true) || '') && ' class="current dropdown-default-label" ') + '><a href=' + (((item.DataAttributes != null) || '') && ' ' + ((function() {
        var ref, results;
        ref = item.DataAttributes;
        results = [];
        for (attr in ref) {
          val = ref[attr];
          results.push("data-" + attr + "=\"" + val + "\"");
        }
        return results;
      })()).join(' ')) + '>' + item.Key + '</a></li>');
    };

    Filter.prototype.getCurrentQueryValueForDropdown = function(dropdown) {
      var i, len, mappedDropdown, ref, splitFilterUrl, splitLocation, tokenIndex, wildcardDropdown, wildcardDropdowns;
      if (this.options.filterSubmitUrlType === "wildcard") {
        wildcardDropdowns = {};
        ref = this.options.wildcardTokens;
        for (i = 0, len = ref.length; i < len; i++) {
          wildcardDropdown = ref[i];
          if (wildcardDropdown.attribute == null) {
            wildcardDropdowns[wildcardDropdown.dropdown] = wildcardDropdown;
          }
        }
        mappedDropdown = wildcardDropdowns[dropdown.attr("id")];
        if (mappedDropdown != null) {
          splitLocation = window.location.pathname.split("/");
          splitFilterUrl = this.options.filterSubmitUrl.split("/");
          tokenIndex = splitFilterUrl.indexOf(mappedDropdown.token);
          if (tokenIndex !== -1) {
            return splitLocation[tokenIndex];
          }
        }
      }
    };

    Filter.prototype.updateQueryStringParameter = function(uri, key, value) {
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

    Filter.prototype.checkAndUpdateRequiredFieldStatus = function() {
      var requiredFields, self;
      self = this;
      this.options.$filterHolder.find(".dropdown-holder").removeClass("dropdown-validation-error");
      requiredFields = this.options.$filterHolder.find(".dropdown").filter(function() {
        var $dropdown;
        $dropdown = $(this);
        return ($dropdown.attr(self.options.dataRequiredAttr) != null) && $dropdown.find(".current").length === 0;
      });
      if (requiredFields.length > 0) {
        this.options.$filterSubmit.addClass("disabled");
        requiredFields.each(function() {
          var $holder;
          return $holder = $(this).closest(".dropdown-holder").addClass("dropdown-validation-error");
        });
        return false;
      }
      this.options.$filterSubmit.removeClass("disabled");
      return true;
    };

    Filter.prototype.submitFilter = function() {
      var $currentItem, $dropdownItem, url, urlType;
      if (this.checkAndUpdateRequiredFieldStatus() === false) {
        return;
      }
      if (this.options.singleFilter) {
        $dropdownItem = $(this.options.$dropdownList[0]);
        $currentItem = $dropdownItem.children('.current');
        if ($currentItem.length) {
          url = $dropdownItem.children('.current').attr('data-value');
        } else {
          this.navigateToSearchResults();
          return true;
        }
      } else {
        url = this.options.filterSubmitUrl || this.options.$filterSubmit.data("resulturl");
        urlType = this.options.filterSubmitUrlType || this.options.$filterSubmit.data("urltype");
        if (urlType === "path") {
          url = url + this.buildFilterPath();
        } else if (urlType === "query") {
          url = url + this.buildQueryString();
        } else if (urlType === "wildcard") {
          url = this.buildWildcardPath();
        }
      }
      return Util.navigateTo(url, {
        trigger: true
      }, this.options.filteredModules, "_self", this.options.overrideTransition);
    };

    Filter.prototype.buildFilterPath = function() {
      var _dropdown, _filters, _input, _urlPath, currentSelected, filter, i, len;
      _urlPath = "/";
      _filters = $(this.options.filterHolder + ' div.dropdown-holder');
      for (i = 0, len = _filters.length; i < len; i++) {
        filter = _filters[i];
        filter = $(filter);
        _dropdown = filter.children("ul.dropdown");
        if (_dropdown !== null && _dropdown !== void 0 && _dropdown.length > 0) {
          currentSelected = _dropdown.children(".current");
          if (currentSelected === null || currentSelected === void 0 || currentSelected.length < 1 || currentSelected.data("value") === "all") {
            _urlPath = _urlPath + "all/";
          } else {
            $.each(currentSelected, function() {
              var $this, value;
              $this = $(this);
              value = $this.attr("data-value");
              if ($this.hasClass("dropdown-default-label")) {
                if (value == null) {
                  value = "all";
                }
              }
              return _urlPath = _urlPath + value.trim().replace(/\s/g, "-").toLowerCase() + "/";
            });
          }
        } else {
          _input = filter.children("input");
          if (_input !== null && _input !== void 0 && _input.length > 0 && _input.val() !== "") {
            _urlPath = _urlPath + _input.val().trim().toLowerCase() + "/";
          } else {
            _urlPath = _urlPath + "all/";
          }
        }
      }
      return _urlPath;
    };

    Filter.prototype.buildQueryString = function() {
      var $filter, _currentQueryParams, _dropdown, _filters, _input, _queryIndex, _urlPath, _value, currentSelected, filter, i, j, key, len, len1, param;
      _urlPath = "?";
      _filters = $(this.options.filterHolder + ' div.dropdown-holder');
      _currentQueryParams = location.search.replace("?", "").split("&").map(function(queryParam) {
        var _s;
        _s = queryParam.split("=");
        return {
          key: _s[0],
          value: _s[1],
          found: false
        };
      });
      for (i = 0, len = _filters.length; i < len; i++) {
        filter = _filters[i];
        $filter = $(filter);
        _dropdown = $filter.children("ul.dropdown");
        key = "";
        if (_dropdown !== null && _dropdown !== void 0 && _dropdown.length > 0) {
          key = _dropdown.data("value");
          currentSelected = _dropdown.children(".current");
          if (currentSelected.index() !== -1 && currentSelected !== null && currentSelected !== void 0 && ((currentSelected.attr(this.options.dataValueEmptyAttr)) == null)) {
            _value = currentSelected.data("value");
            if (currentSelected.hasClass("dropdown-default-label")) {
              if (_value == null) {
                _value = "all";
              }
            }
            _urlPath = _urlPath + key + "=" + _value + "&";
          }
        } else {
          _input = $filter.children("input");
          key = _input.data("value");
          if (_input !== null && _input !== void 0 && _input.length > 0 && _input.val() !== "") {
            _urlPath = _urlPath + key + "=" + _input.val().trim().toLowerCase() + "&";
          }
        }
        if (key !== "") {
          _queryIndex = 0;
          while (_queryIndex < _currentQueryParams.length) {
            if (_currentQueryParams[_queryIndex].key === key) {
              _currentQueryParams[_queryIndex].found = true;
            }
            ++_queryIndex;
          }
        }
      }
      for (j = 0, len1 = _currentQueryParams.length; j < len1; j++) {
        param = _currentQueryParams[j];
        if (param.found === false && param.key !== void 0 && param.key !== "") {
          _urlPath = _urlPath + param.key + "=" + param.value + "&";
        }
      }
      _urlPath = _urlPath.substring(0, _urlPath.length - 1);
      return _urlPath;
    };

    Filter.prototype.buildWildcardPath = function() {
      var attr, filter, i, len, ref, ref1, url, value, wildcard;
      url = this.options.filterSubmitUrl;
      ref = this.options.wildcardTokens;
      for (i = 0, len = ref.length; i < len; i++) {
        wildcard = ref[i];
        filter = $(this.options.filterHolder + (" #" + wildcard.dropdown + " > .current"));
        if (filter != null) {
          attr = (ref1 = wildcard.attribute) != null ? ref1 : "data-value";
          value = filter.attr(attr);
          if (value != null) {
            url = url.replace(wildcard.token, value);
          }
        }
      }
      return url;
    };

    Filter.prototype.updateUrlFromDropdown = function(url, $dropdownItem) {
      var $item, $selectedItem, $selectedItemDataValueAttr, dataValue;
      $item = $("#" + $dropdownItem.id);
      dataValue = $item.attr('data-value');
      $selectedItem = $item.children('.current');
      if ($selectedItem.length !== 0) {
        $selectedItemDataValueAttr = $selectedItem.attr('data-value');
        if ($selectedItemDataValueAttr === void 0) {
          $selectedItemDataValueAttr = '';
        }
        if ($selectedItem.length !== 0) {
          url = this.updateQueryStringParameter(url, dataValue, $selectedItemDataValueAttr);
        }
      }
      return url;
    };

    Filter.prototype.updateUrlFromLabel = function(url, $labelItem) {
      var $item, dataValue, labelValue;
      $item = $("#" + $labelItem.id);
      dataValue = $item.attr('data-value');
      labelValue = $item.val();
      if (labelValue !== "" || url.indexOf(dataValue) >= 0) {
        return url = this.updateQueryStringParameter(url, dataValue, labelValue);
      } else {
        return url;
      }
    };

    Filter.prototype.autoCompleteTemplate = function(item) {
      if (this.options.singleFilter) {
        return "<li class='no-padding'>\n	<a href='" + item.Value + "'>" + item.Key + "</a>\n</li>";
      } else {
        return "<li data-value=\"" + item.Value + "\">\n	" + item.Key + "\n</li>";
      }
    };

    Filter.prototype.autoCompleteUpdate = function(options) {
      var ref;
      if ((ref = this.autoCompleteAjax) != null) {
        ref.abort();
        }

      this.autoCompleteAjax = $.ajax({
        type: "GET",
        url: options.$element.data("autocompleteurl") + options.query,
        dataType: "json"
      });
      return this.autoCompleteAjax.done((function(_this) {
          return function (data) {
              let players = data.items;
              let playerList = [];
              players.forEach(function (el) {
                  let nameByPath = el.Value.split("/")[3];

                  if (typeof nameByPath === "undefined") {
                      nameByPath = el.Key.toLowerCase().split(" ");
                      if (nameByPath[0] !== "." && nameByPath[0] !== "unknown") {
                          playerList.push(el);
                      }
                  }
                  else {
                      if (nameByPath.indexOf("-") !== -1 && nameByPath.indexOf("unknown") === -1) {
                          playerList.push(el);
                      }

                  }




              });
          return _this.autoCompleteFilterRender({
            $element: options.$element.find(".auto-complete"),
              results: playerList
          });
        };
      })(this));
    };

    Filter.prototype.autoCompleteFilterRender = function(options) {
      var _template, i, item, len, ref;
      _template = "";
      ref = options.results;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        _template += this.autoCompleteTemplate(item);
      }
      return options.$element.html(_template);
    };

    Filter.prototype.enableInputs = function() {
      var inputs;
      inputs = this.options.$element.find('input');
      return inputs.removeAttr('disabled');
    };

    return Filter;

  })();
});
