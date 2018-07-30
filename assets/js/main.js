// Sustain Chicago - Firebelly 2018
/*jshint latedef:false*/

//=include "../bower_components/jquery/dist/jquery.js"
//=include "../bower_components/flickity/dist/flickity.pkgd.min.js"
//=include "../bower_components/flickity-bg-lazyload/bg-lazyload.js"
//=include "../bower_components/velocity/velocity.min.js"

// Good Design for Good Reason for Good Namespace
var SC = (function($) {
  var $window = $(window),
      $body = $('body'),
      breakpointIndicatorString,
      breakpoint_lg,
      breakpoint_md,
      breakpoint_sm,
      breakpoint_xs,
      resizeTimer,
      slideEasing = [0.65, 0, 0.35, 1],
      page_at,
      $siteNav,
      $headerSearchForm,
      transitionElements,
      userScrolled,
      lastScrollTop = 0,
      downwardScrollDelta = 6,
      upwardScrollDelta = 120,
      utils = window.fizzyUIUtils;

  /**
   * Initialize all functions
   */
  function _init() {
    page_at = window.location.pathname;
    $siteNav = $('.site-nav-main');
    $headerSearchForm = $('#header-search-form');

    // Transition elements to enable/disable on resize
    transitionElements = [$siteNav, $headerSearchForm];

    // Keyboard-triggered functions
    $(document).keyup(function(e) {
      // Escape key
      if (e.keyCode === 27) {
        // Close Form
        _closeMobileNav();
        _closeSearchForm();
        _closeActionDropdown();
      }
    });

    // Update userScrolled var
    $(window).scroll(function(event){
      userScrolled = true;
    });

    // Run functions to fire on scroll
    setInterval(function() {
      if (userScrolled) {
        _showHideNavigation();
        userScrolled = false;
      }
    }, 250);

    _initActiveToggle();
    _initClickToDeactivate();
    _initMobileNav(); 
    _initSearchForm();
    _initFormFunctions();
    _initPageBanner();
    _initPrioritiesShowcase();
    _initAccordions();
  }

  function _scrollBody(el, duration) {
    var headerOffset = 0;
    if ($(el).length) {
      $('html, body').animate({scrollTop: $(el).offset().top + headerOffset}, duration, 'easeInOutSine');
    }
  }

  function _initActiveToggle() {
    $(document).on('click', '[data-active-toggle]', function(e) {
      $(this).toggleClass('-active');
      if ($(this).attr('data-active-toggle') !== '') {
        $($(this).attr('data-active-toggle')).toggleClass('-active');
      }
    });
  }

  function _initClickToDeactivate() {
    if ($('.action-dropdown').length) {    
      $body.on('click', function(e) {
        var clickTarget = $(e.target);
        if ($('.action-dropdown-container').is('.-active') && !clickTarget.parents('.action-dropdown').length) {
          _closeActionDropdown();
        }
      });
    }
  }

  function _closeActionDropdown() {
    $('.action-dropdown-container, .action-dropdown-toggle').removeClass('-active');
  }

  function _showHideNavigation() {
      var st = $window.scrollTop();

      // Check to see if the nav is open
      if ($siteNav.is('.-active')) {
          return;
      }

      if (st < $('.site-header').outerHeight()) {
        $body.removeClass('nav-up');
        return;
      }

      if (st > lastScrollTop && st > 40) {
          // Scrolled down
          // Make sure they scroll down more than downwardScrollDelta
          if (Math.abs(lastScrollTop - st) <= downwardScrollDelta) {
              return;
          }
          $body.removeClass('nav-down').addClass('nav-up');
      } else if (st + $window.height() < $(document).height() - 40 && !$('.velocity-animating').length) {
          // Scrolled up
          // Make sure they scroll up more than upwardScrollDelta
          if (Math.abs(lastScrollTop - st) <= upwardScrollDelta) {
              return;
          }
          $body.removeClass('nav-up').addClass('nav-down');
      }

      lastScrollTop = st;
  }

  function _initMobileNav() {
    $siteNav.on('click', '.nav-parent-label', function(e) {
      e.preventDefault();

      var $childNav = $(this).next('.nav-sub-level');

      if ($(this).is('.-active')) {
        $childNav.velocity('slideUp', { duration: 250, easing: 'easeOutSine' });
      } else {
        $siteNav.find('.nav-parent-label.-active + .nav-sub-level').velocity('slideUp', { duration: 250, easing: 'easeOutSine' });
        $siteNav.find('.nav-parent-label.-active').not($(this)).removeClass('-active');
        $childNav.velocity('slideDown', { duration: 250, easing: 'easeOutSine' });
      }
    });
  }

  function _closeMobileNav() {
    $siteNav.removeClass('-active');
    $('.nav-toggle').removeClass('-active');
  }

  function _initSearchForm() {
    $('.search-toggle').on('click', function(e) {
      if ($(this).is('.-active')) {
        $headerSearchForm.find('input').blur();
      } else {
        $headerSearchForm[0].addEventListener('transitionend', function(e) {
          if (e.propertyName === 'transform') {
            $headerSearchForm.find('input').focus();
          }
        }, false);
      }
    });
  }

  function _closeSearchForm() {
    $headerSearchForm.find('input').blur();
    $headerSearchForm.removeClass('-active');
    $('.search-toggle').removeClass('-active');
  }

  function _initFormFunctions() {
    $('form .input-wrap input, form .input-wrap .form-cta, form .input-wrap button[type="submit"]').on('focus', function(e) {
      $(this).closest('.input-wrap').addClass('-focus');
    }).on('blur', function(e) {
      $(this).closest('.input-wrap').removeClass('-focus');
    });
  }

  function _initPageBanner() {
    // Page Banner Carousels
    var $bannerImageCarousel = $('.banner-image-carousel'),
        $bannerTextCarousel = $('.banner-text-carousel');

    var bannerImageCarousel = $bannerImageCarousel.flickity({
      pageDots: false,
      bgLazyLoad: 1,
      wrapAround: true,
      cellAlign: 'left',
      prevNextButtons: false,
      cellSelector: '.flickity-item'
    });

    var bannerTextCarousel = $bannerTextCarousel.flickity({
      pageDots: false,
      wrapAround: true,
      draggable: false,
      cellAlign: 'left',
      adaptiveHeight: true,
      prevNextButtons: false,
      cellSelector: '.flickity-item',
      asNavFor: '.banner-image-carousel'
    });

    $(document).on('click', '.page-banner-nav button', function() {
      if ($(this).is('.previous')) {
        bannerTextCarousel.flickity('previous'); 
        bannerImageCarousel.flickity('previous'); 
      } else {
        bannerTextCarousel.flickity('next');
        bannerImageCarousel.flickity('next');
      }
    });
  }

  function _initPrioritiesShowcase() {
    if (!$('.priorities-showcase').length) {
      return;
    }

    // Priority Showcase Carousels
    var $prioritiesNav = $('.priorities-nav'),
        $prioritiesContent = $('.priorities-content');

    var $prioritiesNavCarousel = $prioritiesNav.flickity({
      pageDots: false,
      wrapAround: true,
      cellAlign: 'left',
      cellSelector: 'li',
      arrowShape: 'M99.5,11.4v76.8c0,6.3-5.1,11.4-11.4,11.4c-1.8,0-3.5-0.4-5.1-1.2L6.3,59.9c-5.6-2.8-7.9-9.6-5.1-15.2 c1.1-2.2,2.9-4,5.1-5.1L83.1,1.2c5.6-2.8,12.4-0.5,15.2,5.1C99.1,7.9,99.5,9.6,99.5,11.4z'
    });

    // Scroll to the nav item when clicked
    $prioritiesNavCarousel.on( 'staticClick.flickity', function( event, pointer, cellElement, cellIndex ) {
      if ( typeof cellIndex == 'number' ) {
        $prioritiesNavCarousel.flickity( 'select', cellIndex );
      }
    }).on( 'change.flickity', function( event, index ) {
      var $priority = $($('.priorities-nav li').eq(index).attr('data-priority'));
      setActivePriority($priority);
      $('.priorities-nav li').eq(index).toggleClass('-active');
    });

    // Activate showcase when clicked relative nav item
    $(document).on('click', '.priorities-nav li', function(e) {
      var $priority = $($(this).attr('data-priority'));

      if ($(this).is('.-active')) {
        return;
      }

      setActivePriority($priority);

      $(this).toggleClass('-active');
    });

    function setActivePriority($priority) {
      $prioritiesNav.find('li.-active').removeClass('-active');
      $prioritiesContent.find('.priority.-active').not($priority).removeClass('-active');
      $priority.toggleClass('-active');
    }
  }

  function _initAccordions() {
    $('.accordion').each(function() {
      var $accordion = $(this),
          $toggle = $accordion.find('.accordion-toggle'),
          $content = $accordion.find('.accordion-content');

      $toggle.on('click', function(e) {
        $accordion.toggleClass('-active');
        $content.slideToggle();
      });
    });
  }

  // Disabling transitions on certain elements on resize
  function _disableTransitions() {
    $.each(transitionElements, function() {
      $(this).css('transition', 'none');
    });
  }

  function _enableTransitions() {
    $.each(transitionElements, function() {
      $(this).attr('style', '');
    });
  }

  /**
   * Called in quick succession as window is resized
   */
  function _resize() {
    // Check breakpoint indicator in DOM ( :after { content } is controlled by CSS media queries )
    breakpointIndicatorString = window.getComputedStyle(
      document.querySelector('#breakpoint-indicator'), ':after'
    ).getPropertyValue('content')
    .replace(/['"]+/g, '');

    // Determine current breakpoint
    breakpoint_lg = breakpointIndicatorString === 'lg';
    breakpoint_md = breakpointIndicatorString === 'md' || breakpoint_lg;
    breakpoint_sm = breakpointIndicatorString === 'sm' || breakpoint_md;
    breakpoint_xs = breakpointIndicatorString === 'xs' || breakpoint_sm;

    // Reset inline styles for navigation for medium breakpoint
    if (breakpoint_md && $('.site-nav .nav-sub-level')[0].hasAttribute('style')) {
      $('.site-nav .nav-parent-label.-active').removeClass('-active');
      $('.site-nav .nav-sub-level[style]').attr('style', '');
    }

    // Disable transitions when resizing  
    _disableTransitions();

    // Functions to run on resize end
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Re-enable transitions
      _enableTransitions();    
    }, 250);
  }


  // Public functions
  return {
    init: _init,
    resize: _resize
  };

})(jQuery);

// Fire up the mothership & zigzag
jQuery(document).ready(SC.init);
jQuery(window).on('resize', SC.resize);
