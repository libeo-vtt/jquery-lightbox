// Lightbox jQuery Plugin
// A11y friendly lightbox

(function($) {
    var Lightbox = function(element, options) {
        this.lightbox = $(element);
        // Lightbox identifier
        this.lightboxIdentifier = this.lightbox.attr("data-identifier");
        // Lightbox triggers
        this.lightboxTriggers = $('button[data-identifier="' + this.lightboxIdentifier + '"]');
        // Clicked lightbox triggers
        this.clickedLighboxTrigger = "";

        this.config = $.extend({
            customGlobalClasses: {}
        }, options || {});

        this.classes = $.extend({
            active: 'is-active',
            open: 'is-open',
            hover: 'is-hover',
            clicked: 'is-clicked',
            extern: 'is-external',
            error: 'is-error'
        }, (window.classes !== undefined ? window.classes : this.config.customGlobalClasses) || {});

        this.init();
    };

    $.extend(Lightbox.prototype, {

        // Component initialization
        init: function() {
            // Add the background shadow to the lightbox
            this.lightbox.append('<div class="lightbox-shadow ' + this.classes.active + '"></div>');
            this.lightboxShadow = this.lightbox.find(".lightbox-shadow");
            // Bind events
            this.bindEvents();
        },

        // Binding events
        bindEvents: function() {
            // On triggers click open or close lightbox
            this.lightboxTriggers.on('click', $.proxy(function(e) {
                // If lightbox is opened or not
                if (this.lightbox.hasClass(this.classes.active)) {
                    this.closeLightbox($(e.currentTarget));
                } else {
                    this.openLightbox($(e.currentTarget));
                }
            }, this));
            // On shadow click close lightbox
            this.lightboxShadow.on('click', $.proxy(function(e) {
                this.closeLightbox($(e.currentTarget));
            }, this));
        },

        openLightbox: function(currentTrigger) {
            // Add focus to the lightbox and create guards
            this.createGuards();
            this.lightbox.attr("tabindex", -1);

            setTimeout($.proxy(function() {
                this.lightbox.focus();
                console.log(document.activeElement);
            }, this), 0);

            // Add the first clicked button into a variable to use later
            if (this.clickedLighboxTrigger == "") {
                this.clickedLighboxTrigger = currentTrigger;
            }
            // Open the lightbox
            currentTrigger.addClass(this.classes.active);
            this.lightbox.addClass(this.classes.active);
        },

        closeLightbox: function(currentTrigger) {
            this.lightbox.removeClass(this.classes.active);
            this.lightboxTriggers.removeClass(this.classes.active);
            this.removeGuards();
        },

        // Create guards
        createGuards: function() {
            // Append guard buttons
            this.lightbox.before('<button class="lightbox-guard visuallyhidden is-prev"></button>');
            this.lightbox.after('<button class="lightbox-guard visuallyhidden is-next"></button>');
            this.lightboxGuards = $(".lightbox-guard");
            // On guards focus close lightbox and focus on triggered button
            this.lightboxGuards.on('focus', $.proxy(function(e) {
                this.closeLightbox($(e.currentTarget));
                this.clickedLighboxTrigger.focus();
            }, this));
        },

        // Delete guards
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
