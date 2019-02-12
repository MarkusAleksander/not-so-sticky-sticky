(function initAction() {

    function ready(fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function run() {
        // Declarations and definitions

        var stickyItems = $('.sticky-item');
        var $window = $(window);
        var currentScrollTop;
        //var currentWindowHeight;
        //var currentScrollBottom;

        function init() {
            //currentWindowHeight = $window.height();
        }

        function scrollUpdate() {
            currentScrollTop = $window.scrollTop();
            //currentScrollBottom = currentScrollTop + currentWindowHeight;
        }

        function runStickyPositioner() {
            // * Update regularly used vars before loop
            scrollUpdate();
            // * Run through each item to check it needs to be updated and update if so
            $.each(stickyItems, function forEachItem(k, item) {
                if (checkWindowPosition(item)) {
                    // * item needs to be positioned
                    //console.log($(item).attr('data-location'));
                    var positioning = getInTrackPosition(item);
                    $(item).css({ top: positioning + 'px' });
                }
            });
        }

        // * Check position of item in the window - do we need to update
        function checkWindowPosition(item) {
            // * Check track position relative to window
            // * Get top
            var $itemParent = $(item).parent();
            var itemTop = $itemParent.offset().top;
            // * has window reached or gone past the top?
            // * if not, we don't need to consider this item
            if (itemTop > currentScrollTop) {
                return false;
            }
            // * get bottom of 'track'
            var itemBottom = itemTop + $itemParent.height();
            // * check if bottom has gone past window top
            if (itemBottom < currentScrollTop) {
                return false;
            }
            // * otherwise, item is in window view, so needs to be sticky
            return true;
        }

        // * Check position of item and position to place item
        function getInTrackPosition(item) {
            // * Position item by offsetting it from the top
            var topOffset = 0;
            // * top offset will be equal to the window top difference to the track
            var $itemParent = $(item).parent();
            topOffset = currentScrollTop - $itemParent.offset().top;
            return topOffset;
        }

        // * Now do stuff...
        (function begin() {
            $window.on('scroll', runStickyPositioner);
        })();
    });
})();