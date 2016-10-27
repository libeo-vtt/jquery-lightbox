// Lightbox jQuery Plugin
// Accessible, responsive and configurable jQuery lightbox plugin

(function($) {
    var Lightbox = function(element, options) {
        this.lightbox = $(element);

        // Default module configuration
        this.defaults = {
            keepFocusInside: true,
            createGallery: false,
            loop: false,
            isJsAnimation: true,
            elementToFocus: null,
            animation: 'fade',
            animationTime: 250,
            desactivateBodyScroll: true,
            labels: {
                navigationPrev: 'Précédent',
                navigationPrevHidden: 'Précédent',
                navigationNext: 'Suivant',
                navigationNextHidden: 'Suivant',
                closeButton: 'Fermer la lightbox',
                closeButtonHidden: 'Fermer la lightbox'
            },
            classes: {
                wrapper: 'lightbox-wrapper',
                shadow: 'lightbox-shadow',
                guard: 'lightbox-guard',
                guardPrev: 'lightbox-guard-prev',
                guardNext: 'lightbox-guard-next',
                navigationPrev: 'lightbox-prev-button',
                navigationNext: 'lightbox-next-button',
                closeButton: 'lightbox-close-button',
                visuallyhidden: 'visuallyhidden',
                states: {
                    active: 'is-active',
                    inactive: 'is-inactive'
                }
            }
        };

        // Merge default classes with window.project.classes
        this.classes = $.extend(true, this.defaults.classes, (window.project ? window.project.classes : {}));

        // Merge default labels with window.project.labels
        this.labels = $.extend(true, this.defaults.labels, (window.project ? window.project.labels : {}));

        // Merge default config with custom config
        this.config = $.extend(true, this.defaults, options || {});

        this.publicMethods = {
            open: $.proxy(function() {
                this.openLightbox('change');
            }, this)
        };

        this.lightboxWrapper = this.lightbox.find('.' + this.classes.wrapper);
        this.lightboxIdentifier = this.lightbox.attr('data-lightbox-id');

        this.lightboxOpenTriggers = $('button[data-open-lightbox="' + this.lightboxIdentifier + '"]');

        // Create a gallery of lightbox if config set to true
        if (this.config.createGallery == true) {
            this.galleryIdentifier = this.lightbox.attr('data-gallery');
            this.galleryElements = $('[data-gallery="' + this.galleryIdentifier + '"]');
            // If there's actually more than one lightbox with the data-gallery
            if (this.galleryElements.length > 1) {
                this.currentElementIndex = this.galleryElements.index(this.lightbox);
                this.currentLightbox = this.galleryElements.eq(this.currentElementIndex);
                this.nbLightboxIndexes = this.galleryElements.length - 1;
                this.createNavigation();
            }
        }

        this.init();
    };

    $.extend(Lightbox.prototype, {

        // Component initialization
        init: function() {
            // Add the background shadow to the lightbox
            this.lightbox.append('<div class="' + this.classes.shadow + ' ' + this.classes.states.active + '"></div>');
            // Add the close button
            this.lightboxWrapper.append('<button class="' + this.classes.closeButton + '" data-close-lightbox="' + this.lightboxIdentifier + '">' + this.config.labels.closeButton + ' <span class="' + this.config.classes.visuallyhidden + '">' + this.config.labels.closeButtonHidden + '</span></button>');
            this.lightboxShadow = this.lightbox.find('.' + this.classes.shadow);
            this.initVideos();
            this.bindEvents();
        },

        bindEvents: function() {
            $(document).on('click', '[data-open-lightbox="' + this.lightboxIdentifier + '"]', $.proxy(function(e) {
                this.openLightbox('new');
                e.preventDefault();
            }, this));

            $(document).on('click', '[data-close-lightbox="' + this.lightboxIdentifier + '"]', $.proxy(function(e) {
                this.closeLightbox('close');
                e.preventDefault();
            }, this));

            this.lightboxShadow.on('click', $.proxy(function(e) {
                this.closeLightbox('close');
                e.preventDefault();
            }, this));

            $(document).keyup($.proxy(function(e) {
                if (e.keyCode === 27) this.closeLightbox('close');
            }, this));

        },

        initVideos: function() {

            // Get all YouTube videos iframes
            var youtubeVideos = this.lightbox.find('iframe[src*="youtube.com"]');
            if (youtubeVideos.length > 0) {
                this.youtubeVideos = youtubeVideos;
                // For each YouTube video
                youtubeVideos.each(function() {
                    var $this = $(this);
                    var src = $this.attr('src');
                    // Enabled JS API if not enabled
                    if (src.indexOf('enablejsapi=1') === -1) {
                        if (src.indexOf('?') === -1) {
                            src = src + '?enablejsapi=1'
                        } else {
                            src = src + '&enablejsapi=1'
                        }
                        $this.attr('src', src);
                    }
                });
            }

            // Get all Vimeo videos iframes
            var vimeoVideos = this.lightbox.find('iframe[src*="vimeo.com"]');
            if (vimeoVideos.length > 0) {
                this.vimeoVideos = vimeoVideos;
                // For each YouTube video
                vimeoVideos.each(function() {
                    var $this = $(this);
                    var src = $this.attr('src');
                    // Enabled JS API if not enabled
                    if (src.indexOf('api=1') === -1) {
                        if (src.indexOf('?') === -1) {
                            src = src + '?api=1'
                        } else {
                            src = src + '&api=1'
                        }
                        $this.attr('src', src);
                    }
                });
            }

        },

        // Add previous and next buttons to the lightbox wrapper
        createNavigation: function() {
            this.lightboxWrapper.append('<button class="' + this.classes.navigationPrev + '">' + this.config.labels.navigationPrev + ' <span class="' + this.config.classes.visuallyhidden + '">' + this.config.labels.navigationPrevHidden + '</span></button>');
            this.lightboxWrapper.append('<button class="' + this.classes.navigationNext + '">' + this.config.labels.navigationNext + ' <span class="' + this.config.classes.visuallyhidden + '">' + this.config.labels.navigationNextHidden + '</span></button>');

            // Get previous and next buttons
            this.navigationPrev = this.lightboxWrapper.find('.' + this.classes.navigationPrev);
            this.navigationNext = this.lightboxWrapper.find('.' + this.classes.navigationNext);

            if (this.config.loop === false) {
                if (this.currentElementIndex === 0) {
                    this.navigationPrev.addClass(this.config.classes.states.inactive);
                }
                if (this.currentElementIndex === this.nbLightboxIndexes) {
                    this.navigationNext.addClass(this.config.classes.states.inactive);
                }
            }

            this.bindNavigation();
        },

        // Bind navigation events on previous and next buttons
        bindNavigation: function() {
            this.navigationPrev.on('click', $.proxy(function() {
                var index;
                if (this.config.loop === false) {
                    if (this.currentElementIndex == 0) {
                        index = 0;
                        this.navigationPrev.addClass(this.classes.states.inactive);
                    } else {
                        index = this.currentElementIndex - 1;
                        this.navigationPrev.removeClass(this.classes.states.inactive);
                        this.changeLightbox(this.galleryElements.eq(index));
                    }
                } else {
                    if (this.currentElementIndex != 0) {
                        index = this.currentElementIndex - 1;
                    } else {
                        index = this.nbLightboxIndexes;
                    }
                    this.changeLightbox(this.galleryElements.eq(index));
                }
            }, this));

            this.navigationNext.on('click', $.proxy(function() {
                var index;
                if (this.config.loop === false) {
                    if (this.currentElementIndex == this.nbLightboxIndexes) {
                        index = this.nbLightboxIndexes;
                        this.navigationNext.addClass(this.classes.states.inactive);
                    } else {
                        index = this.currentElementIndex + 1;
                        this.changeLightbox(this.galleryElements.eq(index));
                        this.navigationNext.removeClass(this.classes.states.inactive);
                    }
                } else {
                    if (this.currentElementIndex < this.nbLightboxIndexes) {
                        index = this.currentElementIndex + 1;
                    } else {
                        index = 0;
                    }
                    this.changeLightbox(this.galleryElements.eq(index));
                }
            }, this));
        },

        // Change of lightbox on navigation click
        changeLightbox: function(lightboxToOpen) {
            this.closeLightbox('change');
            var lightboxToOpenElement = lightboxToOpen.data('lightbox');
            lightboxToOpenElement.publicMethods.open('change');
        },

        /*
        State == "new" or "change"
         */
        openLightbox: function(state) {
            this.createGuards();

            this.lightbox.addClass(this.classes.states.active);

            this.lightbox.attr('tabindex', -1);
            setTimeout($.proxy(function() {
                this.lightbox.focus();
            }, this), 0);

            // If element to focus is specified
            if(this.config.elementToFocus != null) {
                setTimeout($.proxy(function() {
                     this.lightbox.find(this.config.elementToFocus).focus();
                }, this), 100);
            }

            this.resizeContainer();

            // If js animation or only css
            if (this.config.isJsAnimation === true) {
                // If switching between lightbox, don't fadeIn the background
                if (state == 'new') {
                    if (this.config.animation == 'fade') {
                        this.lightbox.fadeIn(this.config.animationTime);
                    } else {
                        this.lightbox.show();
                    }
                } else {
                    if (this.config.animation == 'fade') {
                        this.lightboxWrapper.hide();
                        this.lightbox.show();
                        this.lightboxWrapper.fadeIn(this.config.animationTime);
                    } else {
                        this.lightbox.show();
                    }
                }
            }

            // Desactivate body scroll if config is set to true
            if (this.config.desactivateBodyScroll == true) {
                $('body').css('overflow', 'hidden');
            }
        },
        /*
        State == "close" or "change"
         */
        closeLightbox: function(state) {
            this.lightbox.removeClass(this.classes.states.active);

            // If js animation or only css
            if (this.config.isJsAnimation === true) {
                // If switching between lightbox, don't fadeout the background
                if (state == 'close') {
                    if (this.config.animation == 'fade') {
                        this.lightbox.fadeOut(this.config.animationTime);
                    } else {
                        this.lightbox.hide();
                    }
                } else {
                    this.lightbox.hide();
                }
            }

            // Reactivate body scroll if config is set to true
            if (this.config.desactivateBodyScroll == true) {
                $('body').css('overflow', 'auto');
            }

            // If there is youtubeVideos present in lightbox
            if (typeof this.youtubeVideos !== 'undefined' && this.youtubeVideos.length > 0) {
                // Pause each video using JS API
                this.youtubeVideos.each(function() {
                    this.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                });
            }

            // If there is vimeoVideos present in lightbox
            if (typeof this.vimeoVideos !== 'undefined' && this.vimeoVideos.length > 0) {
                // Pause each video using JS API
                this.vimeoVideos.each(function() {
                    this.contentWindow.postMessage('{"method":"pause"}', '*');
                });
            }

            this.removeGuards();
            // Focus on the first trigger
            this.lightboxOpenTriggers.eq(0).focus();
        },

        resizeContainer: function() {
            var padding = parseInt(this.lightbox.css('padding-top')) + parseInt(this.lightbox.css('padding-bottom')) + parseInt(this.lightboxWrapper.css('padding-top')) + parseInt(this.lightboxWrapper.css('padding-bottom'));
            var height = $(window).height() - padding;

            this.lightboxWrapper.find('img').css('max-height', height);
            this.lightboxWrapper.find('img').css('max-width', '100%');
            this.lightboxWrapper.css('max-height', height);
        },

        createGuards: function() {
            this.lightbox.before('<button class="' + this.classes.guard + ' ' + this.classes.visuallyhidden + ' ' + this.classes.guardPrev + '"></button>');
            this.lightbox.after('<button class="' + this.classes.guard + ' ' + this.classes.visuallyhidden + ' ' + this.classes.guardNext + '"></button>');

            this.lightboxGuards = this.lightbox.prev('.' + this.classes.guard).add(this.lightbox.next('.' + this.classes.guard));
            this.lightboxGuards.on('focus', $.proxy(function(e) {
                this.onGuardFocus(e);
            }, this));
        },

        onGuardFocus: function(e) {
            var $guard = $(e.currentTarget);
            var focusableElements = 'a, button, :input, [tabindex]';

            if (this.config.keepFocusInside) {
                if ($guard.hasClass(this.classes.guardPrev)) {
                    this.lightbox.find(focusableElements).last().focus();
                } else {
                    this.lightbox.find(focusableElements).first().focus();
                }
            } else {
                this.closeLightbox('close');
            }
        },

        removeGuards: function() {
            this.lightboxGuards.off('focus');
            this.lightboxGuards.remove();
        }
    });

    $.fn.lightbox = function(options) {
        this.each($.proxy(function(index, element) {
            var $element = $(element);

            // Return early if this $element already has a plugin instance
            if ($element.data('lightbox')) return;

            // Pass options to plugin constructor
            var lightbox = new Lightbox(element, options);

            // Add every public methods to plugin
            for (var key in lightbox.publicMethods) {
                this[key] = lightbox.publicMethods[key];
            }

            // Store plugin object in this $element's data
            $element.data('lightbox', lightbox);
        }, this));

        return this;
    };
})(jQuery);
