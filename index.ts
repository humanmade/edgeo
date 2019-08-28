import fs from 'fs';
import { request } from 'http';
import { promisify } from 'util';
import { CloudFrontResponseEvent, Context, Callback, CloudFrontHeaders } from 'aws-lambda';

interface IPData {
	message?: string;
	as: string;
	city: string;
	continentCode: string;
	country: string;
	countryCode: string;
	currency: string;
	district: string;
	isp: string;
	lat: number;
	lon: number;
	mobile: boolean;
	org: string;
	proxy: boolean;
	query: string;
	region: string;
	regionName: string;
	status: string;
	timezone: string;
	zip: string;
}

const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const fetch = (url: string): Promise<string> => new Promise( (resolve, reject) => {
	const req = request(url, (res) => {
		let data = '';
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			data = `${data}${chunk}`;
		});
		res.on('end', () => {
			resolve(data);
		});
	});

	req.on('error', (error) => {
		reject(error);
	});

	// Write data to request body
	req.end();
});

const getAPIUrl = (ip: string): string => {
	if (process.env.API_KEY) {
		return `https://pro.ip-api.com/json/${ip}?fields=11268095&key=${process.env.API_KEY}`;
	}
	return `http://ip-api.com/json/${ip}?fields=11268095`;
}

const lookupIp = async (ip: string): Promise<IPData> => {
	let cached = true;
	try {
		await access(`/tmp/${ip}.json`, fs.constants.R_OK);
	} catch (error) {
		cached = false;
	}
	let result: string = '';
	if (cached) {
		result = await readFile(`/tmp/${ip}.json`, 'utf8');
	} else {
		result = await fetch(getAPIUrl(ip));
		await writeFile(`/tmp/${ip}.json`, result);
	}
	return JSON.parse( result );
};

const setHeaders = (headers: CloudFrontHeaders, data: IPData): CloudFrontHeaders => {
	headers['x-client-location-timezone'] = [{
		key: 'X-Client-Location-Timezone',
		value: data.timezone || '',
	}];
	headers['x-client-location-contintent'] = [{
		key: 'X-Client-Location-Continent',
		value: data.continentCode || '',
	}];
	headers['x-client-location-country'] = [{
		key: 'X-Client-Location-Country',
		value: data.countryCode || '',
	}];
	headers['x-client-location-city'] = [{
		key: 'X-Client-Location-City',
		value: data.city || '',
	}];
	headers['x-client-location-latitude'] = [{
		key: 'X-Client-Location-Latitude',
		value: String(data.lat || ''),
	}];
	headers['x-client-location-longitude'] = [{
		key: 'X-Client-Location-Longitude',
		value: String(data.lon || ''),
	}];
	headers['x-client-location-postalcode'] = [{
		key: 'X-Client-Location-PostalCode',
		value: data.zip || '',
	}];
	headers['x-client-location-region'] = [{
		key: 'X-Client-Location-Region',
		value: data.region || '',
	}];
	headers['x-client-location-currency'] = [{
		key: 'X-Client-Location-Currency',
		value: data.currency || '',
	}];
	headers['x-client-location-mobile'] = [{
		key: 'X-Client-Location-Mobile',
		value: data.mobile ? '1' : '0',
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
