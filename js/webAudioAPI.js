define( 'webAudioAPI' , [ 'utils' ] , function( utils ) {

	'use strict';

	window.AudioContext = window.AudioContext || window.webkitAudioContext;

	var context = new AudioContext();

	var test = function( sourceURL , spriteName , spriteMap ) {

		var _this = this;

		_this.audio = {};
		_this.spriteMap = {};

		_this.context = context;

		// create master gain node that all nodes connect to. this allows controlling overall volume as we ass allowing to control individual sounds
		_this.masterGain = context.createGain();

		_this.masterGain.connect( context.destination );

		_this.add( sourceURL , spriteName , spriteMap );

		_this.initialSpriteName = spriteName;

		_initLoad = _initLoad.bind( this );

		window.addEventListener( 'touchstart' , _initLoad , false );
		window.addEventListener( 'click' , _initLoad , false );

	};

	var _createSource = function( spriteName ) {

		var _this = this,
			_context = _this.context,
			_audio = _this.audio[ spriteName ],
			_source = _context.createBufferSource(),
			_gain = _context.createGain(),
			currentVol = ( _audio.gain ) ? _audio.gain.gain.value : _this.masterGain.gain.value;

			if( !_audio ) {

				return;

			}

			_source.buffer = _audio.buffer;

			// connect source to gain, then connect gain to master gain
			_source.connect( _gain );
			_gain.connect( _this.masterGain );

			_gain.gain.value = _audio.volume || 1;

			_audio.source = _source;
			_audio.gain = _gain;

			// set volume of newly created gain node to the old value, else use the value of the master gain node as a default
			_this.volume( currentVol , spriteName );

	};

	var _load = function( spriteName ) {

		var _this = this,
			_audio = _this.audio[ spriteName ],
			reqSettings = {
			
			url : _audio.sourceURL,
			responseType : 'arraybuffer',
			success : function( reg ) {
				_this.context.decodeAudioData( reg.response , function( buffer ) {

					console.warn( 'loaded' );

					_audio.buffer = buffer;
					
					_audio.hasLoaded = true;

				} );
			
			}
		
		};

		utils.request( reqSettings );

	};

	var _initLoad = function( e ) {

		e.preventDefault();

		var _this = this,
			_spriteName = _this.initialSpriteName,
			_audio = _this.audio[ _spriteName ];

		if( !_audio.hasLoaded ){

			return;

		}

		console.log( 'init started' );

		//mute the main volume so no sound is hear. this is to allow "initial" play
		_this.volume( 0 );
		
		// play 1sec of the sound
		_this.play( { spriteName : _spriteName , startTime : 0 , endTime : 1 } );

		//_pause the sound
		_this.pause( _spriteName );

		// clean up created instances as is effecting playback
		_audio.source = null;
		_audio.gain = null;

		//reset the volume to 1
		_this.volume( 1 );

		window.removeEventListener( 'touchstart' , _initLoad , false  );
		window.removeEventListener( 'click' , _initLoad , false  );

	};

	var _add = function( sourceURL , spriteName , spriteMap ) {

		if ( !sourceURL ) {

			return;

		}

		var _this = this;

		// create empty object for new source
		_this.audio[ spriteName ] = Object.create( {} );

		_this.audio[ spriteName ].sourceURL = sourceURL;

		// add the sprite map. This is used for when calling play. can play based on sound name as opposed to passing through start time and duration.
		_this.spriteMap[ spriteName ] = spriteMap;

		// add auto-load bool to allow for defering request
		_this.load( spriteName );

	};


	var _pause = function( spriteName ) {

		var _this = this,
			_audio = _this.audio[ spriteName ];

		// ensure there is an object for the given sprite name. if not initiate fallback
		if ( !_audio ) {

			// checks to see if no sprite name, if not, loop through all and stop all sounds.
			if ( !spriteName ) {
			
				Object.keys( _this.audio ).forEach( function( currentSprite ) {

					var _currentAudio = _this.audio[ currentSprite ];

					// check if the audio is playing, if so stop
					_currentAudio.playing && _this.pause( currentSprite );

				} );
			}

			return;
		
		}

		_audio.source.stop(0);
		_audio.isPlaying = false;

		// stop the source and recreate. this is due to the fact that a source can not be played once it has completed 

	};


	var _volume = function( vol , spriteName ) {

		vol = vol || 0;

		var _this = this,
			_audio = _this.audio[ spriteName ],
			_gain = ( _audio && _audio.gain ) ? _audio.gain : _this.masterGain;

		if ( !_gain ) {

			return;
			
		}

		_gain.gain.value = vol;

	};

	var _getVolume = function( spriteName ) {

		var _this = this,
			_audio = _this.audio[ spriteName ],
			_gain = ( _audio ) ? _audio.gain.gain.gain : _this.masterGain.gain ;

			return _gain.value;

	};
	
	// spriteName , startTime , endTime
	var _play = function( objSettings ) {


		var	_this = this,
			_spriteName = objSettings.spriteName,
			_audio = this.audio[ _spriteName ],
			_buffer = _audio.buffer,
			_startTime = ( !utils.isUndefined( objSettings.startTime ) ) ? objSettings.startTime : _this.spriteMap[ _spriteName ].startTime || 0,
			_endTime  = ( !utils.isUndefined( objSettings.endTime ) ) ? objSettings.endTime : this.spriteMap[ _spriteName ].endTime || _buffer.duration,
			_source;

		// create a new bufferSource so that the given sound can play.
		_createSource.call( this , _spriteName );

		_source = _audio.source;
		
		// ensure that the start time doesn't extend past the duration of the buffer and that the source exists
		if ( !_source || _startTime >= _buffer.duration || _endTime < _startTime ) {

			return;

		}

		// specify that the given audio instance is playing
		_audio.playing = true;

		// play source at given point for a given period of time
		_source.start( 0 , _startTime , _endTime - _startTime );

	};

	var _destroy = function() {

	};

	var _clearScheduledChanges = function( startTime , spriteName ) {

		startTime = ( utils.isNumber( startTime ) ) ? startTime : 0;

		var _this = this,
			_audio = _this.audio[ spriteName ],
			_gain = ( _audio && _audio.gain ) ? _audio.gain : _this.masterGain;

		_gain.gain.cancelScheduledValues( startTime );

	};

	var proto = test.prototype;

	proto.load = _load;

	proto.add = _add;

	proto.play = _play;
	
	proto.pause = _pause;
	
	proto.volume = _volume;
	
	proto.getVolume = _getVolume;
	
	proto.destroy = _destroy;
	
	proto.clearScheduledChanges = _clearScheduledChanges;

	return test;

} );