import fs from 'fs';
import aws from 'aws-sdk';
import maxmind, { CityResponse } from 'maxmind';
import { APIGatewayEvent, Context, Callback } from 'aws-lambda';

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
			if (error) {
				console.log(error);
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
			callback(null, error);
			return;
		}

		const result = lookup.get(ip);

		callback(result);
	});
};

exports.handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
	const ip = event.pathParameters && event.pathParameters.proxy;

	if (!ip) {
		callback('No IP address provided.');
		return;
	}

	fetchDb(() => lookupIp(ip)( (result?: CityResponse, error?: any) => {
		if (error) {
			callback(error);
			return;
		}

		callback(null, result);
	}));
};
