Edgeo
=====

A Lambda function for fetching Geo Location data by IP.

Powered by the free [MaxMind GeoLite2 GeoIP database](https://dev.maxmind.com/geoip/geoip2/geolite2/) and [node-maxmind](https://github.com/runk/node-maxmind).

## Output

As an example the IP address `185.93.2.163` will yield:

```json
{
  "city": {
    "geoname_id": 2988507,
    "names": {
      "de": "Paris",
      "en": "Paris",
      "es": "París",
      "fr": "Paris",
      "ja": "パリ",
      "pt-BR": "Paris",
      "ru": "Париж",
      "zh-CN": "巴黎"
    }
  },
  "continent": {
    "code": "EU",
    "geoname_id": 6255148,
    "names": {
      "de": "Europa",
      "en": "Europe",
      "es": "Europa",
      "fr": "Europe",
      "ja": "ヨーロッパ",
      "pt-BR": "Europa",
      "ru": "Европа",
      "zh-CN": "欧洲"
    }
  },
  "country": {
    "geoname_id": 3017382,
    "is_in_european_union": true,
    "iso_code": "FR",
    "names": {
      "de": "Frankreich",
      "en": "France",
      "es": "Francia",
      "fr": "France",
      "ja": "フランス共和国",
      "pt-BR": "França",
      "ru": "Франция",
      "zh-CN": "法国"
    }
  },
  "location": {
    "accuracy_radius": 100,
    "latitude": 48.9335,
    "longitude": 2.3661,
    "time_zone": "Europe/Paris"
  },
  "postal": {
    "code": "93200"
  },
  "registered_country": {
    "geoname_id": 3077311,
    "is_in_european_union": true,
    "iso_code": "CZ",
    "names": {
      "de": "Tschechien",
      "en": "Czechia",
      "es": "República Checa",
      "fr": "République tchèque",
      "ja": "チェコ共和国",
      "pt-BR": "Tchéquia",
      "ru": "Чешская Республика",
      "zh-CN": "捷克共和国"
    }
  },
  "subdivisions": [
    {
      "geoname_id": 3012874,
      "iso_code": "IDF",
      "names": {
        "de": "Île-de-France",
        "en": "Île-de-France",
        "es": "Isla de Francia",
        "fr": "Île-de-France",
        "pt-BR": "Ilha de França"
      }
    },
    {
      "geoname_id": 2968815,
      "iso_code": "75",
      "names": {
        "de": "Paris",
        "en": "Paris",
        "es": "Paris",
        "fr": "Paris"
      }
    }
  ]
}
```

## Usage

After cloning this repo you will need to do the following:

1. Upload a [MaxMind GeoIP database from here](https://dev.maxmind.com/geoip/geoip2/geolite2/) to S3
1. `npm install`
2. `npm run tsc`
3. `npm run build-zip`

You will then have a `lambda.zip` file ready to be uploaded to AWS. The file should be ~60kb and can be uploaded through the AWS console.

When configuring the lambda function use the following settings:

- Handler: "build/index.handler"
- Timeout: 5 minutes
- Memory: 640mb
- Environment variables:
  - `EDGEO_BUCKET`: your S3 bucket
  - `EDGEO_PATH`: path inside the bucket to a directory of databases
  - `EDGEO_DB`: database file name
- Execution role: Ensure this has read access to the S3 bucket and path using an IAM policy like so:
  ```json
  {
    "Effect": "Allow",
    "Action": [
      "s3:GetObject"
    ],
    "Resource": [
      "arn:aws:s3:::<bucket>/<path>/*"
    ]
  }
  ```

## Testing

Ensure you have an appropriate `.aws/credentials` file set up with an access key and secret that can access the file on S3. Using the AWS CLI you can create this file by running `aws configure`.

Afterwards create a `.env` file and add the following environment variables:

```
EDGEO_BUCKET=<your bucket>
EDGEO_PATH=<path to directory of databases>
EDGEO_DB=<database file name>
```

## Roadmap

- Support additional results for ISP, Connection type, anonymous IP
