import maxmind, { CityResponse } from 'maxmind';
import { CloudFrontResponseEvent, Context, Callback } from 'aws-lambda';

exports.handler = async ( event: CloudFrontResponseEvent, context: Context, callback: Callback ) => {

	const { request, response } = event.Records[ 0 ].cf;
	const headers = response.headers;
	const lookup = await maxmind.open<CityResponse>( `./dbs/GeoLite2-City.mmdb` );
	const result = lookup.get( request.clientIp );

	headers[ 'x-client-location-timezone' ] = [ {
		key: 'X-Client-Location-Timezone',
		value: ( result && result.location && result.location.time_zone ) || '',
	} ];
	headers[ 'x-client-location-contintent' ] = [ {
		key: 'X-Client-Location-Continent',
		value: ( result && result.continent && result.continent.code ) || '',
	} ];
	headers[ 'x-client-location-country' ] = [ {
		key: 'X-Client-Location-Country',
		value: ( result && result.country && result.country.iso_code ) || '',
	} ];
	headers[ 'x-client-location-city' ] = [ {
		key: 'X-Client-Location-City',
		value: ( result && result.city && result.city.names && result.city.names.en ) || '',
	} ];
	headers[ 'x-client-location-latitude' ] = [ {
		key: 'X-Client-Location-Latitude',
		value: String( result && result.location && result.location.latitude ) || '',
	} ];
	headers[ 'x-client-location-longitude' ] = [ {
		key: 'X-Client-Location-Longitude',
		value: String( result && result.location && result.location.longitude ) || '',
	} ];
	headers[ 'x-client-location-postalcode' ] = [ {
		key: 'X-Client-Location-PostalCode',
		value: ( result && result.postal && result.postal.code ) || '',
	} ];
	headers[ 'x-client-location-region' ] = [ {
		key: 'X-Client-Location-Region',
		value: ( result && result.subdivisions && result.subdivisions[ 0 ].iso_code ) || '',
	} ];
	headers[ 'x-client-location-eu' ] = [ {
		key: 'X-Client-Location-EU',
		value: ( result && result.country && result.country.is_in_european_union ) ? '1' : '0',
	} ];

	callback( null, response );
};
