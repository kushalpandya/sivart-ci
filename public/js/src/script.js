/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 28 November, 2015
 *
 * Sivart Main Script.
 */

$(document).ready(function() {
    var pageLocation = window.location,
        socketListenerPort = 3000,
        btnShowMenu = $('#btnShowMenu'),
        socket;

    socket = io.connect(pageLocation.protocol + '//' + pageLocation.hostname + ':' + socketListenerPort);

    btnShowMenu.on('click', function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
});
