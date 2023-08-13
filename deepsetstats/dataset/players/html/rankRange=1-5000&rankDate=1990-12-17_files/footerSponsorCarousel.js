define(['splide'], function(Splide) {
  /**
   * Creates a new instance of the SponsorCarousel class with the specified element and options.
   *
   * @param {HTMLElement} element - The HTML element that contains the carousel slides.
   * @param {Object} options - The options to configure the carousel, as defined by Splide.js.
   */
  function SponsorCarousel(element, options) {
    // Store the HTML element and options as properties of the new instance.
    this.element = element;
    this.options = options;
  }
    
  /**
   * Initializes the SponsorCarousel instance with the specified options.
   */
  SponsorCarousel.prototype.init = function() {
    // Create a new Splide.js instance with the specified element and options.
    var splide = new Splide(this.element, this.options);

    // Fade out the active slide when it moves out of view.
    splide.on('move', function(newIndex) {
      // Get the list of slides from the Splide.js Components object.
      var slides = splide.Components.Elements.slides;

      // Get the active slide and apply the "is-out" class and opacity of 0.
      var activeSlide = slides[newIndex - 1];
      if(activeSlide){
        activeSlide.style.opacity = 0;
        activeSlide.classList.add('splide__slide--is-out');
      }
    });

    // Fade in the inactive slide when it comes back into view.
    splide.on('inactive', function(newIndex) {
      // Get the list of slides from the Splide.js Components object.
      var slides = splide.Components.Elements.slides;

      // Get the previously active slide and remove the "is-out" class and set opacity to 1 after a delay of 3 seconds.
      var inActiveSlide = slides[splide.index - 1];
      if(inActiveSlide){
        setTimeout(() => {
          inActiveSlide.style.opacity = 1;
          inActiveSlide.classList.remove('splide__slide--is-out');
        }, 2000);
      }
    });

    // Mount the Splide.js instance to the element.
    splide.mount();
  }  
  
  return SponsorCarousel;
});
