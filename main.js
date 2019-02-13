(function initAction() {

    function ready(fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function run() {

        // * Sticky globals
        var stickyItems = $('.sticky-block-item'),  // * All sticky items
            $window = $(window),                    // * Window reference
            currentScrollTop,                       // * Current scroll top
            paddingOffset = 50,                     // * Padding offset
            awaitingCleanupCheck = false,           // * Timer for cleanup
            stickyClasses = {                       // * classes for sticky item
                'top': 'stuck-to-top',
                'bottom': 'stuck-to-bottom',
                'screen': 'stuck-to-screen'
            };

        // * Initialise
        function init() {
            currentScrollTop = $window.scrollTop();
            runStickyPositioner();
        }
        // * Update scroll position
        function scrollUpdate() {
            currentScrollTop = $window.scrollTop();
        }
        // * Set side positioning
        function setSidePositioning($item, left, right) {
            $item.css({
                'left': left,
                'right': right
            });
        }
        // * update classes appropriately
        function updateClasses($item, newClass) {
            $.each(stickyClasses, function removeClass(k, v) {
                $item.removeClass(v);
            });
            $item.addClass(stickyClasses[newClass]);
        }
        // * Check item position
        function checkItemPosition($item) {
            var positioning = getInTrackPosition($item),
                $parent = $item.parent(),
                leftPos = 'auto',
                rightPos = 'auto';

            if (positioning <= 0) {
                if (!$item.hasClass(stickyClasses['top'])) {
                    // * Position when item is at start of track
                    setSidePositioning($item, leftPos, rightPos);
                    updateClasses($item, 'top');
                }
            } else if (positioning > ($parent.height() - $window.height())) {
                if (!$item.hasClass(stickyClasses['bottom'])) {
                    // * Position when item is at bottom of track
                    setSidePositioning($item, leftPos, rightPos);
                    updateClasses($item, 'bottom');
                }
            } else if (!$item.hasClass(stickyClasses['screen'])) {
                // * Position when item is to be stuck to the screen
                leftPos = $parent.offset().left;
                rightPos = $window.width() - ($parent.width() + leftPos);

                setSidePositioning($item, leftPos + 'px', rightPos + 'px');
                updateClasses($item, 'screen');
            }
        }
        // * Sticky Positioner Main
        function runStickyPositioner() {
            // * Update regularly used vars before loop
            scrollUpdate();
            // * Run through each item to check it needs to be updated and update if so
            $.each(stickyItems, function forEachItem(k, item) {
                $item = $(item);
                if (checkWindowPosition($item)) {
                    // * item needs to be positioned
                    checkItemPosition($item);
                    // Cleanup check - has item busted beyond it's boundaries?
                    if (!awaitingCleanupCheck) {
                        awaitingCleanupCheck = true;
                        window.setTimeout(function cleanup() {
                            checkItemPosition($item);
                            awaitingCleanupCheck = false;
                        }, 150);
                    }
                }
            });
        }
        // * Check position of item in the window - do we need to update
        function checkWindowPosition($item) {
            // * Check track position relative to window
            // * Get top
            var $itemParent = $item.parent();
            var itemTop = $itemParent.offset().top;
            // * has window reached or gone past the top?
            // * if not, we don't need to consider this item
            if (itemTop > (currentScrollTop + paddingOffset)) {
                return false;
            }
            // * get bottom of 'track'
            var itemBottom = itemTop + $itemParent.height();
            // * check if bottom has gone past window top
            if (itemBottom < (currentScrollTop + paddingOffset)) {
                return false;
            }
            // * otherwise, item is in window view, so needs to be sticky
            return true;
        }

        // * Check position of item and position to place item
        function getInTrackPosition($item) {
            // * Position item by offsetting it from the top
            var topOffset = 0;
            // * top offset will be equal to the window top difference to the track
            topOffset = currentScrollTop - $item.parent().offset().top;
            return topOffset;
        }

        // * Now do stuff...
        (function begin() {
            init();
            $window.on('scroll', runStickyPositioner);
        })();
    });
})();