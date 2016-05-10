# jQuery Lightbox Plugin
Accessible, responsive and configurable jQuery lightbox plugin

## Usage

1. Include jQuery and dependencies:

	```html
	<script src="path/to/jquery.min.js"></script>
	<script src="path/to/jquery.focusable.min.js"></script>
	```

2. Include plugin's code:

	```html
	<script src="path/to/jquery.lightbox.js"></script>
	```

3. Prepare the HTML for the lightbox(es):

	```html
	<button data-open-lightbox="lightbox1">Ouvrir la lightbox</button>
    <div data-lightbox-id="lightbox1" class="lightbox" data-gallery="gallery1">
        <div class="lightbox-wrapper">
            <p>Lightbox1</p>
            <button data-close-lightbox="lightbox1">Fermer la lightbox</button>
        </div>
    </div>

    <button data-open-lightbox="lightbox2">Ouvrir la lightbox</button>
    <div data-lightbox-id="lightbox2" class="lightbox" data-gallery="gallery1">
        <div class="lightbox-wrapper">
            <p>Lightbox2</p>
            <button data-close-lightbox="lightbox2">Fermer la lightbox</button>
        </div>
    </div>
	```

3. Call the plugin:

	```javascript
	// Default configuration
	$('.lightbox-element').lightbox();

	// Custom configuration
	$('.lightbox-element').lightbox({
	    keepFocusInside: false,
	    createGallery: true
	});
	```

## Downloads

* [Source](https://raw.githubusercontent.com/libeo-vtt/jquery-lightbox/master/dist/jquery.lightbox.js)
* [Minified version](https://raw.githubusercontent.com/libeo-vtt/jquery-lightbox/master/dist/jquery.lightbox.min.js)

## Configuration

#### `keepFocusInside`

> **Type:** Boolean<br>
**Default value:** true

Keep focus inside the lightbox (can't focus behind it)

---

#### `createGallery`

> **Type:** Boolean<br>
**Default value:** false

Create a gallery of lightboxes with lightboxes called with the same "data-gallery"

Navigation will be added to the lightbox wrapper (next and prev)

---

#### `loop`

> **Type:** Boolean<br>
**Default value:** false

Loop through all lightboxes in the gallery or stop at the end

---

#### `animation`

> **Type:** String<br>
**Default value:** "fade"

Animation of the lightbox entering the view ("fade" or empty for no animation)

---

#### `animationTime`

> **Type:** Integer<br>
**Default value:** 250

Time of the animation in ms

---

### Public Methods (API)

#### `.open()`


```javascript
var lightbox = $('.element').open();

lightbox.open();
```

---

### Labels

```javascript
labels: {
    navigationPrev: 'Précédent',
    navigationNext: 'Suivant'
}
```

### Classes

```javascript
classes: {
 	prev: 'prev',
    next: 'next',
    navigationPrev: "lightbox-prev-button",
    navigationNext: "lightbox-next-button",
    visuallyhidden: 'visuallyhidden',
    states: {
        active: 'is-active',
        inactive: 'is-inactive'
    }
}
```
## History

Check [Releases](../../releases) for detailed changelog.

