/**
 * Navigation events plugin
 *
 * As you can see this part is separate from the impress.js core code.
 * It's because these navigation actions only need what impress.js provides with
 * its simple API.
 *
 * This plugin is what we call an _init plugin_. It's a simple kind of
 * impress.js plugin. When loaded, it starts listening to the `impress:init`
 * event. That event listener initializes the plugin functionality - in this
 * case we listen to some keypress and mouse events. The only dependencies on
 * core impress.js functionality is the `impress:init` method, as well as using
 * the public api `next(), prev(),` etc when keys are pressed.
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 * Released under the MIT license.
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 *
 */
/* global document */
( function( document ) {
    "use strict";

    var triggerEvent = function( el, eventName, detail ) {
        var event = document.createEvent( "CustomEvent" );
        event.initCustomEvent( eventName, true, true, detail );
        el.dispatchEvent( event );
    };

    // Wait for impress.js to be initialized
    document.addEventListener( "impress:init", function( event ) {

        // Getting API from event data.
        // So you don't event need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you
        // need to control the presentation that was just initialized.
        var api = event.detail.api;

        // Supported keys are:
        // [space] - quite common in presentation software to move forward
        // [up] [right] / [down] [left] - again common and natural addition,
        // [pgdown] / [pgup] - often triggered by remote controllers,
        // [tab] - this one is quite controversial, but the reason it ended up on
        //   this list is quite an interesting story... Remember that strange part
        //   in the impress.js code where window is scrolled to 0,0 on every presentation
        //   step, because sometimes browser scrolls viewport because of the focused element?
        //   Well, the [tab] key by default navigates around focusable elements, so clicking
        //   it very often caused scrolling to focused element and breaking impress.js
        //   positioning. I didn't want to just prevent this default action, so I used [tab]
        //   as another way to moving to next step... And yes, I know that for the sake of
        //   consistency I should add [shift+tab] as opposite action...
        var isNavigationEvent = function( event ) {

            // Don't trigger navigation for example when user returns to browser window with ALT+TAB
            if ( event.altKey || event.ctrlKey || event.metaKey ) {
                return false;
            }

            // In the case of TAB, we force step navigation always, overriding the browser
            // navigation between input elements, buttons and links.
            if ( event.keyCode === 9 ) {
                return true;
            }

            // With the sole exception of TAB, we also ignore keys pressed if shift is down.
            if ( event.shiftKey ) {
                return false;
            }

            // For arrows, etc, check that event target is html or body element. This is to allow
            // presentations to have, for example, forms with input elements where user can type
            // text, including space, and not move to next step.
            if ( event.target.nodeName !== "BODY" && event.target.nodeName !== "HTML" ) {
                return false;
            }

            if ( ( event.keyCode >= 32 && event.keyCode <= 34 ) ||
                 ( event.keyCode >= 37 && event.keyCode <= 40 ) ) {
                return true;
            }
        };

        // KEYBOARD NAVIGATION HANDLERS

        // Prevent default keydown action when one of supported key is pressed.
        document.addEventListener( "keydown", function( event ) {
            if ( isNavigationEvent( event ) ) {
                event.preventDefault();
            }
        }, false );

        // Trigger impress action (next or prev) on keyup.
        document.addEventListener( "keyup", function( event ) {
            if ( isNavigationEvent( event ) ) {
                if ( event.shiftKey ) {
                    switch ( event.keyCode ) {
                        case 9: // Shift+tab
                            api.prev();
                            break;
                    }
                } else {
                    switch ( event.keyCode ) {
                        case 33: // Pg up
                        case 37: // Left
                        case 38: // Up
                                 api.prev( event );
                                 break;
                        case 9:  // Tab
                        case 32: // Space
                        case 34: // Pg down
                        case 39: // Right
                        case 40: // Down
                                 api.next( event );
                                 break;
                    }
                }
                event.preventDefault();
            }
        }, false );

        // Delegated handler for clicking on the links to presentation steps
        document.addEventListener( "click", function( event ) {

            // Event delegation with "bubbling"
            // check if event target (or any of its parents is a link)
            var target = event.target;
            while ( ( target.tagName !== "A" ) &&
                    ( target !== document.documentElement ) ) {
                target = target.parentNode;
            }

            if ( target.tagName === "A" ) {
                var href = target.getAttribute( "href" );

                // If it's a link to presentation step, target this step
                if ( href && href[ 0 ] === "#" ) {
                    target = document.getElementById( href.slice( 1 ) );
                }
            }

            if ( api.goto( target ) ) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }, false );

        // Delegated handler for clicking on step elements
        document.addEventListener( "click", function( event ) {
            var target = event.target;

            // Find closest step element that is not active
            while ( !( target.classList.contains( "step" ) &&
                       !target.classList.contains( "active" ) ) &&
                    ( target !== document.documentElement ) ) {
                target = target.parentNode;
            }

            if ( api.goto( target ) ) {
                event.preventDefault();
            }
        }, false );

        // Add a line to the help popup
        triggerEvent( document, "impress:help:add",
                      { command: "Left &amp; Right", text: "Previous &amp; Next step", row: 1 } );

    }, false );

} )( document );
