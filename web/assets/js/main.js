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
      breakpoint_xl,
      breakpoint_nav,
      breakpoint_lg,
      breakpoint_md,
      breakpoint_sm,
      breakpoint_xs,
      resizeTimer,
      slideEasing = [0.65, 0, 0.35, 1],
      page_at,
      $siteNav,
      $siteHeader,
      headerSmHeight,
      headerMdHeight,
      headerLgHeight,
      $headerSearchForm,
      transitionElements,
      userScrolled,
      navLastScrollTop = 0,
      sectionNavLastScrollTop = 0,
      downwardScrollDelta = 6,
      upwardScrollDelta = 120,
      paddingBuffer = 40,
      isAnimating = false,
      utils = window.fizzyUIUtils;

  /**
   * Initialize all functions
   */
  function _init() {
    page_at = window.location.pathname;
    $siteNav = $('.site-nav-main');
    $siteHeader = $('.site-header');
    $headerSearchForm = $('#header-search-form');

    if ($('#translation').length) {
      headerSmHeight = '100px';
      headerMdHeight = '140px';
      headerLgHeight = '200px';
    } else {
      headerSmHeight = '60px';
      headerMdHeight = '100px';
      headerLgHeight = '160px';
    }

    // Set screen size vars
    _resize();

    // Transition elements to enable/disable on resize
    transitionElements = [$siteNav, $headerSearchForm];

    // Keyboard-triggered functions
    $(document).keyup(function(e) {
      // Escape key
      if (e.keyCode === 27) {
        _closeMobileNav();
        _closeSearchForm();
        _closeActionDropdown();
        _closeProjectModal();
      }

      // Left Arrow
      if (e.keyCode === 37) {
        if ($body.is('.modal-open')) {
          _changeProjectModal('previous');
        }
      }

      // Right Arrow
      if (e.keyCode === 39) {
        if ($body.is('.modal-open')) {
          _changeProjectModal('next');
        }
      }
    });

    // Offset for fixed header when loading
    // page with hash
    if(window.location.hash) {
      var st = $(window).scrollTop();
      var offset;

      if (breakpoint_xs) {
        offset = 140;
      } else if (breakpoint_md) {
        offset = $siteHeader.outerHeight();
      }

      $(window).scrollTop(st - offset);
    }

    // Update userScrolled var
    $(window).scroll(function(e){
      userScrolled = true;
    });

    // Run functions to fire on scroll
    setInterval(function() {
      if (userScrolled) {
        _showHideNavigation();
        _collapseSectionNav();
        userScrolled = false;
      }
    }, 250);

    _initSmoothScroll();
    _initActiveToggle();
    _initClickToDeactivate();
    _initCardFunctions();
    _initSiteNav();
    _initSectionNav();
    _initSearchForm();
    _initFormFunctions();
    _initPageBanner();
    _initFocusAreasShowcase();
    _initAccordions();
    _initProjectModal();
    _initExternalLinkIcons();
  }

  function _scrollBody(element, offset, duration, delay) {
    var headerOffset = $siteHeader.outerHeight();
    if (typeof offset === "undefined" || offset === null) {
      offset = headerOffset;
    }
    if (typeof duration === "undefined" || duration === null) {
      duration = 300;
    }

    if ($(element).length) {
      isAnimating = true;
      element.velocity("scroll", {
        duration: duration,
        delay: delay,
        offset: -offset,
        complete: function(elements) {
          isAnimating = false;
        }
      }, "easeOutSine");
    }
  }

  function _disableScroll() {
    var st = $(window).scrollTop();
    $body.attr('data-st', st);
    $body.addClass('no-scroll');
    $body.css('top', -st);
  }

  function _enableScroll() {
    $body.removeClass('no-scroll');
    $body.css('top', '');
    $(window).scrollTop($body.attr('data-st'));
    $body.attr('data-st', '');
  }

  function _getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  function _initSmoothScroll() {
    $(document).on('click', '.smooth-scroll', function(e) {
      e.preventDefault();
      _scrollBody($($(this).attr('href')));
    });
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
      $body.on('click touchend', function(e) {
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

  function _initCardFunctions() {
    // Hover style triggered by links in cards
    $('.card.with-hover .card-title, .card.with-hover .card-action a').on('mouseenter', function(e) {
      $(this).closest('.card').addClass('-hover');
    }).on('mouseleave', function(e) {
      $(this).closest('.card').removeClass('-hover');
    });
  }

  function _showHideNavigation() {
      var st = $window.scrollTop(),
          header = $('.nav-utility').outerHeight();

      // Check to see if the nav is open
      if ($siteNav.is('.-active') || isAnimating) {
        return;
      }

      if (st < $siteHeader.outerHeight()) {
        $body.removeClass('nav-up');
        return;
      }

      if (st > navLastScrollTop && st > 40) {
          // Scrolled down
          if (Math.abs(navLastScrollTop - st) <= downwardScrollDelta) {
              return;
          }
          $body.removeClass('nav-down').addClass('nav-up');
          if (breakpoint_nav && $('.section-navigation-wrap').length && !$('.section-navigation-wrap').is('.bottom-stuck')) {
            _updateSectionNavPos(headerMdHeight);
          }
      } else if (st + $window.height() < $(document).height() - 40 && !isAnimating) {
          // Scrolled up
          if (Math.abs(navLastScrollTop - st) <= upwardScrollDelta) {
              return;
          }
          $body.removeClass('nav-up').addClass('nav-down');
          if (breakpoint_nav && $('.section-navigation-wrap').length && !$('.section-navigation-wrap').is('.bottom-stuck')) {
            _updateSectionNavPos(headerLgHeight);
          }
      }

      navLastScrollTop = st;
  }

  function _initSiteNav() {
    $siteNav.on('click', '.nav-parent-label', function(e) {
      e.preventDefault();

      if (!breakpoint_nav) {      
        var $childNav = $(this).next('.nav-sub-level');

        if ($(this).is('.-active')) {
          $childNav.velocity('slideUp', { duration: 250, easing: 'easeOutSine' });
        } else {
          $siteNav.find('.nav-parent-label.-active + .nav-sub-level').velocity('slideUp', { duration: 250, easing: 'easeOutSine' });
          $siteNav.find('.nav-parent-label.-active').not($(this)).removeClass('-active');
          $childNav.velocity('slideDown', { duration: 250, easing: 'easeOutSine' });
        }
      }
    });
  }

  function _initSectionNav() {
    if ($('.section-navigation').length) {
      var $sectionNav = $('.section-navigation'),
          $wrap = $('.section-navigation-wrap'),
          $stickyWrap = $('.sticky-wrap'),
          sections = $('.section');

      // Build Nav
      $sectionNav.append('<h4 class="accordion-toggle">Jump to <span class="expand-contract"></span></h4><ol class="accordion-content"></ol>');

      // If not small-screen, start with it open
      if (breakpoint_lg) {
        $sectionNav.addClass('-active');
        $sectionNav.find('.expand-contract').addClass('-active');
      }

      sections.each(function(i) {
        var sectionId = $(this).attr('id'),
            sectionTitle = $(this).attr('data-section-title');
        $sectionNav.find('ol').append('<li><a href="#'+ sectionId +'">'+ sectionTitle +'</a></li>');
      });

      // Click to scroll to section
      $(document).on('click', '.section-navigation a', function(e) {
        e.preventDefault();

        var $section = $($(this).attr('href'));
        var headerOffset;

        if ($section.offset().top < $window.scrollTop() + $siteHeader.outerHeight() && breakpoint_lg) {
          headerOffset = $siteHeader.outerHeight() + $siteHeader.find('.nav-utility').outerHeight() + paddingBuffer;
          _scrollBody($section, headerOffset);
        } else {
          if (breakpoint_lg) {
            headerOffset = $siteHeader.outerHeight();
          } else {
            headerOffset = $siteHeader.outerHeight() + $sectionNav.find('.accordion-toggle').outerHeight() + paddingBuffer;
          }
          _scrollBody($section, headerOffset);
        }

        parent.location.hash = $(this).attr('href').replace('#','');
      });

      // Sticky Behavior
      $(window).scroll(function(e){
        var st = $window.scrollTop(),
            $element = $wrap,
            wrapIsStuck = $wrap.is('.stuck'),
            stickyWrapTop = $stickyWrap.offset().top,
            stickyWrapBottom = $stickyWrap.offset().top + $stickyWrap.outerHeight(),
            scrollPos = st + $siteHeader.outerHeight();

        // If elmeent isn't stuck and scroll is withiin the sticky wrap bounds, make it sticky
        if (!wrapIsStuck && scrollPos >= stickyWrapTop && scrollPos + $element.outerHeight() < stickyWrapBottom) {

          $element.addClass('stuck').css('top', $siteHeader.outerHeight());

        // If it's already stuck and scroll is above the element, un-stick it
        } else if (wrapIsStuck && scrollPos < stickyWrapTop) {
          $element.removeClass('stuck').css('top', '0');
          if (breakpoint_lg) {
            $element.removeClass('stuck').css('top', 'auto');
          } else {
          }

        // If it's stuck and scroll is past the bottom of the sticky wrap, stick it to the bottom of the wrap
        } else if (wrapIsStuck && scrollPos + $element.outerHeight() >= stickyWrapBottom) {

          $element.addClass('bottom-stuck').css({
            'top': 'auto',
            'bottom': 0
          });

        // If it's bottom-stuck and scroll is less than the bottom of the sticky wrap, un-bottom-stuck it
        } else if ($element.is('.bottom-stuck') && scrollPos + $element.outerHeight() < stickyWrapBottom) {

          $element.removeClass('bottom-stuck').css({
            'top': $siteHeader.outerHeight(),
            'bottom': 'auto'
          });
        }

      });
    }
  }

  function _updateSectionNavPos(navOffset) {
    $('.section-navigation-wrap.stuck').css('top', navOffset);
  }

  function _collapseSectionNav() {
    var st = $(window).scrollTop();
    // If on large-screen, and the nav is stuck, and the user scrolls a bit, contract it
    if ($('.section-navigation-wrap').length && $('.section-navigation-wrap').is('.stuck') && $('.section-navigation').is('.-active')) {
      if (Math.abs(sectionNavLastScrollTop - st) <= 150) {
          return;
      }
      _collapseAccordion($('.section-navigation'));
    }
    sectionNavLastScrollTop = st;
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

    // Posts-per-page select on search results page
    $('#itemsPerPage').on('change', function(e) {
      var $thisForm = $(this).closest('form'),
          pageQuery = $thisForm.find('#newQuery').val(),
          searchFormQuery = $('.page-main-content .search-form input').val();

      if (pageQuery !== searchFormQuery) {
        $thisForm.find('#newQuery').val(searchFormQuery);
      }

      $(this).closest('form').trigger('submit');
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

  function _initFocusAreasShowcase() {
    if (!$('.focus-areas-showcase').length) {
      return;
    }

    // Focuse Areas Showcase Carousels
    var $focusAreasNav = $('.focus-areas-nav'),
        $focusAreasContent = $('.focus-areas-content');

    var $focusAreasNavCarousel = $focusAreasNav.flickity({
      pageDots: false,
      wrapAround: true,
      cellAlign: 'left',
      cellSelector: 'li',
      arrowShape: 'M99.5,11.4v76.8c0,6.3-5.1,11.4-11.4,11.4c-1.8,0-3.5-0.4-5.1-1.2L6.3,59.9c-5.6-2.8-7.9-9.6-5.1-15.2 c1.1-2.2,2.9-4,5.1-5.1L83.1,1.2c5.6-2.8,12.4-0.5,15.2,5.1C99.1,7.9,99.5,9.6,99.5,11.4z'
    });

    if ($('#translation').length) {
      setTimeout(function() {
        $focusAreasNavCarousel.flickity('resize');
      },1500);
    }

    // Scroll to the nav item when clicked
    $focusAreasNavCarousel.on( 'staticClick.flickity', function(event, pointer, cellElement, cellIndex) {
      if ( typeof cellIndex == 'number' ) {
        $focusAreasNavCarousel.flickity( 'select', cellIndex );
      }
    }).on( 'change.flickity', function(event, index) {
      var $focusArea = $($('.focus-areas-nav li').eq(index).attr('data-focus-area'));
      setActiveFocusArea($focusArea);
      $('.focus-areas-nav li').eq(index).toggleClass('-active');
    });

    // Activate showcase when clicked relative nav item
    $(document).on('click', '.focus-areas-nav li', function(e) {
      var $focusArea = $($(this).attr('data-focus-area'));

      if ($(this).is('.-active')) {
        return;
      }

      setActiveFocusArea($focusArea);

      $(this).toggleClass('-active');
    });

    function setActiveFocusArea($focusArea) {
      $focusAreasNav.find('li.-active').removeClass('-active');
      $focusAreasContent.find('.focus-area.-active').not($focusArea).removeClass('-active');
      $focusArea.toggleClass('-active');
    }
  }

  function _initAccordions() {
    // Activate/deactive functions

    $('.accordion').each(function() {
      var $accordion = $(this),
          $toggle = $accordion.find('.accordion-toggle'),
          $content = $accordion.find('.accordion-content');

      // Start contracted/expanded depending on screen size
      if (breakpoint_lg) {
        _activateAccordion($accordion);
      } else {
        $content.hide();
      }

      $toggle.on('click', function(e) {
        if ($accordion.is('.-active')) {
          _collapseAccordion($accordion);
        } else {
          _expandAccordion($accordion);
        }
      });

    });
  }

  function _deactivateAccordion($accordion) {
    $accordion.removeClass('-active');
    $accordion.find('.expand-contract').removeClass('-active');        
  }

  function _activateAccordion($accordion) {
    $accordion.addClass('-active');
    $accordion.find('.expand-contract').addClass('-active');
  }

  function _collapseAccordion($accordion) {
    _deactivateAccordion($accordion);
    $accordion.find('.accordion-content').slideUp(250);
  }

  function _expandAccordion($accordion) {
    _activateAccordion($accordion);
    $accordion.find('.accordion-content').slideDown(250);
  }

  function _initProjectModal() {
    // Only set up on the projects page
    if (!$('body.project-modal').length) {
      return;
    }

    $body.append('<div id="project-modal"></div>');
    var $modal = $('#project-modal');

    // Activate when clicking on a featured project link
    $('.featured-project a').on('click', function(e) {
      e.preventDefault();
      var $project = $(this).closest('.featured-project');
      _openProjectModal($project);
    });

    // Close when clicking on background overlay
    $(document).on('click', 'body.modal-open', function(e) {
      var $target = $(e.target);

      if (!$target.parents('.featured-project').length && !$target.is('#project-modal .project-image') && !$target.is('#project-modal .project-content') && !$target.parents('.project-content').length && !$target.is('.project-modal-close') && !$target.parents('.project-modal-close').length && !$target.parents('.project-modal-nav').length) {
        _closeProjectModal();
      }
    });

    // Project modal close and navigation
    $(document).on('click', '#project-modal button', function(e) {
      var $button = $(this);

      if ($button.is('.project-modal-close')) {
        _closeProjectModal();
      } else if ($button.is('.prev-project-button')) {
        _changeProjectModal('previous');
      } else if ($button.is('.next-project-button')) {
        _changeProjectModal('next');
      }
    });
  }

  function _populateProjectModal($project) {
    var $modal = $('#project-modal'),
        modalMarkup = '<div class="wrap -extended"><div class="modal-container float-grid"><div class="project-image med-one-half"></div><div class="project-content card med-one-half"><div class="content-overflow"><div class="-inner"><header class="card-header"><h4 class="card-tag">Featured <span class="project-focus-area"></span> Project</h4><h3 class="card-title"></h3></header><div class="card-text"></div><p class="card-action"><a href="" target="_blank">Project website<svg class="icon icon-link-out"><use xlink:href="#icon-link-out"/></svg></a></p></div></div></div><button class="project-modal-close"><span class="sr-only">Close Project Details</span><svg class="icon icon-close"><use xlink:href="#icon-close"/></svg></button><nav class="project-modal-nav"><ul><li class="prev-project"><button class="prev-project-button"><span class="sr-only">Next Featured Project</span><svg class="icon icon-arrow"><use xlink:href="#icon-arrow"/></svg></button></li><li class="next-project"><button class="next-project-button"><span class="sr-only">Previous Featured Project</span><svg class="icon icon-arrow"><use xlink:href="#icon-arrow"/></svg></button></li></ul></nav></div></div>';

    $modal.html(modalMarkup);

    var projectId = $project.attr('id'),
        projectImage = $project.attr('data-image'),
        projectTitle = $project.find('.card-title a').text(),
        projectFocusArea = $project.attr('data-focus-area'),
        projectUrl = $project.attr('data-project-url'),
        projectContent = $project.find('.project-content').html();

    $modal.attr('data-projectId', projectId);
    $modal.find('.project-image').css('background-image', 'url('+projectImage+')');
    $modal.find('.project-focus-area').html(projectFocusArea);
    $modal.find('.card-title').html(projectTitle);
    $modal.find('.card-text').html(projectContent);
    $modal.find('.card-action a').attr('href', projectUrl);
  }

  function _openProjectModal($project) {
    _populateProjectModal($project);
    $body.addClass('modal-open');
    _disableScroll();
    $('#project-modal').addClass('-active');
  }

  function _closeProjectModal() {
    var st = $(window).scrollTop();
    $body.removeClass('modal-open');
    _enableScroll();
    $('#project-modal').removeClass('-active');
  }

  function _changeProjectModal(direction) {
    var featuredProjects = $('.featured-project'),
        currentProjectId = $('#project-modal').attr('data-projectId'),
        $currentProject = $('#'+$('#project-modal').attr('data-projectId')),
        currentProjectIndex = $.map(featuredProjects, function(obj, index) {
          if(obj.id == currentProjectId) {
            return index;
          }
        })[0],
        prevProjectIndex = currentProjectIndex === 0 ? featuredProjects.length - 1 : currentProjectIndex - 1,
        nextProjectIndex = currentProjectIndex === featuredProjects.length - 1 ? 0 : currentProjectIndex + 1;

    if (direction === 'previous') {
      _populateProjectModal($(featuredProjects[prevProjectIndex]));
    } else if (direction === 'next') {
      _populateProjectModal($(featuredProjects[nextProjectIndex]));
    }
  }

  function _initExternalLinkIcons() {
    var comp = new RegExp(location.host);

    $('.user-content a').each(function() {
       if(!comp.test($(this).attr('href'))){
         $(this).addClass('external-link').append('<svg class="icon icon-link-out"><use xlink:href="#icon-link-out"/></svg>');
       }
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
    breakpoint_xl = breakpointIndicatorString === 'xl';
    breakpoint_nav = breakpointIndicatorString === 'nav' || breakpoint_xl;
    breakpoint_lg = breakpointIndicatorString === 'lg' || breakpoint_nav;
    breakpoint_md = breakpointIndicatorString === 'md' || breakpoint_lg;
    breakpoint_sm = breakpointIndicatorString === 'sm' || breakpoint_md;
    breakpoint_xs = breakpointIndicatorString === 'xs' || breakpoint_sm;

    // Reposition section nav
    if ($('.section-navigation').length) {
      if (breakpoint_md) {
        _updateSectionNavPos(headerMdHeight);
      } else {
        _updateSectionNavPos(headerSmHeight);
      }
    }

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
