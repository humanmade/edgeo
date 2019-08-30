import fs from 'fs';
import AWS from 'aws-sdk';
import { promisify } from 'util';
import { CloudFrontResponseEvent, Context, Callback, CloudFrontHeaders } from 'aws-lambda';

const lambda = new AWS.Lambda({
	region: 'us-east-1',
});

interface IPData {
	city: string;
	continent: string;
	country: string;
	latitude: number;
	longitude: number;
	region: string;
	time_zone: string;
	postal_code: string;
}

const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const lookupIp = (ip: string): Promise<IPData> => new Promise( async ( resolve, reject ) => {
	let cached = true;
	try {
		await access(`/tmp/${ip}.json`, fs.constants.R_OK);
	} catch (error) {
		cached = false;
	}
	let result: string = '';
	if (cached) {
		result = await readFile(`/tmp/${ip}.json`, 'utf8');
		resolve( JSON.parse( result ) );
	} else {
		lambda.invoke({
			FunctionName: 'edgeo-lookup',
			InvocationType: 'RequestResponse',
			Payload: JSON.stringify(ip),
		}, async (error, data) => {
			if (!error && !data.FunctionError) {
				result = String(data.Payload || 'false');
				await writeFile(`/tmp/${ip}.json`, result);
				resolve( JSON.parse( result ) );
			} else {
				reject(error || data.FunctionError);
			}
		});
	}
});

const setHeaders = (headers: CloudFrontHeaders, data: IPData): CloudFrontHeaders => {
	headers['x-client-location-timezone'] = [{
		key: 'X-Client-Location-Timezone',
		value: data.time_zone || '',
	}];
	headers['x-client-location-continent'] = [{
		key: 'X-Client-Location-Continent',
		value: data.continent || '',
	}];
	headers['x-client-location-country'] = [{
		key: 'X-Client-Location-Country',
		value: data.country || '',
	}];
	headers['x-client-location-city'] = [{
		key: 'X-Client-Location-City',
		value: data.city || '',
	}];
	headers['x-client-location-latitude'] = [{
		key: 'X-Client-Location-Latitude',
		value: String(data.latitude || ''),
	}];
	headers['x-client-location-longitude'] = [{
		key: 'X-Client-Location-Longitude',
		value: String(data.longitude || ''),
	}];
	headers['x-client-location-postalcode'] = [{
		key: 'X-Client-Location-PostalCode',
		value: data.postal_code || '',
	}];
	headers['x-client-location-region'] = [{
		key: 'X-Client-Location-Region',
		value: data.region || '',
	}];
	return headers;
}

exports.handler = async (event: CloudFrontResponseEvent, context: Context, callback: Callback) => {
	const { request, response } = event.Records[0].cf;
	const { headers } = response;
	const { clientIp } = request;

	try {
		const data = await lookupIp(clientIp);
		setHeaders(headers, data);
	} catch (error) {
		console.log(error);
	}

	callback(null, response);
};
