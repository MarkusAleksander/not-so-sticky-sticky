(function initAction() {

    function ready(fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function run() {

        var stickyModule = (function stickyItems() {
            var data = {
                stickyItemsSelector: $('.sticky-block-item'),
                $window: $(window),
                currentScrollTop: 0,
                paddingOffset: 50,
                awaitingCleanupCheck: false,
                stickyClasses: {
                    'top': 'stuck-to-top',
                    'bottom': 'stuck-to-bottom',
                    'screen': 'stuck-to-screen'
                },
                boundScroll: false
            }

            // * Reinitialisation
            function reinit() {
                $.each(data.stickyItemsSelector, function updateSides(k, item) {
                    $item = $(item);
                    if ($item.hasClass(data.stickyClasses.screen)) {
                        $parent = $item.parent();
                        leftPos = $parent.offset().left;
                        rightPos = $window.width() - ($parent.width() + leftPos);
                        setSidePositioning($item, leftPos + 'px', rightPos + 'px');
                    }
                });
            }
            // * Update scroll position
            function getScrollPosition() {
                data.currentScrollTop = data.$window.scrollTop();
            }
            // * update classes appropriately
            function updateClasses($item, newClass) {
                $.each(data.stickyClasses, function removeClass(k, v) {
                    $item.removeClass(v);
                });
                $item.addClass(data.stickyClasses[newClass]);
            }
            // * Check position of item in the window - do we need to update
            function isItemInWindow($item) {
                var $itemParent = $item.parent(),
                    // * Check track position relative to window
                    // * Get top
                    itemTop = $itemParent.offset().top,
                    // * get bottom of 'track'
                    itemBottom = itemTop + $itemParent.height();

                // * Does the sticky item have enough spcae to scroll in?
                if ($itemParent.height() <= data.$window.height()) {
                    return false;
                }
                // * has window reached or gone past the top?
                // * if not, we don't need to consider this item
                if (itemTop > (data.currentScrollTop + data.paddingOffset)) {
                    return false;
                }
                // * check if bottom has gone past window top
                if (itemBottom < (data.currentScrollTop + data.paddingOffset)) {
                    return false;
                }
                // * otherwise, item is in window view, so needs to be sticky
                return true;
            }
            // * Check item position
            function checkItemPosition($item) {
                var positioning = getInTrackPosition($item),
                    $parent = $item.parent(),
                    leftPos = 'auto',
                    rightPos = 'auto';

                if (positioning <= 0) {
                    if (!$item.hasClass(data.stickyClasses['top'])) {
                        // * Position when item is at start of track
                        setSidePositioning($item, leftPos, rightPos);
                        updateClasses($item, 'top');
                    }
                } else if (positioning > ($parent.height() - data.$window.height())) {
                    if (!$item.hasClass(data.stickyClasses['bottom'])) {
                        // * Position when item is at bottom of track
                        setSidePositioning($item, leftPos, rightPos);
                        updateClasses($item, 'bottom');
                    }
                } else if (!$item.hasClass(data.stickyClasses['screen'])) {
                    // * Position when item is to be stuck to the screen
                    leftPos = $parent.offset().left;
                    rightPos = data.$window.width() - ($parent.width() + leftPos);

                    setSidePositioning($item, leftPos + 'px', rightPos + 'px');
                    updateClasses($item, 'screen');
                }
            }
            // * Check position of item and position to place item
            function getInTrackPosition($item) {
                // * Position item by offsetting it from the top
                var topOffset = 0;

                // * top offset will be equal to the window top difference to the track
                topOffset = data.currentScrollTop - $item.parent().offset().top;
                return topOffset;
            }
            // * Set side positioning
            function setSidePositioning($item, left, right) {
                $item.css({
                    'left': left,
                    'right': right
                });
            }
            // * Cleanup function
            function cleanup() {
                checkItemPosition(this);
                data.awaitingCleanupCheck = false;
            }
            // * Handle resizing
            function handleResize() {
                // * If window is greater than 768
                if (data.$window.width() < 768) {
                    if (data.boundScroll) {
                        data.$window.off('scroll', run);
                        data.boundScroll = false;
                    }
                }
                // * Window is less than tablet, so don't run
                else {
                    if (!data.boundScroll) {
                        data.$window.on('scroll', run);
                        data.boundScroll = true;
                    }
                    reinit();
                }
            }
            // * Check if items have busted through their track
            function trackBusterCheck() {
                $.each(data.stickyItemsSelector, function busterCheck(k, item) {
                    // * is item in view?
                    var $item = $(item),
                        $itemParent = $item.parent(),
                        itemTop = $itemParent.offset().top,
                        itemBottom = $itemParent.height() + itemTop;

                    if (
                        (itemTop > data.currentScrollTop || itemBottom > data.currentScrollTop)
                        &&
                        ($itemParent.height() > data.$window.height())) {
                        checkItemPosition($item);
                    }
                });
            }
            // * Run the Module
            function run() {
                // * Update regularly used vars before loop
                getScrollPosition();
                // * Run through each item to check it needs to be updated and update if so
                $.each(data.stickyItemsSelector, function forEachItem(k, item) {
                    var $item = $(item);

                    if (isItemInWindow($item)) {
                        // * item needs to be positioned
                        checkItemPosition($item);
                        // Cleanup check - has item busted beyond it's boundaries?
                        if (!data.awaitingCleanupCheck) {
                            data.awaitingCleanupCheck = true;
                            window.setTimeout(cleanup.bind($item), 150);
                        }
                    }
                });
            }

            // * Initialise
            function initialise() {
                run();
                data.$window.on('scroll', run);
                data.boundScroll = true;
            }

            return {
                init: initialise,
                handleResize: handleResize,
                trackBuster: trackBusterCheck
            }

        })();

        // * Now do stuff...
        (function begin() {
            stickyModule.init();
            $(window).on('resize', stickyModule.handleResize);
            window.setInterval(stickyModule.trackBuster, 50);
        })();
    });
})();