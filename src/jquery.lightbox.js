// Lightbox jQuery Plugin
// Accessible, responsive and configurable jQuery lightbox plugin

(function($) {
    var Lightbox = function(element, options) {
        this.trigger = $(element);

        // Default module configuration
        this.defaults = {
            transitionDelay: 300,
            relativeNavigation: true,
            showCaption: true,
            showPositionCaption: true,
            beforeClose: $.noop,
            afterClose: $.noop,
            beforeLoad: $.noop,
            afterLoad: $.noop,
            labels: {
                error: 'Image could not be loaded',
                closeText: 'Fermer le lightbox',
                arrowPrevText: 'Afficher l\'élément précédent',
                arrowNextText: 'Afficher l\'élément suivant'
            },
            classes: {
                wrapper: 'lightbox-wrapper',
                overlay: 'lightbox-overlay',
                container: 'lightbox-container',
                content: 'lightbox-content',
                sliderWrapper: 'lightbox-slider-wrapper',
                sliderContainer: 'lightbox-slider-container',
                sliderElement: 'lightbox-slider-element',
                navigation: 'lightbox-navigation',
                close: 'lightbox-navigation-close',
                arrowPrev: 'lightbox-navigation-prev',
                arrowNext: 'lightbox-navigation-next',
                caption: 'lightbox-caption',
                captionWrapper: 'lightbox-caption-wrapper',
                captionContent: 'lightbox-caption-content',
                captionPosition: 'lightbox-caption-position',
                iframeContainer: 'iframe-container',
                backgroundContainer: 'lightbox-bg-container',
                guard: 'lightbox-guard',
                error: 'lightbox-error',
                beforeLoad: 'is-loading',
                afterLoad: 'is-loaded',
                states: {
                    active: 'is-active'
                }
            }
        };

        // Merge default classes with window.project.classes
        this.classes = $.extend(true, this.defaults.classes, (window.project ? window.project.classes : {}));

        // Merge default labels with window.project.labels
        this.labels = $.extend(true, this.defaults.labels, (window.project ? window.project.labels : {}));

        // Merge default config with custom config
        this.config = $.extend(true, this.defaults, options || {});

        // Initialize index position
        this.currentIndex = 0;

        // Initialize animation state
        this.isLightboxAnimated = false;

        this.publicMethods = {};

        this.bindEvents();
    };

    $.extend(Lightbox.prototype, {

        // Bind functions to events
        bindEvents: function() {
            this.trigger.on('click', $.proxy(function(event) {
                event.preventDefault();

                // Save referer to focus when lightbox close
                this.referer = $(event.currentTarget);

                // Delete existing lightbox
                this.close();

                // Create new lightbox
                this.createLightbox();
            }, this));
        },

        // Bind close event
        bindCloseEvent: function() {
            // Close lightbox when close button or overlay is clicked
            this.lightboxNavigation.find('.' + this.config.classes.close).add('.' + this.config.classes.overlay).on('click', $.proxy(function() {
                this.config.beforeClose();
                this.close();
                this.config.afterClose();
            }, this));

            this.lightbox.add(this.lightbox.find('a, button, :input, [tabindex]')).on('blur', $.proxy(function(event) {
                //this.onBlur($(event.currentTarget));
            }, this));
        },

        // Function called after blur event
        onBlur: function(element) {
            window.setTimeout($.proxy(function() {
                var activeElement = document.activeElement;
                if ($(activeElement).parents('.' + this.config.classes.wrapper).length === 0) {
                    this.close();
                }
            }, this), 1);
        },

        // Bind resize event
        bindResizeEvent: function() {
            // Bind event when resize event is finished
            $(window).resize(function() {
                // Function source: http://stackoverflow.com/a/12692647/2141535
                if (this.resizeTo) clearTimeout(this.resizeTo);
                this.resizeTo = setTimeout(function() {
                    $(this).trigger('resizeEnd');
                }, 100);
            });

            // Only trigger resize event when resize event is ended
            $(window).bind('resizeEnd', $.proxy(function() {
                this.onResize();
            }, this));
        },

        // Function called after resize event
        onResize: function() {
            this.resizeLayout();
            this.updateCaptionLayout(this.lightbox.find('img, iframe'));
        },

        // Bind gallery navigation events
        bindGalleryNavigation: function() {
            this.bindPrevEvent();
            this.bindNextEvent();
            this.bindKeyboardEvent();
            this.bindSwipeEvent();
        },

        // Bind previous button event
        bindPrevEvent: function() {
            // Previous button click event
            this.lightboxPrev.on('click', $.proxy(function() {
                if (!this.isLightboxAnimated) {
                    this.changePrevElement();
                }
            }, this));
        },

        // Bind next button event
        bindNextEvent: function() {
            // Next button click event
            this.lightboxNext.on('click', $.proxy(function() {
                if (!this.isLightboxAnimated) {
                    this.changeNextElement();
                }
            }, this));
        },

        // Bind keyboard events
        bindKeyboardEvent: function() {
            this.lightbox.on('keydown', $.proxy(function(event) {
                this.onKeyboardEvent(event);
            }, this));
        },

        onKeyboardEvent: function(event) {
            // Left arrow event
            if (event.which === 37 && !this.isLightboxAnimated) {
                this.changePrevElement();
            }
            // Right arrow event
            else if (event.which === 39 && !this.isLightboxAnimated) {
                this.changeNextElement();
            }
            // ESC event
            else if (event.which === 27) {
                this.close();
            }
        },

        // Bind swipe events
        bindSwipeEvent: function() {
            this.detectswipe(this.lightbox, $.proxy(function(direction) {
                if (direction === 'left' && !this.isLightboxAnimated) {
                    this.changeNextElement();
                } else if (direction === 'right' && !this.isLightboxAnimated) {
                    this.changePrevElement();
                }
            }, this));
        },

        // Create lightbox function
        createLightbox: function() {
            // Lightbox wrapper
            var lightboxMarkup = $('<div class="' + this.config.classes.wrapper + ' type-' + this.trigger.data('type') + '"></div>');

            // Append lightbox to body
            $('body').append(lightboxMarkup).append('<button class="' + this.classes.guard + ' visuallyhidden"></button>');
            this.lightbox = $('.' + this.config.classes.wrapper);

            if (this.isGallery()) {
                this.lightbox.addClass('is-gallery');
                this.createGalleryContainer();
            } else {
                this.lightbox.addClass('is-single');
                this.createSingleContainer();
            }

            this.createNavigation();
            this.createOverlay();
            this.bindCloseEvent();
            this.bindResizeEvent();
            this.setCurrentIndex();
            this.loadContent();
            this.resizeLayout();

            if (this.isGallery()) {
                this.loadPrevElement();
                this.loadNextElement();
                this.updateSliderLayout();
            }

            this.focusLightbox();
        },

        // Create background overlay
        createOverlay: function() {
            // Lightbox overlay
            this.lightbox.append('<div class="' + this.config.classes.overlay + '"></div>');
            this.lightboxOverlay = $('.' + this.config.classes.overlay);
        },

        // Create gallery container
        createGalleryContainer: function() {
            // Lightbox slider wrapper
            this.lightbox.prepend('<div class="' + this.config.classes.sliderWrapper + '"></div>');
            this.lightboxSliderWrapper = $('.' + this.config.classes.sliderWrapper);

            // Lightbox slider container
            this.lightboxSliderWrapper.prepend('<div class="' + this.config.classes.sliderContainer + '"></div>');
            this.lightboxContainer = $('.' + this.config.classes.sliderContainer);
        },

        // Create single container
        createSingleContainer: function() {
            // Lightbox container
            this.lightbox.prepend('<div class="' + this.config.classes.container + '"></div>');
            this.lightboxContainer = $('.' + this.config.classes.container);
        },

        // Create navigation
        createNavigation: function() {
            // Lightbox navigation
            var close = '<button class="' + this.config.classes.close + '"><span class="visuallyhidden">' + this.config.closeText + '</span></button>';

            if (this.config.relativeNavigation && !this.isGallery()) {
                this.lightboxContainer.append('<div class="' + this.config.classes.navigation + ' is-relative">' + close + '</div>');
            } else {
                this.lightbox.append('<div class="' + this.config.classes.navigation + '">' + close + '</div>');
            }

            this.lightboxNavigation = $('.' + this.config.classes.navigation);

            if (this.isGallery()) {
                this.createGalleryNavigation();
            }
        },

        // Create gallery navigation
        createGalleryNavigation: function() {
            // Lightbox gallery navigation
            var arrowPrev = '<button class="' + this.config.classes.arrowPrev + '"><span class="visuallyhidden">' + this.config.arrowPrevText + '</span></button>';
            var arrowNext = '<button class="' + this.config.classes.arrowNext + '"><span class="visuallyhidden">' + this.config.arrowNextText + '</span></button>';

            this.lightboxNavigation.prepend(arrowPrev + arrowNext);

            this.lightboxPrev = this.lightboxNavigation.find('.' + this.config.classes.arrowPrev);
            this.lightboxNext = this.lightboxNavigation.find('.' + this.config.classes.arrowNext);

            this.bindGalleryNavigation();
        },

        // Load lightbox content
        loadContent: function(trigger, position) {
            var currentTrigger = trigger !== undefined ? trigger : this.trigger;
            var currentPosition = position !== undefined ? position : 'append';
            var type = currentTrigger.data('type');
            var contentMarkup = $('<div class="' + this.config.classes.content + '"></div>');
            var currentElement;

            // Load content based on type
            switch (type) {
                case 'youtube':
                    contentMarkup.append(this.loadYoutubeMarkup(currentTrigger));
                    break;
                case 'vimeo':
                    contentMarkup.append(this.loadVimeoMarkup(currentTrigger));
                    break;
                case 'ajax':
                    contentMarkup.append(this.loadAjaxMarkup(currentTrigger));
                    break;
                case 'map':
                    contentMarkup.append(this.loadMapMarkup(currentTrigger));
                    break;
                case 'html':
                    contentMarkup.append(this.loadHTMLMarkup(currentTrigger));
                    break;
                default:
                    contentMarkup.append(this.loadImageMarkup(currentTrigger));
            }

            contentMarkup = this.addCaptions(contentMarkup, currentTrigger);
            $currentElement = $('<div class="' + this.config.classes.sliderElement + '" tabindex="-1">' + contentMarkup[0].outerHTML + '</div>');

            if (this.isGallery()) {
                $currentElement.css({
                    width: 100 / 3 + '%',
                    float: 'left'
                });
            }

            if (currentPosition === 'append') {
                this.lightboxContainer.append($currentElement);
            } else {
                this.lightboxContainer.prepend($currentElement);
            }

            this.lightboxContent = this.lightboxContainer.find('.' + this.config.classes.content);
            this.loadEvent($currentElement);
        },

        // Youtube
        loadYoutubeMarkup: function(trigger) {
            var ID = this.getYoutubeID(trigger.attr('href'));
            var markup = '<div class="' + this.classes.iframeContainer + '">' +
                '<iframe src="//www.youtube.com/embed/' + ID + '?wmode=transparent" frameborder="0" width="1920" height="1080" tabindex="-1" allowfullscreen></iframe>' +
                '</div>';

            return markup;
        },

        // Vimeo
        loadVimeoMarkup: function(trigger) {
            var ID = this.getVimeoID(trigger.attr('href'));
            var markup = '<div class="' + this.classes.iframeContainer + '">' +
                '<iframe src="//player.vimeo.com/video/' + ID + '" width="1920" height="1080" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' +
                '</div>';

            return markup;
        },

        // Images
        loadImageMarkup: function(trigger) {
            var src = trigger.attr('href');
            var alt = trigger.data('alt');
            var markup = '<img src="' + src + '" alt="' + alt + '" />';

            return markup;
        },

        // AJAX
        loadAjaxMarkup: function(trigger) {
            var markup = '<div class="' + this.classes.iframeContainer + '">' +
                '<iframe src="' + trigger.attr('href') + '" width="1920" height="1080" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' +
                '</div>';

            return markup;
        },

        // Google Map
        loadMapMarkup: function(trigger) {
            var markup = '<div class="' + this.classes.iframeContainer + '">' +
                '<iframe src="' + trigger.attr('href') + '" width="1920" height="1080" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen tabindex="-1"></iframe>' +
                '</div>';

            return markup;
        },

        // HTML
        loadHTMLMarkup: function(trigger) {
            var content = $('.lightbox-html-content[data-lightbox-content="' + trigger.data('lightbox-content') + '"]');
            var markup = '<div class="' + this.classes.backgroundContainer + '">' + content.html() + '</div>';

            return markup;
        },

        // Captions
        addCaptions: function(markup, trigger) {
            var html = $('.' + this.classes.captionContent + '[data-lightbox-caption="' + trigger.data('lightbox-caption') + '"]').html();
            var content = (html !== undefined ? html : '');
            var position = '<p class="' + this.classes.captionPosition + '">' + (this.getCurrentIndex(trigger) + 1) + ' sur ' + this.getGalleryElements().length + '</p>';
            var captionMarkup = '<div class="' + this.classes.caption + '">' + content + '</div>' + (this.config.showPositionCaption && this.isGallery() ? position : '');

            if (this.config.showCaption) {
                markup.append('<div class="' + this.classes.captionWrapper + '">' + captionMarkup + '</div>');
            }

            return markup;
        },

        // Loading event
        loadEvent: function($currentElement) {
            var elements = $currentElement.find('img, iframe');

            elements.each($.proxy(function(index, element) {
                var $element = $(element);

                this.beforeLoad($element);

                $element.one('load', $.proxy(function(event) {
                    this.afterLoad($(event.currentTarget));
                }, this)).each(function() {
                    if (this.complete) $(this).load();
                });

                $element.on('error', $.proxy(function(event) {
                    this.afterLoad($(event.currentTarget));
                    $currentElement.find('.' + this.config.classes.content).html('<p class="' + this.classes.error + '">' + this.labels.error + '</p>');
                }, this));
            }, this));
        },

        // Called before loading
        beforeLoad: function($currentElement) {
            this.config.beforeLoad();

            $currentElement.parents('.' + this.classes.content).addClass(this.config.classes.beforeLoad);
        },


        // Called after loading
        afterLoad: function($currentElement) {
            this.config.afterLoad();

            this.updateCaptionLayout($currentElement);
            $currentElement.parents('.' + this.classes.content).removeClass(this.config.classes.beforeLoad).addClass(this.config.classes.afterLoad);
        },

        // Update caption layout
        updateCaptionLayout: function(elements) {
            elements.each($.proxy(function(index, currentElement) {
                var $currentElement = $(currentElement);
                var padding = parseInt(this.lightbox.css('padding-top')) + parseInt(this.lightbox.css('padding-bottom'));
                var canvasheight = $(window).height() - padding;
                var $caption = $currentElement.parents('.' + this.config.classes.sliderElement).find('.' + this.classes.captionWrapper);

                for (var i = 0; i < 10; i++) {
                    var captionHeight = $caption.outerHeight(true);
                    var height = $currentElement.outerHeight(true);

                    console.log($currentElement.parents('.' + this.config.classes.sliderElement).attr('style'));

                    if (height + captionHeight > canvasheight && !$currentElement.is('iframe')) {
                        $currentElement.css('height', height - captionHeight);
                    }

                    if ($currentElement.is('iframe')) {
                        $currentElement.parents('.' + this.classes.iframeContainer).css('width', (canvasheight - captionHeight) * 16 / 9);
                    }

                    $caption.css('max-width', $currentElement.width());
                }
            }, this));
        },

        // Resize lightbox layout
        resizeLayout: function() {
            var slides = this.slides || this.lightbox.find('.' + this.config.classes.sliderElement);
            var padding = parseInt(this.lightbox.css('padding-top')) + parseInt(this.lightbox.css('padding-bottom'));
            var height = $(window).height() - padding;

            slides.each($.proxy(function(index, element) {
                var $element = $(element);
                var captionHeight = $element.find('.' + this.classes.captionWrapper).outerHeight(true);

                $element.find('img').css('max-height', height);
                $element.css('max-height', height);
                $element.find('iframe').removeClass('resized');

                // Keep iframe 16/9 ratio
                $element.find('.' + this.classes.iframeContainer).css('width', (height - captionHeight) * 16 / 9);
            }, this));
        },

        // Update lightbox slider layout
        updateSliderLayout: function() {
            this.slides = this.lightbox.find('.' + this.config.classes.sliderElement);

            this.lightboxContainer.css({
                width: 100 * this.slides.length + '%',
                left: '-100%'
            });

            this.slides.css({
                width: 100 / this.slides.length + '%',
                float: 'left'
            });
        },

        // Load previous element
        loadPrevElement: function() {
            var index = this.currentIndex - 1;
            var elements = this.getGalleryElements();

            if (index < 0) {
                index = elements.length - 1;
            }

            this.loadContent(elements.eq(index), 'prepend');
        },

        // Load next element
        loadNextElement: function() {
            var index = this.currentIndex + 1;
            var elements = this.getGalleryElements();

            if (index > elements.length - 1) {
                index = 0;
            }

            this.loadContent(elements.eq(index), 'append');
        },

        // Remove first element
        removeFirstElement: function() {
            this.slides.first().remove();
        },

        // Remove last element
        removeLastElement: function() {
            this.slides.last().remove();
        },

        // Change previous slide animation
        changePrevElement: function() {
            this.isLightboxAnimated = true;
            this.lightboxContainer.css({
                left: '0%',
                transition: 'left ' + this.config.transitionDelay + 'ms'
            });
            window.setTimeout($.proxy(function() {
                this.lightboxContainer.css('transition', 'none');
                this.afterChangePrevElement();
            }, this), this.config.transitionDelay);

        },

        // Previous slide animation callback
        afterChangePrevElement: function() {
            this.decrementCurrentIndex();
            this.removeLastElement();
            this.loadPrevElement();
            this.resizeLayout();
            //this.updateCaptionLayout(this.lightbox.find('iframe'));
            this.updateSliderLayout();
            window.setTimeout($.proxy(function() {
                this.isLightboxAnimated = false;
            }, this), 100);
        },

        // Change next slide animation
        changeNextElement: function() {
            this.isLightboxAnimated = true;
            this.lightboxContainer.css({
                left: '-200%',
                transition: 'left ' + this.config.transitionDelay + 'ms'
            });
            window.setTimeout($.proxy(function() {
                this.lightboxContainer.css('transition', 'none');
                this.afterChangeNextElement();
            }, this), this.config.transitionDelay);
        },

        // Next slide animation callback
        afterChangeNextElement: function() {
            this.incrementCurrentIndex();
            this.removeFirstElement();
            this.loadNextElement();
            this.resizeLayout();
            //this.updateCaptionLayout(this.lightbox.find('iframe'));
            this.updateSliderLayout();
            window.setTimeout($.proxy(function() {
                this.isLightboxAnimated = false;
            }, this), 100);
        },

        detectswipe: function(element, callback) {
            var min_x = 30
            var max_x = 30
            var min_y = 50
            var max_y = 60
            var direction = '';

            swipe_det = new Object();
            swipe_det.sX = 0;
            swipe_det.sY = 0;
            swipe_det.eX = 0;
            swipe_det.eY = 0;

            element = element[0];

            element.addEventListener('touchstart', function(e) {
                var t = e.touches[0];
                swipe_det.sX = t.screenX;
                swipe_det.sY = t.screenY;
            }, false);

            element.addEventListener('touchmove', function(e) {
                var t = e.touches[0];
                swipe_det.eX = t.screenX;
                swipe_det.eY = t.screenY;
                e.preventDefault();
            }, false);

            element.addEventListener('touchend', function(e) {
                if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
                    if (swipe_det.eX > swipe_det.sX) direction = 'right';
                    else direction = 'left';
                } else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
                    if (swipe_det.eY > swipe_det.sY) direction = 'down';
                    else direction = 'up';
                }
                if (direction != '') {
                    if (typeof callback == 'function') callback(direction);
                }
                direction = '';
                swipe_det.sX = 0;
                swipe_det.sY = 0;
                swipe_det.eX = 0;
                swipe_det.eY = 0;
            }, false);
        },

        // Increment current slider index
        incrementCurrentIndex: function() {
            var elements = this.getGalleryElements();
            this.currentIndex++;

            if (this.currentIndex > elements.length - 1) {
                this.currentIndex = 0;
            }
        },

        // Decrement current slider index
        decrementCurrentIndex: function() {
            var elements = this.getGalleryElements();
            this.currentIndex--;

            if (this.currentIndex < 0) {
                this.currentIndex = elements.length - 1;
            }
        },

        // Initialize current sliderindex
        getCurrentIndex: function(trigger) {
            var elements = this.getGalleryElements();
            var currentTrigger = trigger !== undefined ? trigger : this.trigger;
            var current = elements.filter(currentTrigger);
            var currentIndex = -1;

            elements.each(function(index, el) {
                if ($(el)[0] === current[0]) {
                    currentIndex = index;
                }
            });

            return currentIndex;
        },

        // Initialize current sliderindex
        setCurrentIndex: function() {
            this.currentIndex = this.getCurrentIndex();
        },

        // Focus lightbox
        focusLightbox: function() {
            this.lightbox.attr('tabindex', -1).focus();
        },

        // Get Youtube ID from URL
        getYoutubeID: function(url) {
            // Function source: http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
            var match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
            return match[2];
        },

        // Get Vimeo ID from URL
        getVimeoID: function(url) {
            // Function source: http://jsbin.com/asuqic/184/edit
            var match = url.match(/https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
            return match[3];
        },

        // Return if current lightbox is gallery
        isGallery: function() {
            var element = this.getGalleryElements();
            return this.trigger.data('gallery') !== undefined && element.length > 1 ? true : false;
        },

        // Get current gallery ID
        getGalleryID: function() {
            return this.trigger.data('gallery');
        },

        // Get current gallery elements
        getGalleryElements: function() {
            return $('.lightbox[data-gallery="' + this.getGalleryID() + '"]');
        },

        // Close and delete lightbox
        close: function() {
            if (this.lightbox) {
                this.isLightboxAnimated = false;
                this.lightbox.add(this.lightbox.next('.' + this.classes.guard)).hide().remove();
                this.referer.focus();
            }
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
