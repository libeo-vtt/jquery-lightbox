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
            animation: "fade",
            animationTime: 250,
            classes: {
                next: 'next',
                prev: 'prev',
                navigationPrev: "navPrev",
                navigationNext: "navNext",
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
                this.openLightbox();
            }, this)
        }

        this.lightboxWrapper = this.lightbox.find(".lightbox-wrapper");
        this.lightboxIdentifier = this.lightbox.attr('data-lightbox-id');

        this.lightboxOpenTriggers = $('button[data-open-lightbox="' + this.lightboxIdentifier + '"]');
        this.lightboxCloseTriggers = $('button[data-close-lightbox="' + this.lightboxIdentifier + '"]');

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
            this.lightbox.append('<div class="lightbox-shadow ' + this.classes.states.active + '"></div>');
            this.lightboxShadow = this.lightbox.find('.lightbox-shadow');
            this.bindEvents();
        },

        bindEvents: function() {
            $(document).on('click', '[data-open-lightbox="' + this.lightboxIdentifier + '"]', $.proxy(function(e) {
                this.openLightbox(this.lightbox);
            }, this));

            $(document).on('click', '[data-close-lightbox="' + this.lightboxIdentifier + '"]', $.proxy(function(e) {
                this.closeLightbox();
            }, this));

            this.lightboxShadow.on('click', $.proxy(function(e) {
                this.closeLightbox();
            }, this));

            $(document).keyup($.proxy(function(e) {
                if (e.keyCode === 27) this.closeLightbox();
            }, this));

        },

        // Add previous and next buttons to the lightbox wrapper
        createNavigation: function() {
            this.lightboxWrapper.append('<button class="' + this.classes.visuallyhidden + ' ' + this.classes.navigationPrev + '">Prev</button>');
            this.lightboxWrapper.append('<button class="' + this.classes.visuallyhidden + ' ' + this.classes.navigationNext + '">Next</button>');

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
            this.navigationPrev.on('click', $.proxy(function(e) {
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

            this.navigationNext.on('click', $.proxy(function(e) {
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
            this.closeLightbox();
            lightboxToOpenElement = lightboxToOpen.data("lightbox");
            lightboxToOpenElement.publicMethods.open();
        },

        openLightbox: function() {
            this.createGuards();
            this.lightbox.attr('tabindex', -1);
            setTimeout($.proxy(function() {
                this.lightbox.focus();
            }, this), 0);

            this.lightbox.addClass(this.classes.states.active);

            if (this.config.animation == "fade") {
                this.lightbox.fadeIn(this.config.animationTime);
            } else {
                this.lightbox.show();
            }
        },

        closeLightbox: function() {
            this.lightbox.removeClass(this.classes.states.active);

            if (this.config.animation == "fade") {
                this.lightbox.fadeOut(this.config.animationTime);
            } else {
                this.lightbox.hide();
            }

            this.removeGuards();
            // Focus on the first trigger
            this.lightboxOpenTriggers.eq(0).focus();
        },

        createGuards: function() {
            this.lightbox.before('<button class="lightbox-guard ' + this.classes.visuallyhidden + ' ' + this.classes.prev + '"></button>');
            this.lightbox.after('<button class="lightbox-guard ' + this.classes.visuallyhidden + ' ' + this.classes.next + '"></button>');

            this.lightboxGuards = this.lightbox.prev('.lightbox-guard').add(this.lightbox.next('.lightbox-guard'));

            this.lightboxGuards.on('focus', $.proxy(function(e) {
                this.onGuardFocus(e);
            }, this));
        },

        onGuardFocus: function(e) {
            var $guard = $(e.currentTarget);
            var focusableElements = 'a, button, :input, [tabindex]';

            if (this.config.keepFocusInside) {
                if ($guard.hasClass(this.classes.prev)) {
                    this.lightbox.find(focusableElements).last().focus();
                } else {
                    this.lightbox.find(focusableElements).first().focus();
                }
            } else {
                this.closeLightbox();
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
