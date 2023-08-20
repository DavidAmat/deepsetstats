define(['util/Device'], function(Device) {
    let StickyHeader;
    return StickyHeader = (function() {
        function StickyHeader(options) {
            this.options = options;
            this.delegateEvents();
        }

        StickyHeader.prototype.defaults = {
            headerRowElement: '',
            pageHeaderElement:'',
            headerWidth: '1000',
            stickyHeaderTopPosition: '-180',
            pageHeaderSelector:'#header',
            posFromTopToEnableSticky:'160',
            stickyHeaderTopPositionMobile:'116'
        };

        StickyHeader.prototype.delegateEvents = function() {
            let self = this;

            //we need page header to by fully rendered to get values from Bounding Client Rectungle
            window.addEventListener('load', function() {
                self.options = Object.assign(self.defaults, self.options);
                self.setDefaults();
                self.watchScroll();
            })
        };

        StickyHeader.prototype.setDefaults = function() {
            let self = this;

            self.options.headerRowElement = document.querySelector(self.options.headerRowSelector);
            self.options.pageHeaderElement = document.querySelector(self.options.pageHeaderSelector);

            self.setTopPosToEnableSticky();
            self.setHeaderWidth();
            self.setStickyHeaderTopPosition();
        };

        StickyHeader.prototype.setHeaderWidth = function(){
            let self = this;
            if (typeof self.options.headerRowElement === 'undefined') return;

            //6 accounts for thick border
            let width = self.options.headerRowElement.getBoundingClientRect().width;
            if(typeof self.options.addBorderWidth==='undefined' || self.options.addBorderWidth){
                width += 6;
            }
            self.options.headerWidth =width;
        }

        StickyHeader.prototype.setTopPosToEnableSticky = function(){
            let self = this;
            if (typeof self.options.pageHeaderElement === 'undefined') return;

            self.options.posFromTopToEnableSticky = Math.abs(self.options.pageHeaderElement.getBoundingClientRect().top
                                                    + self.options.pageHeaderElement.getBoundingClientRect().height) *-1;
        }

        StickyHeader.prototype.setStickyHeaderTopPosition = function(){
            let self = this;
            if (typeof self.options.pageHeaderElement === 'undefined') return;

            self.options.stickyHeaderTopPosition = self.options.pageHeaderElement.getBoundingClientRect().bottom;
        }

        StickyHeader.prototype.watchScroll = function() {
            let self = this;

            return window.onscroll = () => {
                if (typeof self.options.headerRowElement === 'undefined') return;

                let bodyPosition = document.body.getBoundingClientRect();

                if (bodyPosition.top < self.options.posFromTopToEnableSticky) {
                    self.options.headerRowElement.classList.add("sticky");
                    self.options.headerRowElement.style.width = `100%`;
                    self.options.headerRowElement.style.maxWidth = `1000px`;
                    if(Device.isMobile()){
                        self.options.headerRowElement.style.top = `${self.options.stickyHeaderTopPositionMobile}px`;
                    }
                    else{
                        self.options.headerRowElement.style.top = `${self.options.stickyHeaderTopPosition}px`;
                    }
                } else {
                    self.options.headerRowElement.classList.remove("sticky");
                }
            }
        }
        return StickyHeader;

    })();
});
