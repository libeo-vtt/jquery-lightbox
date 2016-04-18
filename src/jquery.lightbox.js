// Lightbox jQuery Plugin
// A11y friendly lightbox

(function($) {
    var Lightbox = function(element, options) {
        this.lightbox = $(element);

        this.config = $.extend({
            keepFocusInside: true,
            customGlobalClasses: {}
        }, options || {});

        this.classes = $.extend({
            active: 'is-active',
            open: 'is-open',
            hover: 'is-hover',
            clicked: 'is-clicked',
            extern: 'is-external',
            error: 'is-error',
            visuallyhidden: 'is-visuallyhidden',
            next: 'is-next',
            prev: 'is-prev'
        }, (window.classes !== undefined ? window.classes : this.config.customGlobalClasses) || {});

        this.lightboxIdentifier = this.lightbox.attr('data-lightbox-id');
        this.lightboxOpenTriggers = $('button[data-open-lightbox="' + this.lightboxIdentifier + '"]');
        this.lightboxCloseTriggers = $('button[data-close-lightbox="' + this.lightboxIdentifier + '"]');
        this.clickedLightboxTrigger = '';

        this.init();
    };

    $.extend(Lightbox.prototype, {

        // Component initialization
        init: function() {
            // Add the background shadow to the lightbox
            this.lightbox.append('<div class="lightbox-shadow ' + this.classes.active + '"></div>');
            this.lightboxShadow = this.lightbox.find('.lightbox-shadow');

            this.bindEvents();
        },

        bindEvents: function() {
            this.lightboxOpenTriggers.on('click', $.proxy(function(e) {
                this.openLightbox($(e.currentTarget));
            }, this));

            this.lightboxCloseTriggers.on('click', $.proxy(function(e) {
                this.closeLightbox();
            }, this));

            this.lightboxShadow.on('click', $.proxy(function(e) {
                this.closeLightbox();
            }, this));

            $(document).keyup($.proxy(function(e) {
                if (e.keyCode === 27) this.closeLightbox();
            }, this));
        },

        openLightbox: function(currentTrigger) {
            this.createGuards();
            this.lightbox.attr('tabindex', -1);
            setTimeout($.proxy(function() {
                this.lightbox.focus();
            }, this), 0);

            // Save a reference to the lightbox open trigger button
            if (this.clickedLightboxTrigger === '') {
                this.clickedLightboxTrigger = currentTrigger;
            }

            currentTrigger.addClass(this.classes.active);
            this.lightbox.addClass(this.classes.active);
        },

        closeLightbox: function() {
            this.lightbox.removeClass(this.classes.active);
            this.lightboxOpenTriggers.removeClass(this.classes.active);
            this.removeGuards();

            this.clickedLightboxTrigger.focus();
        },

        createGuards: function() {
            this.lightbox.before('<button class="lightbox-guard ' + this.classes.visuallyhidden + ' ' + this.classes.prev + '"></button>');
            this.lightbox.after('<button class="lightbox-guard ' + this.classes.visuallyhidden + ' ' + this.classes.next + '"></button>');
            this.lightboxGuards = $('.lightbox-guard');

            this.lightboxGuards.on('focus', $.proxy(function(e) {
                this.onGuardFocus(e);
            }, this));
        },

        onGuardFocus: function(e) {
            var $guard = $(e.currentTarget);

            if (this.config.keepFocusInside) {
                if ($guard.hasClass(this.classes.prev)) {
                    this.lightbox.find(':focusable').last().focus();
                } else {
                    this.lightbox.find(':focusable').first().focus();
                }
            } else {
                this.closeLightbox();
            }
        },

        removeGuards: function() {
            this.lightboxGuards.remove();
        }
    });

    $.fn.lightbox = function(options) {
        return this.each(function() {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('lightbox')) return;

            // pass options to plugin constructor
            var lightbox = new Lightbox(this, options);

            // Store plugin object in this element's data
            element.data('lightbox', lightbox);
        });
    };
})(jQuery);
