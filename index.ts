import fs from 'fs';
import aws from 'aws-sdk';
import maxmind, { CityResponse } from 'maxmind';
import { CloudFrontResponseEvent, Context, Callback } from 'aws-lambda';

// Get db path from env vars.
const bucket: string = process.env.EDGEO_BUCKET || '';
const path: string = process.env.EDGEO_PATH || '';
const db: string = process.env.EDGEO_DB || 'GeoLite2-City.mmdb';

// Get and cache mmdb file.
const fetchDb = (callback: Function) => {
	try {
		// Check we already have the db file.
		fs.accessSync(`/tmp/${db}`, fs.constants.R_OK);
		callback();
	} catch (error) {
		// Fetch and store db.
		const s3 = new aws.S3({
			region: 'us-east-1',
		});
		s3.getObject({
			Bucket: bucket,
			Key: `${path}/${db}`,
		}, (error, data) => {
			console.log(error);
			if (error) {
				callback();
				return;
			}
			fs.writeFile(`/tmp/${db}`, data.Body, (error) => {
				if (error) {
					console.log(error);
				}
				callback();
			});
		});
	}
};

const lookupIp = (ip: string) => (callback: Function) => {
	maxmind.open<CityResponse>(`/tmp/${db}`, (error, lookup) => {
		if (error) {
			console.log(error);
			callback(null, true);
			return;
		}

		const result = lookup.get(ip);

		callback(result);
	});
};

exports.handler = (event: CloudFrontResponseEvent, context: Context, callback: Callback) => {
	const { request, response } = event.Records[0].cf;
	const headers = response.headers;

	fetchDb(() => lookupIp(request.clientIp)( (result?: CityResponse, error?: boolean) => {
		if (error) {
			callback(null, response);
			return;
		}

		headers['x-client-location-timezone'] = [{
			key: 'X-Client-Location-Timezone',
			value: (result && result.location && result.location.time_zone) || '',
		}];
		headers['x-client-location-contintent'] = [{
			key: 'X-Client-Location-Continent',
			value: (result && result.continent && result.continent.code) || '',
		}];
		headers['x-client-location-country'] = [{
			key: 'X-Client-Location-Country',
			value: (result && result.country && result.country.iso_code) || '',
		}];
		headers['x-client-location-city'] = [{
			key: 'X-Client-Location-City',
			value: (result && result.city && result.city.names && result.city.names.en) || '',
		}];
		headers['x-client-location-latitude'] = [{
			key: 'X-Client-Location-Latitude',
			value: String((result && result.location && result.location.latitude) || ''),
		}];
		headers['x-client-location-longitude'] = [{
			key: 'X-Client-Location-Longitude',
			value: String((result && result.location && result.location.longitude) || ''),
		}];
		headers['x-client-location-postalcode'] = [{
			key: 'X-Client-Location-PostalCode',
			value: (result && result.postal && result.postal.code) || '',
		}];
		headers['x-client-location-region'] = [{
			key: 'X-Client-Location-Region',
			value: (result && result.subdivisions && result.subdivisions[0].iso_code) || '',
		}];
		headers['x-client-location-eu'] = [{
			key: 'X-Client-Location-EU',
			value: (result && result.country && result.country.is_in_european_union) ? '1' : '0',
		}];

		callback(null, response);
	}));
};
