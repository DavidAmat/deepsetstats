var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(["jquery", "util/util"], function($, Util) {
  var MoreLink;
  return MoreLink = (function () {
      function MoreLink(options) {
          void 0;
          if (document.querySelector('html > body').classList.contains('is-mobile')) {
              return;
          }

      this.options = options;
      this.removeHoverClassEvent = bind(this.removeHoverClassEvent, this);
      this.touchDropdownEvent = bind(this.touchDropdownEvent, this);
      this.moreLinkEvent = bind(this.moreLinkEvent, this);
      this.options = $.extend({}, this.defaults, this.options);
      this.additionalSelectors();
     
      this.delegateEvents();
      this.calcNavWidth();
      this.moreLinkEvent();
      var resizeTrigger;
          var self = this;
          window.addEventListener('resize', function () {
              clearTimeout(resizeTrigger);
              resizeTrigger = setTimeout(function () {
                  self.calcNavWidth();
              }, 100)
          
      });
    }

    MoreLink.prototype.defaults = {
      element: "#pageHeader",
      navWrap: ".sub-navigation-wrap:eq(0)",
      navList: ".sub-navigation:eq(0)",
      navItems: "li",
      hoverClass: "atp-touch-hover",
      wrapperInner: ".page-header-holder:eq(0)",
      moreText: "More",
      moreWidth: 98,
      wrapperInnerPadding: 31
    };

    MoreLink.prototype.additionalSelectors = function() {
      this.options.$element = $(this.options.element);
      this.options.$navWrap = this.options.$element.find(this.options.navWrap);
      this.options.$navList = this.options.$element.find(this.options.navList);
      this.options.$navItems = this.options.$element.find(this.options.navItems);
      this.options.$wrapperInner = this.options.$element.find(this.options.wrapperInner);
      this.options.$window = $(window);
      this.options.$body = $("body");
      return this.options.$html = $("html");
    };

    MoreLink.prototype.delegateEvents = function() {
      var clickEvent, resizeEvent;
      resizeEvent = "resize." + (this.options.element.substring(1));
      clickEvent = "click." + (this.options.element.substring(1));
      this.options.$window.off(resizeEvent);
      this.options.$window.on(resizeEvent, this.moreLinkEvent);
      $(document).off(clickEvent);
      $(document).on(clickEvent, ".page-header-more-link > a", this.touchDropdownEvent);
      this.moreLinkEvent();
      this.additionalSelectors();
      return this.moreLinkEvent();
    };


    MoreLink.prototype.calcNavWidth = function () {
        void 0;
        if (document.querySelector('.page-title') === null) {
            return
        }
        const filterControl = document.querySelector('#filterControl');
        const filterSearch = document.querySelector('.filter-holder.exposed');
        let filterSearchWidth = 0;
        let filterBtnWidth = 0;
        if (document.querySelector('#pageHeader').classList.contains('has-filter-toggle')) {
            void 0;
             filterBtnWidth = 215;
        }

        if (filterSearch && (document.querySelector('#pageHeader').classList.contains('has-filter-toggle') !== true)) {
            void 0;
            filterSearchWidth = filterSearch.offsetWidth + 15;
        }
        
        const mainContainerWidth = document.querySelector('.page-header-holder').offsetWidth;
        const pageTitleWidth = document.querySelector('.page-title').offsetWidth + 10;
        const subNavWidth = document.querySelector('.sub-navigation-wrap');

        if (subNavWidth != null) {
            subNavWidth.style.width = mainContainerWidth - (pageTitleWidth + filterBtnWidth + filterSearchWidth) + "px";
        }
        
        const subNavHolder = document.querySelector('.sub-navigation');
        const fullSubNavHolder = document.querySelector('.page-header-holder');

        const subNavMoreLinksTemplate = document.querySelector('#pageHeaderMoreLinks');
        if (subNavMoreLinksTemplate != null) {
            const subNavMoreLinksTemplate = document.querySelector('#pageHeaderMoreLinks').innerHTML;
            const subNavMoreLink = document.querySelector('.sub-navigation .page-header-more-link');
            const subNavHolderRightPos = subNavHolder.getBoundingClientRect().right;
            const fullSubNavHolderRightPos = fullSubNavHolder.getBoundingClientRect().right;
            let sectionLinks = [].slice.call(document.querySelectorAll('.sub-navigation li[id*=SectionLink]'));
            for (link in sectionLinks) {
                sectionLinks[link].classList.remove('overflow-start');
                if (subNavMoreLink) {
                    subNavMoreLink.remove();
                }
                if(sectionLinks[link].innerText.length==0){
                  continue;
                }
                var widthToUse = $(fullSubNavHolder).find(".dropdown-layout-wrapper").length != 0
                ? fullSubNavHolderRightPos - $(fullSubNavHolder).find(".dropdown-layout-wrapper").width()
                : fullSubNavHolderRightPos ;
                if (sectionLinks[link].getBoundingClientRect().right > widthToUse) {
                   
                    var overflowLink = document.querySelector('#' + sectionLinks[link].id).previousElementSibling;
                    var morelinkStartPoint = "#" + overflowLink.id.replace("SectionLink", "SectionMoreLink");
                    overflowLink.classList.add("overflow-start");
                    subNavHolder.insertAdjacentHTML('beforeend', subNavMoreLinksTemplate);
                    document.querySelector(morelinkStartPoint).classList.add("start-morelinks");
                    break;
                }
            }
        }
    };

    MoreLink.prototype.moreLinkEvent = function(event) {
      //var $moreLink;
      //if (!this.options.$body.hasClass("is-mobile")) {
      //  this.additionalSelectors();
      //  $moreLink = this.options.$navList.find(".page-header-more-link");
      //  this.options.$navList.append($moreLink.find("ul").html());
      //  $moreLink.remove();
      //  this.calcNavWidth();
      //  return this.alignMenu();
      //}
    };

    MoreLink.prototype.alignMenu = function() {
      //var _childrenWidth, _menuHtml, _menuWidth, _width;
      //this.additionalSelectors();
      //_width = 1;
      //_menuWidth = this.options.$navWrap.width();
      //console.log('_menuWidth: ' + _menuWidth);
      //_menuHtml = "";
      //_childrenWidth = 1;
      //console.log('_childrenWidth: ' + _childrenWidth);
      //$.each(this.options.$navList.children(), function() {
      //  return _childrenWidth += $(this).outerWidth(true);
      //});
      //if (_childrenWidth > _menuWidth) {
      //  _menuWidth -= this.options.moreWidth;
      //}
      //$.each(this.options.$navList.children(), function(index, value) {
      //  _width += $(this).outerWidth(true);
      //  if (_width > _menuWidth) {
      //    _menuHtml += $("<div>").append($(this).clone()).html();
      //    $(this).remove();
      //  }
      //});
      //if (_menuHtml.length) {
      //    console.log(_menuHtml.length); 
      //  this.options.$navList.append("<li class='page-header-more-link'><a>" + this.options.moreText + "</a><ul class='page-header-sub-nav'>" + _menuHtml + "</ul></li>");
      //}
      //if ((this.options.$element.find(".page-header-more-link").length)) {
      //  return this.options.moreWidth = this.options.$element.find(".page-header-more-link").outerWidth(true);
      //}
    };

    MoreLink.prototype.touchDropdownEvent = function (event) {
        void 0;
      var $currentItem, $currentLink, _url;
      event.preventDefault();
      $currentLink = $(event.currentTarget);
      $currentItem = $currentLink.parent();
      _url = $currentLink.attr("href");
      if (this.options.$html.hasClass("device-using-touch") || Util.isIpad()) {
        if ($currentItem.hasClass(this.options.hoverClass)) {

        } else {
          $currentItem.siblings().removeClass(this.options.hoverClass);
          $currentItem.addClass(this.options.hoverClass);
        }
      }
      return true;
    };

    MoreLink.prototype.removeHoverClassEvent = function(event) {
      //var $current, $currentTarget;
      //$current = $(event.target);
      //$currentTarget = $(event.currentTarget);
      //if (!$current.closest("." + this.options.hoverClass).length || $current.hasClass(this.options.hoverClass)) {
      //  return $("." + this.options.hoverClass).removeClass(this.options.hoverClass);
      //}
    };

    return MoreLink;

  })();
});
