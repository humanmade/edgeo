import maxmind, { CityResponse } from 'maxmind';
import { Context, Callback } from 'aws-lambda';

const lookupIp = async (ip: string): Promise<CityResponse | null> => {
	const lookup = await maxmind.open<CityResponse>(`./dbs/${process.env.EDGEO_DB || 'GeoLite2-City.mmdb'}`);
	const result = lookup.get(ip);
	return result;
};

exports.handler = async (ip: string, context: Context, callback: Callback) => {
	try {
		const result = await lookupIp(ip);
		const data = {
			time_zone: (result && result.location && result.location.time_zone) || '',
			continent: (result && result.continent && result.continent.code) || '',
			country: (result && result.country && result.country.iso_code) || '',
			city: (result && result.city && result.city.names && result.city.names.en) || '',
			latitude: String((result && result.location && result.location.latitude) || ''),
			longitude: String((result && result.location && result.location.longitude) || ''),
			postal_code: (result && result.postal && result.postal.code) || '',
			region: (result && result.subdivisions && result.subdivisions[0].iso_code) || '',
			is_in_eu: (result && result.country && result.country.is_in_european_union) ? '1' : '0',
		};
		callback(null, data);
	} catch (error) {
		callback(error);
	}
};
