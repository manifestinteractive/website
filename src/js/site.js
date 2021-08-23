(function() {
  var MI = {
    devFlags: {
      debug: (MI_ENV !== 'production'),
      disableAnalytics: (MI_ENV === 'development')
    },
    interval: null,
    loaded: false,
    resize: null,
    scroll: null,
    timeout: null,

    /**
     * Bind Events to DOM Elements
     */
    bindEvents: function() {
      // Cache Element Lookups
      var $trackLinks = $('a[data-track], button[data-track]')
      var $trackInput = $('input[data-track], textarea[data-track], select[data-track]')
      var $hireMe = $('form.contact-form')
      var $message = $('#mce-MESSAGE')
      var $menuTrigger = $('#menu-trigger');
      var $document = $(document);

      // Remove Current Event Listeners
      $document.off('click.mi', MI.rexyBlink)
      $trackLinks.off('click.mi', MI.trackLinks)
      $trackInput.off('change.mi', MI.trackInput)
      $hireMe.off('submit.mi', MI.contactUs)
      $message.off('keyup.mi', MI.updateCount)
      $menuTrigger.off('click.mi', MI.menuTrigger)

      // Add New Event Listeners
      $document.on('click.mi', MI.rexyBlink)
      $trackLinks.on('click.mi', MI.trackLinks)
      $trackInput.on('change.mi', MI.trackInput)
      $hireMe.on('submit.mi', MI.contactUs)
      $message.on('keyup.mi', MI.updateCount)
      $menuTrigger.on('click.mi', MI.menuTrigger)
    },

    /**
     * Track Event using Google Analytics
     * @param category
     * @param action
     * @param label
     * @param value
     */
    trackEvent: function(category, action, label, value) {
      if (typeof gtag !== 'undefined' && !MI.devFlags.disableAnalytics) {
        gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value
        })
      }

      if (MI.devFlags.debug) {
        console.log('Track Event:', category, action, label, value)
      }
    },

    /**
     * Setup Tracking on Links
     * @param evt
     */
    trackLinks: function(evt) {
      var data

      if (typeof evt.target !== 'undefined' && typeof evt.target.dataset !== 'undefined' && typeof evt.target.dataset.track !== 'undefined') {
        data = evt.target.dataset
      } else if (typeof evt.target !== 'undefined' && typeof evt.target.parentNode !== 'undefined' && typeof evt.target.parentNode.dataset !== 'undefined' && typeof evt.target.parentNode.dataset.track !== 'undefined') {
        data = evt.target.parentNode.dataset
      }

      if (typeof data === 'object' && typeof data.category === 'string' && typeof data.action === 'string' && typeof data.label === 'string') {
        MI.trackEvent(data.category, data.action, data.label, data.value)
      }
    },

    /**
     * Setup Tracking on Input
     * @param evt
     */
    trackInput: function(evt) {
      var data

      if (typeof evt.target !== 'undefined' && typeof evt.target.dataset !== 'undefined' && typeof evt.target.dataset.track !== 'undefined') {
        data = evt.target.dataset
      } else if (typeof evt.target !== 'undefined' && typeof evt.target.parentNode !== 'undefined' && typeof evt.target.parentNode.dataset !== 'undefined' && typeof evt.target.parentNode.dataset.track !== 'undefined') {
        data = evt.target.parentNode.dataset
      }

      if (typeof data === 'object' && typeof data.category === 'string' && typeof data.action === 'string') {
        MI.trackEvent(data.category, data.action, evt.target.value, evt.target.value.length)
      }
    },

    /**
     * Process Contact Us & Careers Page Forms
     * @param evt
     */
    contactUs: function(evt) {
      evt.preventDefault()

      var $form = $('.contact-form')
      var $error = $('.error-message')
      var $errorText = $('.error-message-text')

      var $fname = $form.find('input[name=FNAME]')
      var $lname = $form.find('input[name=LNAME]')
      var $email = $form.find('input[name=EMAIL]')
      var $message = $form.find('textarea[name=MESSAGE]')

      var formLabel = ($form.attr('id') === 'hireMe') ? 'Hire Me' : 'Contact Us'

      var action = $form.attr('action')
      var method = $form.attr('method')

      var valid = true
      var errorMessage = ''

      // eslint-disable-next-line
      var validEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      $error.hide()
      $('.has-error', $form).removeClass('has-error')

      if ($fname.val() === '') {
        valid = false
        errorMessage = 'First Name cannot be blank.'
        $fname.closest('.control').addClass('has-error')
        $fname.focus()
      } else if ($lname.val() === '') {
        valid = false
        errorMessage = 'Last Name cannot be blank.'
        $lname.closest('.control').addClass('has-error')
        $lname.focus()
      } else if (!validEmail.test($email.val())) {
        valid = false
        errorMessage = 'Email Address is Invalid.'
        $email.closest('.control').addClass('has-error')
        $email.focus()
      } else if ($message.val() === '') {
        valid = false
        errorMessage = 'Message cannot be blank.'
        $message.closest('.control').addClass('has-error')
        $message.focus()
      }

      if (valid) {
        $.ajax({
          type: method,
          url: action,
          data: $form.serialize(),
          cache: false,
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          error: function(err) {
            if (err.status === 404) {
              $errorText.html('Service is not available at the moment. Please check your internet connection or try again later.')
            } else {
              $errorText.html('Oops. Looks like something went wrong. Please try again later.')
            }

            $error.show()

            MI.trackEvent('Error', formLabel, JSON.stringify(err))
          },
          success: function(data) {
            if (data.result !== 'success') {
              $errorText.html(data.msg)
              $error.show()
              $('.hide-on-success').hide()

              MI.trackEvent('Error', formLabel, data.msg)

              if (data.msg.indexOf('is already subscribed') > -1) {
                MI.trackEvent(formLabel, 'MailChimp Notice', 'Contacted Us Email Already Subscribed')
              } else {
                MI.trackEvent(formLabel, 'MailChimp Error', data.msg)
              }
            } else {
              $form.trigger('reset')
              $('.success-msg').show()
              $('.hide-on-success').hide()

              MI.trackEvent(formLabel, 'MailChimp Success', 'User Contacted Us')
            }
          }
        })
      } else {
        MI.trackEvent('Error', 'Hire Me Form', errorMessage)
        $errorText.html(errorMessage)
        $error.show()
      }

      return false
    },

    /**
     * Initialize Website
     */
    init: function() {
      var $body = $('body')
      var loading = ($body.hasClass('loading'))

      MI.search()

      if (loading) {
        MI.setupGUI()
      }
    },

    menuTrigger: function() {
      var $header = $('#header')
      var $mainMenu = $('#main-menu')
      var isOpen = $(this).hasClass('open')

      $header.toggleClass('display-menu')
      $mainMenu.toggleClass('display-menu')

      $(this).toggleClass('open')
      $(this).attr('aria-expanded', !isOpen)
    },

    rexyBlink: function() {
      var $blink = $('.blink')
      $blink.toggleClass('hide')

      setTimeout(function() {
        $blink.toggleClass('hide')
      }, 125)
    },

    /**
     * Generate Search Results Page
     * NOTE: This is for Google Only, but can be test by going to /search?q=Search+Term
     */
    search: function() {
      if (window.location.pathname !== '/search') {
        return
      }

      var $results = $('#search-results')
      var gapi = $results.data('search')
      var cx = $results.data('cx')

      var getUrlVars = function() {
        var vars = {}

        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
          vars[key] = value
        })

        return vars
      }

      var parseResults = function(results, query) {
        if (typeof results !== 'undefined' && results.items && results.items.length > 0) {
          for (var i = 0; i < results.items.length; i++) {
            var result = results.items[i]
            $results.append(`<li><a href="${result.link}"><h2>${result.title}</h2></a><p>${result.snippet}</p></li>`)
          }
        } else {
          $results.append(`<li><h2>Nope, No Luck :(</h2><p>We could not find any results for "<b>${query}</b>".</p></li>`)
        }
      }

      var doSearch = function(query) {
        $.ajax({
          dataType: 'json',
          url: `https://www.googleapis.com/customsearch/v1/siterestrict?key=${gapi}&cx=${cx}&fields=items(title,snippet,link)&q=${query}`,
          success: function(response) {
            $results.html('')
            parseResults(response, query)
          }
        })
      }

      var params = getUrlVars()

      if (params && params.q && params.q.length > 3) {
        doSearch(params.q)
      }
    },

    /**
     * Setup Graphic User Interface
     */
    setupGUI: function() {
      MI.bindEvents()
      MI.standalone()
      MI.loaded = true

      // Add active class to menu
      var path = window.location.pathname
      $('#menu a').each(function() {
        var href = $(this).attr('href')
        if (href === path || (href === '/projects' && path.indexOf('project') > -1)) {
          $(this).addClass('active')
        }
      })

      // Load Grid if Present
      var $portfolioGrid = $('#portfolio-container');
      if ($portfolioGrid) {
        $portfolioGrid.cubeportfolio({
          filters: '#filters-container',
          loadMore: '#more-projects',
          loadMoreAction: $portfolioGrid.data('loadmoreaction'),
          layoutMode: ($portfolioGrid.data('layoutmode') == null) ? 'grid' : $portfolioGrid.data('layoutmode'),
          sortToPreventGaps: true,
          mediaQueries: [{
            width: 1500,
            cols: ($portfolioGrid.data('large-desktop') == null) ? 4 : $portfolioGrid.data('large-desktop')
          }, {
            width: 1100,
            cols: ($portfolioGrid.data('medium-desktop') == null) ? 3 : $portfolioGrid.data('medium-desktop')
          }, {
            width: 800,
            cols: ($portfolioGrid.data('tablet') == null) ? 3 : $portfolioGrid.data('tablet')
          }, {
            width: 480,
            cols: ($portfolioGrid.data('mobile-landscape') == null) ? 2 : $portfolioGrid.data('mobile-landscape')
          }, {
            width: 320,
            cols: ($portfolioGrid.data('mobile-portrait') == null) ? 1 : $portfolioGrid.data('mobile-portrait')
          }],
          defaultFilter: '*',
          animationType: $portfolioGrid.data('animationtype'),
          gapHorizontal: ($portfolioGrid.data('gaphorizontal') == null) ? 0 : $portfolioGrid.data('gaphorizontal'),
          gapVertical: ($portfolioGrid.data('gapvertical') == null) ? 0 : $portfolioGrid.data('gapvertical'),
          gridAdjustment: 'responsive',
          caption: ($portfolioGrid.data('captionanimation') == null) ? 'fadeIn' : $portfolioGrid.data('captionanimation'),
          displayType: 'fadeIn',
          displayTypeSpeed: 100,
          lightboxDelegate: '.cbp-lightbox',
          lightboxGallery: true,
          lightboxTitleSrc: 'data-title',
          lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
        });
      }

      // Hide Page Loader after setting up everything
      $('body').removeClass('loading')
      $('.pageloader').hide()

      clearTimeout(MI.interval)
    },

    /**
     * Check if website is launched from someone saving the site to their Home Screen
     * if so, we want to prevent leaving the full screen experience unless clicking
     * an external link.
     */
    standalone: function() {
      // Support Standalone mode and keep local links within app
      if (('standalone' in window.navigator) && window.navigator.standalone) {
        $('a').on('click', function(e) {
          var newLocation = $(this).attr('href')
          if (newLocation !== undefined && newLocation.substr(0, 1) !== '#' && $(this).attr('target') !== '_blank' && $(this).attr('data-lightbox') === undefined) {
            window.location = newLocation
            e.preventDefault()
          }
        })
      }
    },

    /**
     * Update Max Length Count
     * @param evt
     */
    updateCount: function(evt) {
      var message = $(evt.target).val()
      var length = bytes(message)
      var max = 255

      $('#text-limit').text(length + ' / ' + max)
    }
  }

  /**
   * Initialize on Page Load
   */
  window.addEventListener('load', function(e) {
    MI.interval = setInterval(function() {
      if (MI_READY && !MI.loaded) {
        MI.init()
      }
    }, 100)
  })

  /**
   * Fix iOS Back Button Issue for Loading Screen
   */
  window.addEventListener('pageshow', function(e) {
    if (event.originalEvent && event.originalEvent.persisted) {
      window.location.reload()
    }
  })

  /**
   * Remove Hover State for Touch Devices to Prevent Double Tap
   */
  if (typeof window.orientation !== 'undefined' && ('ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) {
    try {
      for (var si in document.styleSheets) {
        var styleSheet = document.styleSheets[si]
        if (!styleSheet.rules) {
          continue
        }

        for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
          if (!styleSheet.rules[ri].selectorText) {
            continue
          }

          if (styleSheet.rules[ri].selectorText.match(':hover')) {
            styleSheet.deleteRule(ri)
          }
        }
      }
    } catch (ex) {}
  }

  /**
   * Detect if user is using Internet Explorer
   */
  function detectIE() {
    var ua = window.navigator.userAgent

    var msie = ua.indexOf('MSIE ')
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
    }

    var trident = ua.indexOf('Trident/')
    if (trident > 0) {
      // IE 11 => return version number
      var rv = ua.indexOf('rv:')
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
    }

    var edge = ua.indexOf('Edge/')
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
    }

    // other browser
    return false
  }

  /**
   * Get Byte Length from String
   * @param str
   */
  function bytes(str) {
    var bytes = 0;
    var len = str.length;
    var codePoint;
    var next;
    var i

    for (i = 0; i < len; i++) {
      codePoint = str.charCodeAt(i)

      // Lone surrogates cannot be passed to encodeURI
      if (codePoint >= 0xD800 && codePoint < 0xE000) {
        if (codePoint < 0xDC00 && i + 1 < len) {
          next = str.charCodeAt(i + 1)

          if (next >= 0xDC00 && next < 0xE000) {
            bytes += 4
            i++
            continue
          }
        }
      }

      bytes += (codePoint < 0x80 ? 1 : (codePoint < 0x800 ? 2 : 3))
    }

    return bytes
  }

  /**
   * Custom Greetings for Nerds Like Me
   */
  (function() {
    if (typeof console !== 'undefined') {
      var greetings = 'GREETINGS, FROM MANIFEST INTERACTIVE'
      var ascii = '\n __  __   _   _  _ ___ ___ ___ ___ _____               \n|  \\/  | /_\\ | \\| |_ _| __| __/ __|_   _|              \n| |\\/| |/ _ \\| .` || || _|| _|\\__ \\ | |                \n|_|_ |_/_/_\\_\\_|\\_|___|_| |___|___/_|_|_ _____   _____ \n|_ _| \\| |_   _| __| _ \\  /_\\ / __|_   _|_ _\\ \\ / / __|\n | || .` | | | | _||   / / _ \\ (__  | |  | | \\ V /| _| \n|___|_|\\_| |_| |___|_|_\\/_/ \\_\\___| |_| |___| \\_/ |___|\n\n'
      var link = 'Maybe we should be working on a project together ;)\n\n❯ https://manifestintractive.com/contact'

      if (detectIE()) {
        console.log(ascii + '  ' + greetings + '\n\n' + link + '\n ')
      } else {
        console.log('%c' + ascii + greetings + '\n\n%c' + link + '\n ', 'font-family: monospace; color: lime', null)
      }
    }
  })()
})()
