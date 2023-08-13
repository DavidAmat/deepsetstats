define([], function() {

  /*
   * Mobile
   *
   */
  var Device;
  return Device = {
    isMobile: function() {
      return /(ios)|(android)|(ipod|ipad|iphone)/gi.test(window.navigator.userAgent);
    }
  };
});
