define( 'audioTag' , ['utils'] , function( utils ) {

	'use strict';

	var test = function( sourceURL , spriteName , spriteMap  ) {
		// instatiate

		this.audio = {};
		this.spriteMap = {};

		this.add( sourceURL , spriteName );

		// add the sprite map. This is used for when calling play. can play based on sound name as opposed to passing through start time and duration.
		this.spriteMap[ spriteName ] = spriteMap;

	};

	var _load = function( spriteName ) {

		// play Audio, this will initate load of sound file
		this.audio[ spriteName ].play();

	};

	var _add = function( sourceURL , spriteName ) {

		var _audio = new Audio(),
			_this = this;

		_audio.src = sourceURL;
		
		// set both autobuffer and preload as autobuffer is to be phased out in favour of newly defined preload attribute
		_audio.autobuffer = true;
		_audio.preload = 'auto';

		_audio.load();

		var _pauseOnLoad = function() {
			// pause audio
			_audio.pause();
			_audio.removeEventListener( 'play' , _pauseOnLoad , false );

		};

		var _initLoad = function( e ) {

			e.preventDefault();

			console.warn('loading');

			// remove eventListeners
			window.removeEventListener( 'touchStart' , _initLoad , false );
			window.removeEventListener( 'click' , _initLoad , false );

			_this.load( spriteName );

		};

		// add eventListner to listen to play event and pause, this is due to initial play being called in load method. To cater for IOS And Android
		_audio.addEventListener( 'play' , _pauseOnLoad , false );

		window.addEventListener( 'touchStart' , _initLoad , false  );
		window.addEventListener( 'click' , _initLoad, false );

		// add the newly added audio tag to the collection of audio nodes with the sprite name as the key
		_this.audio[ spriteName ] = _audio;

	};

	var _pause = function( spriteName ) {

		spriteName = spriteName || this.activeSpriteName;

		if ( !spriteName ) {
			return;
		}

		var _audio = this.audio[ spriteName ],
			pausedTime = _audio.currentTime;

		_audio.pause();

		this.playing = false;

		window.cancelAnimationFrame( this.requestAnimID );

	};

	var _volume = function( vol , spriteName ) {

		vol = ( vol && vol > 0 ) ? vol : 0;
		spriteName = spriteName || this.activeSpriteName;

		var _this = this,
			_audio = this.audio[ spriteName ];

		if ( !_audio ) {

			return;

		}
		
		_audio.volume = vol;

	};

	var _getVolume = function( spriteName ) {

		spriteName = spriteName || this.activeSpriteName;

		var _this = this,
			_audio = this.audio[ spriteName ];

		return _audio.volume || 1;
	};

	var _play = function( objSettings ) {

		var _this = this,
			_spriteName = objSettings.spriteName,
			_audio = this.audio[ _spriteName ],
			_startTime = ( objSettings.startTime ) ? objSettings.startTime : this.spriteMap[ _spriteName ].startTime,
			_endTime  = ( objSettings.endTime ) ? objSettings.endTime : this.spriteMap[ _spriteName ].endTime || _audio.duration;

		if( !_audio ) {

			return;

		}

		var progress = function () {

			_audio.removeEventListener( 'progress' , progress , false );
			
			if ( _this.updateCallback !== null && _this.playing ) {

				_this.updateCallback();

			}
		
		};

		var delayPlay = function () {

			_this.updateCallback = function () {

				_this.updateCallback = null;
				
				_audio.currentTime = _startTime;
				_audio.play();

			};

			audio.addEventListener( 'progress' , progress , false );
		
		};

		window.cancelAnimationFrame( _this.requestAnimID );

		_audio.pause();

		_this.playing = true;
		_this.activeSpriteName = _spriteName;
		_this.activeEndTime = _endTime;
		_this.updateCallback = null;
		_audio.removeEventListener('progress', progress, false);

		try {
			// try seeking to sound to play
			_startTime = ( _startTime == 0 ) ? 0.01 : _startTime; // http://remysharp.com/2010/12/23/audio-sprites/
			
			_audio.currentTime  = ( _audio.currentTime !== _startTime ) ? _startTime : _audio.currentTime;

			_audio.play();

		} catch (e) {

			delayPlay();

		}

		_this.requestAnimID = window.requestAnimationFrame( _checkTime.bind( _this ) );

	};

	var _checkTime = function( timeStamp ) {

		var audio = this.audio[ this.activeSpriteName ],
			endTime = this.activeEndTime;

		if ( audio.currentTime >= endTime ) {

			this.pause( this.activeSpriteName );

			window.cancelAnimationFrame( this.requestAnimID );

		} else {

			this.requestAnimID = window.requestAnimationFrame( _checkTime.bind( this ) );

		}

	};

	var proto = test.prototype;

	proto.play = _play;
	proto.add = _add;
	proto.load = _load;
	proto.pause = _pause;
	proto.volume = _volume;
	proto.getVolume = _getVolume;

	return test;
	
} );