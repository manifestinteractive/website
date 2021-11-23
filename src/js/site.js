(function () {
  const MI = {
    devFlags: {
      debug: (MI_ENV !== 'production'),
      sendContact: (MI_ENV !== 'development'),
      disableAnalytics: (MI_ENV === 'development')
    },
    interval: null,
    loaded: false,
    moveResetTimeout: false,
    timeout: null,

    /**
     * Bind Events to DOM Elements
     */
    bindEvents: function () {
      // Cache Element Lookups
      const $backToTop = $('#back-to-top')
      const $trackLinks = $('a[data-track], button[data-track]')
      const $trackInput = $('input[data-track], textarea[data-track], select[data-track]')
      const $contactUs = $('form.contact-form')
      const $message = $('#mce-MESSAGE')
      const $menuTrigger = $('#menu-trigger')
      const $document = $(document)
      const $window = $(window)

      // Remove Current Event Listeners
      $backToTop.off('click.mi', MI.backToTop)
      $document.off('click.mi', MI.rexyBlink)
      $document.off('mousemove.mi', MI.moveEyes)
      $trackLinks.off('click.mi', MI.trackLinks)
      $trackInput.off('change.mi', MI.trackInput)
      $contactUs.off('submit.mi', MI.contactUs)
      $message.off('keyup.mi', MI.updateCount)
      $menuTrigger.off('click.mi', MI.menuTrigger)
      $window.off('scroll.mi', MI.scroll)

      // Add New Event Listeners
      $backToTop.on('click.mi', MI.backToTop)
      $document.on('click.mi', MI.rexyBlink)
      $document.on('mousemove.mi', MI.moveEyes)
      $trackLinks.on('click.mi', MI.trackLinks)
      $trackInput.on('change.mi', MI.trackInput)
      $contactUs.on('submit.mi', MI.contactUs)
      $message.on('keyup.mi', MI.updateCount)
      $menuTrigger.on('click.mi', MI.menuTrigger)
      $window.on('scroll.mi', MI.scroll)

      const overscroll = new Overscroll()
      overscroll.init('/assets/images/rexi.png')

      setInterval(function () {
        const random = Math.floor(Math.random() * 2)
        if (random === 1) {
          MI.rexyBlink()
        }
      }, 10000)
    },

    /**
     * Track Event using Google Analytics
     * @param category
     * @param action
     * @param label
     * @param value
     */
    trackEvent: function (category, action, label, value) {
      if (typeof gtag !== 'undefined' && !MI.devFlags.disableAnalytics && window.gdprConcent) {
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
    trackLinks: function (evt) {
      let data

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
    trackInput: function (evt) {
      let data

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
     * Return to Top of Page
     * @param evt
     */
    backToTop: function (evt) {
      evt.preventDefault()
      window.scrollTo(0, 0)
    },

    /**
     * Process Contact Us & Careers Page Forms
     * @param evt
     */
    contactUs: function (evt) {
      evt.preventDefault()

      const $form = $('.contact-form')
      const $error = $('.contact-failed')

      const $fname = $form.find('input[name=FNAME]')
      const $lname = $form.find('input[name=LNAME]')
      const $email = $form.find('input[name=EMAIL]')
      const $message = $form.find('textarea[name=MESSAGE]')

      const action = 'https://manifestinteractive.us5.list-manage.com/subscribe/post-json?u=27a25269993d8a20eeb515305&id=e5b68f2479&c=?'
      const method = $form.attr('method')

      let valid = true
      let errorMessage = ''

      // eslint-disable-next-line
      let validEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      $error.hide()
      $('.has-error', $form).removeClass('has-error')
      $('.contact-error-msg').hide()

      if ($fname.val() === '') {
        valid = false
        errorMessage = 'First Name cannot be blank.'
        $fname.closest('.form-control-wrap').addClass('has-error')
        $fname.closest('.contact-error-msg').fadeIn()
        $fname.focus()
      } else if ($lname.val() === '') {
        valid = false
        errorMessage = 'Last Name cannot be blank.'
        $lname.closest('.form-control-wrap').addClass('has-error')
        $lname.closest('.contact-error-msg').fadeIn()
        $lname.focus()
      } else if (!validEmail.test($email.val())) {
        valid = false
        errorMessage = 'Email Address is Invalid.'
        $email.closest('.form-control-wrap').addClass('has-error')
        $email.closest('.contact-error-msg').fadeIn()
        $email.focus()
      } else if ($message.val() === '') {
        valid = false
        errorMessage = 'Message cannot be blank.'
        $message.closest('.form-control-wrap').addClass('has-error')
        $message.closest('.contact-error-msg').fadeIn()
        $message.focus()
      }

      function divideByChunks (string) {
        const charArray = []

        while (charArray.length < (string.length / 35)) {
          charArray.push(string.substring(0, 35))
          string = string.substring(36)
        }

        if (charArray.length >= 1 && charArray[charArray.length - 1].length < 10) {
          charArray[charArray.length - 2] += charArray[charArray.length - 1]
          charArray.pop()
        }
        return charArray
      }

      function getUniqueCharsInChunk (string) {
        return getUnique(string).length
      }

      function getUniqueCharsInArray (array) {
        const result = []
        for (let i = 0; i < array.length; i++) {
          result.push(getUniqueCharsInChunk(array[i]))
        }
        return result * 100
      }

      function getAverage (a) {
        let sum = 0
        for (let i = 0; i < a.length; i++) {
          sum += parseFloat(a[i], 10)
        }
        return sum / a.length
      }

      function getVowelFrequency (string) {
        let vowelFreq = 0
        let normalFreq = 0
        for (let i = 0; i < string.length; i++) {
          const character = string.charAt(i)
          if (!character.match(/^[a-zA-Z]+$/)) { continue }

          if (character.match(/^(a|e|i|o|u)$/i)) { vowelFreq++ }

          normalFreq++
        }

        if (normalFreq !== 0) { return vowelFreq / normalFreq * 100 } else { return 0 }
      }

      function getWordToCharRatio (string) {
        const wordArray = string.split(/[\W_]/)
        return wordArray.length / string.length * 100
      }

      function getDeviationScore (percentage, lowerBound, upperBound) {
        if (percentage < lowerBound) { return getBaseLog(lowerBound - percentage, lowerBound) * 100 } else if (percentage > upperBound) { return getBaseLog(percentage - upperBound, 100 - upperBound) * 100 } else { return 0 }
      }

      function getUnique (s) {
        const chars = {}
        let rv = ''

        for (let i = 0; i < s.length; ++i) {
          if (!(s[i] in chars)) {
            chars[s[i]] = 1
            rv += s[i]
          }
        }

        return rv
      }

      function verifyEmpty (str) {
        return (str.length === 0 || !str.trim())
      }

      function getBaseLog (x, y) {
        return Math.log(y) / Math.log(x)
      }

      function countUpperCaseChars (str) {
        let count = 0; const len = str.length
        // Skip first character
        for (let i = 1; i < len; i++) {
          if (/[A-Z]/.test(str.charAt(i))) count++
        }
        return count
      }

      function countRareCharacters (str) {
        let count = 0; const len = str.length
        // Skip first character
        for (let i = 1; i < len; i++) {
          if (/[jqxzJQXZ]/.test(str.charAt(i))) count++
        }
        return count
      }

      function isGibberish (string) {
        if (verifyEmpty(string)) {
          return 0
        }

        const chunks = divideByChunks(string)

        const uniqueCharsInArray = getAverage(getUniqueCharsInArray(chunks))
        const vowelFrequency = getVowelFrequency(string)
        const wordToCharRatio = getWordToCharRatio(string)

        const uniqueCharsInArrayDev = Math.max(1, getDeviationScore(uniqueCharsInArray, 45, 50))
        const vowelFrequencyDev = Math.max(1, getDeviationScore(vowelFrequency, 35, 45))
        const wordToCharRatioDev = Math.max(1, getDeviationScore(wordToCharRatio, 15, 20))

        const score = Math.max(1, (Math.log10(uniqueCharsInArrayDev) + Math.log10(vowelFrequencyDev) + Math.log10(wordToCharRatioDev)) / 6 * 100)

        if (score > 10) {
          const words = string.split(' ').length
          const upperCount = countUpperCaseChars(string)

          if (words === 1 && upperCount > 1) {
            return true
          } else if (getVowelFrequency < 15) {
            return true
          } else if (countRareCharacters > 1) {
            return true
          }
        }

        return false
      }

      let SPAM = 0

      if (isGibberish($fname.val())) {
        SPAM++
      }
      if (isGibberish($lname.val())) {
        SPAM++
      }
      if (isGibberish($email.val())) {
        SPAM++
      }
      if (isGibberish($message.val()) || $message.val().split(' ').length < 5) {
        SPAM++
      }

      if (SPAM > 0) {
        valid = false
        errorMessage = 'SPAM Detected'
      }

      // Check for Valid Form
      if (valid) {
        // Don't actually submit the form if we are testing
        if (!MI.devFlags.sendContact) {
          $form.trigger('reset')
          $('.contact-success').html('<span class="ion-checkmark"></span>&nbsp; Form Test Completed ( Not Actually Sent )').show()
          $('.hide-on-success').hide()

          return false
        }

        function validateToken (token) {
          $.ajax({
            type: 'POST',
            url: '/recaptcha/',
            data: {
              token: token,
              env: MI_ENV
            },
            error: function (err) {
              if (err.status === 404) {
                $error.html('<span class="ion-android-warning"></span>&nbsp; Service is not available at the moment. Please check your internet connection or try again later.')
              } else {
                $error.html('<span class="ion-android-warning"></span>&nbsp; Oops. Looks like something went wrong. Please try again later.')
              }

              $error.show()

              MI.trackEvent('Error', 'ReCAPTCHA Failed', JSON.stringify(err))
            },
            success: function (data) {
              if (!data.success) {
                $error.html('<span class="ion-android-warning"></span>&nbsp; ' + data.message ? data.message : 'CAPTCHA Rejected')
                $error.show()
                MI.trackEvent('Error', 'ReCAPTCHA Error', data.message ? data.message : 'CAPTCHA Rejected')
              } else {
                processForm()
              }
            }
          })
        }

        // Send Data to MailChimp
        function processForm () {
          $.ajax({
            type: method,
            url: action,
            data: $form.serialize(),
            cache: false,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            error: function (err) {
              if (err.status === 404) {
                $error.html('<span class="ion-android-warning"></span>&nbsp; Service is not available at the moment. Please check your internet connection or try again later.')
              } else {
                $error.html('<span class="ion-android-warning"></span>&nbsp; Oops. Looks like something went wrong. Please try again later.')
              }

              $error.show()

              MI.trackEvent('Error', 'Contact Us', JSON.stringify(err))
            },
            success: function (data) {
              if (data.result !== 'success') {
                $error.html('<span class="ion-android-warning"></span>&nbsp; ' + data.msg)
                $error.show()

                MI.trackEvent('Error', 'Contact Us', data.msg)

                if (data.msg.indexOf('is already subscribed') > -1) {
                  MI.trackEvent('Contact Us', 'MailChimp Notice', 'Contacted Us Email Already Subscribed')
                } else {
                  MI.trackEvent('Contact Us', 'MailChimp Error', data.msg)
                }
              } else {
                $form.trigger('reset')
                $('.contact-success').show()
                $('.hide-on-success').hide()

                MI.trackEvent('Contact Us', 'MailChimp Success', 'User Contacted Us')
              }
            }
          })
        }

        // Request Token from reCaptcha
        grecaptcha.ready(function () {
          grecaptcha.execute(MI_CAPTCHA, { action: 'submit' }).then(function (token) {
            validateToken(token)
          })
        })
      } else {
        MI.trackEvent('Error', 'Contact Us Form', errorMessage)
        $error.html('<span class="ion-android-warning"></span>&nbsp; ' + errorMessage)
        $error.show()
      }

      return false
    },

    /**
     * Initialize Website
     */
    init: function () {
      const $body = $('body')
      const loading = ($body.hasClass('loading'))

      MI.search()

      if (loading) {
        MI.setupGUI()
      }
    },

    menuTrigger: function () {
      const $header = $('#header')
      const $mainMenu = $('#main-menu')
      const isOpen = $(this).hasClass('open')

      $header.toggleClass('display-menu')
      $mainMenu.toggleClass('display-menu')

      $(this).toggleClass('open')
      $(this).attr('aria-expanded', !isOpen)
    },

    moveEyes: function (e) {
      // Don't bother animating eye tracking if no one can see them
      if ($('#logo:hover').length !== 0 || !$('#logo').isInViewport() || window.innerWidth < 768) {
        if (MI.moveResetTimeout) {
          $('#logo-eyes, #left-eye, #right-eye').css('transform', 'translate(0, 0)').removeClass('moving')
          clearTimeout(MI.moveResetTimeout)
        }
        return
      }

      requestAnimationFrame(function () {
        const x = (-((window.innerWidth / 2) - e.pageX) / 160)
        const y = (-((window.innerHeight / 2) - e.pageY) / 160)

        $('#logo-eyes, #left-eye, #right-eye').addClass('moving').css('transform', `translate(${x}px, ${y}px)`)

        if (MI.moveResetTimeout) {
          clearTimeout(MI.moveResetTimeout)
        }

        MI.moveResetTimeout = setTimeout(function () {
          $('#logo-eyes, #left-eye, #right-eye').css('transform', 'translate(0, 0)').removeClass('moving')
        }, 3000)
      })
    },

    rexyBlink: function () {
      const $blink = $('.blink')
      $blink.toggleClass('hide')

      setTimeout(function () {
        $blink.toggleClass('hide')
      }, 125)
    },

    scroll: function () {
      const $backToTop = $('#back-to-top')

      if ($(window).scrollTop() > 300 && !$backToTop.hasClass('show')) {
        $backToTop.addClass('show')
      } else if ($(window).scrollTop() <= 300 && $backToTop.hasClass('show')) {
        $backToTop.removeClass('show')
      }
    },

    /**
     * Generate Search Results Page
     * NOTE: This is for Google Only, but can be test by going to /search?q=Search+Term
     */
    search: function () {
      if (window.location.pathname !== '/search') {
        return
      }

      const $results = $('#search-results')
      const gapi = $results.data('search')
      const cx = $results.data('cx')

      const getUrlVars = function () {
        const vars = {}

        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
          vars[key] = value
        })

        return vars
      }

      const parseResults = function (results, query) {
        if (typeof results !== 'undefined' && results.items && results.items.length > 0) {
          for (let i = 0; i < results.items.length; i++) {
            const result = results.items[i]
            $results.append(`<li><a href="${result.link}"><h2>${result.title}</h2></a><p>${result.snippet}</p></li>`)
          }
        } else {
          $results.append(`<li><h2>Nope, No Luck :(</h2><p>We could not find any results for "<b>${query}</b>".</p></li>`)
        }
      }

      const doSearch = function (query) {
        $.ajax({
          dataType: 'json',
          url: `https://www.googleapis.com/customsearch/v1/siterestrict?key=${gapi}&cx=${cx}&fields=items(title,snippet,link)&q=${query}`,
          success: function (response) {
            $results.html('')
            parseResults(response, query)
          }
        })
      }

      const params = getUrlVars()

      if (params && params.q && params.q.length > 3) {
        doSearch(params.q)
      }
    },

    /**
     * Setup Graphic User Interface
     */
    setupGUI: function () {
      MI.bindEvents()
      MI.loaded = true

      // Add active class to menu
      const path = window.location.pathname
      $('#menu a').each(function () {
        const href = $(this).attr('href')
        if (href === path || (href === '/projects' && path.indexOf('project') > -1)) {
          $(this).addClass('active')
          $(this).attr('tabindex', -1)
        }
      })

      // Load Grid if Present
      const $portfolioGrid = $('#portfolio-container')
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
          lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>'
        })

        $(window).resize(function () {
          clearTimeout($(this).data('resize-timer'))
          $(this).data('resize-timer', setTimeout(function () {
            $portfolioGrid.cubeportfolio('layout')
          }, 100))
        })
      }

      // Hide Page Loader after setting up everything
      $('body').removeClass('loading')

      clearInterval(MI.interval)
    },

    /**
     * Update Max Length Count
     * @param evt
     */
    updateCount: function (evt) {
      const message = $(evt.target).val()
      const length = bytes(message)
      const max = 255

      $('#text-limit').text(length + ' / ' + max)
    }
  }

  /**
   * Initialize on Page Load
   */
  window.addEventListener('load', MI.init)

  /**
   * Fix iOS Back Button Issue for Loading Screen
   */
  window.addEventListener('pageshow', function (e) {
    if (event.originalEvent && event.originalEvent.persisted) {
      window.location.reload()
    }
  })

  /**
   * Remove Hover State for Touch Devices to Prevent Double Tap
   */
  if (typeof window.orientation !== 'undefined' && ('ontouchstart' in document.documentElement || window.navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0)) {
    try {
      for (const si in document.styleSheets) {
        const styleSheet = document.styleSheets[si]
        if (!styleSheet.rules) {
          continue
        }

        for (let ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
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
  function detectIE () {
    const ua = window.navigator.userAgent

    const msie = ua.indexOf('MSIE ')
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
    }

    const trident = ua.indexOf('Trident/')
    if (trident > 0) {
      // IE 11 => return version number
      const rv = ua.indexOf('rv:')
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
    }

    const edge = ua.indexOf('Edge/')
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
  function bytes (str) {
    let bytes = 0
    const len = str.length
    let codePoint
    let next
    let i

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
  (function () {
    if (typeof console !== 'undefined') {
      const greetings = 'GREETINGS, FROM MANIFEST INTERACTIVE'
      const ascii = '\n __  __   _   _  _ ___ ___ ___ ___ _____               \n|  \\/  | /_\\ | \\| |_ _| __| __/ __|_   _|              \n| |\\/| |/ _ \\| .` || || _|| _|\\__ \\ | |                \n|_|_ |_/_/_\\_\\_|\\_|___|_| |___|___/_|_|_ _____   _____ \n|_ _| \\| |_   _| __| _ \\  /_\\ / __|_   _|_ _\\ \\ / / __|\n | || .` | | | | _||   / / _ \\ (__  | |  | | \\ V /| _| \n|___|_|\\_| |_| |___|_|_\\/_/ \\_\\___| |_| |___| \\_/ |___|\n\n'
      const link = 'Maybe we should be working on a project together ;)\n\n❯ https://www.manifestintractive.com/contact'

      if (detectIE()) {
        console.log(ascii + '  ' + greetings + '\n\n' + link + '\n ')
      } else {
        console.log('%c' + ascii + greetings + '\n\n%c' + link + '\n ', 'font-family: monospace; color: #7fcab1', null)
      }
    }
  })()
})()
