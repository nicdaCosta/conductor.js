var moduleUsed = ( 'AudioContext' in window || 'webkitAudioContext' in window ) ? 'webAudioAPI' : 'audioTag';

require.config({
	baseUrl: "js",
	map: {
		"soundEngine" : {
			"soundElement" : moduleUsed
		}
	}
});

require( [ 'soundEngine' ] , function( Conductor ) {

	'use strict';

	var objSettings = {
		url : 'sounds/test.mp3',
		spriteName : 'awesome',
		spruteMap : {}
	};
			
	var soundEngine = new Conductor( objSettings );

	var btn = document.querySelector( '.play' );

	var doStuff = function( e ) {

		e.preventDefault();

		console.warn( 'playing' );

		soundEngine.play( 'awesome' , 20 , 26 );

	};

	btn.addEventListener( 'touchstart' , doStuff , false );
	btn.addEventListener( 'click' , doStuff , false );


} );