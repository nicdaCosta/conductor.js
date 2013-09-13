define( 'soundEngine' , [ 'soundElement' , 'utils' ] , function( SoundElement , utils ) {

	'use strict';

	var timeoutCollection = [];

	var conductor = function( objSettings ) {
	
		var _this = this,
			_sourceURL = objSettings.url,
			_spriteName = objSettings.spriteName,
			_spriteMap = objSettings.spriteMap || {};

		_this.soundElement = new SoundElement( _sourceURL , _spriteName , _spriteMap );

		var visProp = utils.getHiddenProp();

		_this.currentVolume = 1;

		_this.hanldePageVisibility = function() {

			if ( utils.tabIsHidden() ) {

				_this.soundElement.pause();

			} 

		};

		if ( visProp ) {
			var evtname = visProp.replace( /[H|h]idden/ , '' ) + 'visibilitychange';
			document.addEventListener( evtname, _this.hanldePageVisibility );
		}

	};

	var _play = function( spriteName, startTime , endTime ) {

		var _playSettings = {

			spriteName : spriteName,
			startTime : startTime,
			endTime : endTime

		};

		try { this.soundElement.play( _playSettings ); } catch(e) {console.log(e.stack)};

		console.warn( _playSettings );

	};

	var _stop = function( spriteName ) {

		this.soundElement.pause( spriteName );

	};

	var _add = function( sourceURL , spriteName , spriteMap ) {

		this.soundElement.add( sourceURL , spriteName , spriteMap );

	};

	var _volume = function( vol , spriteName ) {

		this.soundElement.volume( vol , spriteName );

	};

	var _hasSprite = function( spriteName ) {

		return this.soundElement.audio.hasOwnProperty( spriteName );

	};

	// refactor the fade method to do base calc in soundEngine then handle actual fade per soundElement module, allowing use of linearRampToValueAtTime for Web Auido API
	var _fade = function( to , len , spriteName , from ) {

		len = len || 1500;

		var _this = this,
			soundElement = _this.soundElement,
			currentVolume = from || soundElement.getVolume() - 0.1,
			diff = Math.abs( currentVolume - to ),
			noSteps = diff / 0.01,
			timeInterval = len / noSteps,
			dir = currentVolume > to ? 'down' : 'up' ,
			i = 1,
			volumeValue;

			for ( ; i <= noSteps ; i++ ) {

				volumeValue = currentVolume + ( dir === 'up' ? 0.01 : -0.01 ) * i;

				volumeValue = Math.round( 1000 * volumeValue ) / 1000;


				timeoutCollection.push( window.setTimeout( _handleFade.bind( this ) , timeInterval * i , to , volumeValue , spriteName ) );

				// volume has reached below 0, stop loop
				if ( volumeValue < 0 ) {
				
					break;
				
				}

			}

	};

	var _handleFade = function( endValue , volumeValue , spriteName  ) {

		var soundElement = this.soundElement;

		soundElement.volume( volumeValue , spriteName );

		( endValue === 0 && volumeValue === endValue ) && soundElement.pause( spriteName );

	};

	// expose methods

	conductor.prototype.play = _play;

	conductor.prototype.stop = _stop;

	conductor.prototype.add = _add;

	conductor.prototype.volume = _volume;

	conductor.prototype.fade = _fade;

	conductor.prototype.exists = _hasSprite;

	return conductor;
	
} );