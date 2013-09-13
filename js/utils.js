define( 'utils' , function() {

	var oToString = Object.prototype.toString;

	var extendObject = function( objToExtend , objToInherit , overrite ) {

		objToExtend = ( typeof objToExtend === 'object') ? objToExtend : {};
		objToInherit = ( typeof objToInherit === 'object') ? objToInherit : {};
		overrite = ( typeof overrite === 'boolean') ? overrite : true;
		
		var keys = Object.getOwnPropertyNames( objToInherit );

		keys.forEach( function( currentKey ) {

			currentKey = currentKey;

			if( currentKey && objToInherit.hasOwnProperty( currentKey ) && typeof objToInherit[ currentKey ] !== 'undefined' ) {

				if( typeof objToExtend[ currentKey ] === 'undefined' || overrite ) {

					objToExtend[ currentKey ] = objToInherit[ currentKey ];

				}

			}

		} );

		return objToExtend;

	};

	var _request = function( objSettings ) {

		var req = new XMLHttpRequest(),
			reqType = objSettings.requestType || 'GET',
			url = objSettings.url,
			responseType = objSettings.responseType,
			data = objSettings.data,
			callback = objSettings.success ,
			callBackError = objSettings.onReject,
			that = this;

		req.responseType = responseType;

		req.onreadystatechange = function () {
			
			if ( req.readyState !== 4 ) return;

			if ( req.status !== 200 && req.status !== 304 ) {

				//alert('HTTP error ' + req.status);
				that.isFunction( callBackError ) && callBackError( req );
				return;

			}
			
			that.isFunction( callback ) && callback( req );
			
		};

		req.open( reqType , url , true );

		//req.setRequestHeader("Content-Type", "application\/json;");

		req.send( data );


	};

	var getType = function( obj ) {

		return oToString.call( obj );

	};

	var _getHiddenProp = function() {
		var prefixes = ['webkit','moz','ms','o'];

		// if 'hidden' is natively supported just return it
		if ('hidden' in document) return 'hidden';

		// otherwise loop over all the known prefixes until we find one
		for (var i = 0; i < prefixes.length; i++){
			if ((prefixes[i] + 'Hidden') in document) 
				return prefixes[i] + 'Hidden';
		}

		// otherwise it's not supported
		return null;
	};

	var _tabIsHidden = function() {

		var prop = _getHiddenProp();
		
		if ( !prop ) return false;

		return document[prop];
	};

	var _clearTimeouts = function( arrTimeoutID ) {

		if ( !Array.isArray( arrTimeoutID ) ) {

			return;

		}

		arrTimeoutID.forEach( function( timeoutID ) {

			window.clearTimeout( timeoutID );

		} );

		arrTimeoutID.length = 0;

	};

	return {

		isFunction : function( objFunc ) {

			return getType( objFunc ) === '[object Function]';

		},

		isString : function( objFunc ) {

			return getType( objFunc ) === '[object String]';

		},

		isObject : function( objFunc ) {

			return getType( objFunc ) === '[object Object]';

		},

		isUndefined : function( objFunc ) {

			return getType( objFunc ) === '[object Undefined]';

		},

		request : _request,

		extend : extendObject,

		getHiddenProp : _getHiddenProp,

		tabIsHidden : _tabIsHidden,

		clearTimeouts : _clearTimeouts

	};
		
} );