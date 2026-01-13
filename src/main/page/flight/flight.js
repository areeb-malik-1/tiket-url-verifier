const fetch = require('node-fetch');

const urlProd = 'https://api.tiket.com/ms-gateway/tix-home/v2/page-modules-full';
const urlPreprod = '';

class FlightPage {
    constructor(accessToken, env, platform) {
        this.accessToken = accessToken;
        this.env = env;
        this.platform = platform;
    }

    getPlatform() {
        return this.platform.toLowerCase().startsWith('i') ? "IOS" : "ANDROID"
    }

    getConfig() {
        
        return {
        url: this.env === 'prod' ? urlProd : urlPreprod,
        headers: {
            'Host': 'api.tiket.com',
            'Cookie': '__cf_bm=DhD8ynGT4qBFI2CNQ6Btv_Sjfx13wFiulFFVzmojfmY-1767867758-1.0.1.1-QzBQbX.eFCYOdXp8B5eRWNaqSZu4.pJPkNtqInC6Ta7LiAW4xLdHG.ulN2t5zjy7cahT9Z6PADkScMq2s2T7VE3IOqs57rZr7LuxttlnIC9ezOOIMvzgF8uH0Smq.nCb; _cfuvid=JARHbqo74xbYSxYV3IOWyoD1MnT5mhxP3itQsEwULB8-1767867758268-0.0.1.1-604800000; session_refresh_token=eyJraWQiOiJWWUM4SnpwWVZKbEJKbExrb3VGNnFlM19Wd0J2WUtlVyJ9.eyJhdWQiOiJ0aWtldC5jb20vcnQiLCJzdWIiOiI2N2FkOTYzYTkzZGNjODJhNWY3MWYwZGYiLCJuYmYiOjE3Mzk0Mjk0MzQsImlzcyI6Imh0dHBzOi8vd3d3LnRpa2V0LmNvbSIsImV4cCI6MTc3MDk4OTQzNH0.TDTum4MN1T2I5fnOWuTNfqpoiaDtA8jMtzCU9ONhmyByn_no2sA_-e61zPZ3Yvw7',
            'containername': 'com.tiket.android.flight.presentation.landing.FlightLandingActivity',
            'screenname': 'com.tiket.android.flight.presentation.landing.FlightLandingActivity',
            'x-correlation-id': 'c5f0154e-aa0b-481a-a5c7-ad9d5b3cc3ca|1767867827472',
            'authorization': `Bearer ${this.accessToken}`,
            'deviceid': '179dd086888c94ec',
            'devicemodel': 'Xiaomi+23108RN04Y',
            'osversion': '14',
            'appversion': '5.9.1-debug-NCT-20474/play_integrity',
            'tiketsessionid': 'c5f0154e-aa0b-481a-a5c7-ad9d5b3cc3ca',
            'platform': 'ANDROID',
            'user-agent': 'Mozilla/5.0 (Linux; Android 14; 23108RN04Y Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36',
            'tiket-user-agent': 'tiketcom/android-version (twh:20296642) - v5.9.1-debug-NCT-20474/play_integrity',
            'lang': 'en',
            'currency': 'SGD',
            'accept-language': 'en',
            'x-currency': 'SGD',
            'x-country-code': 'IDN',
            'language': 'en',
            'content-type': 'application/json',
            'channelid': 'ANDROID'
          }
        }
    }

    async hitApi() {
        const {url, headers} = this.getConfig();
        const homeUrl = `${url}?availablePlatforms=ANDROID&isNotificationActive=true&pageModuleCode=HOME_V2&verticalIconVariant=control&variant=HOME_V2&vertical=HOME&headerVariant=newhome&platform=MOBILE`;
        try {
            const response = await fetch(homeUrl, {
              method: 'GET',
              headers: headers
            });
        
            console.log('\n=== Home Pages API Response ===');
            console.log('Status:', response.status);
            const contentType = response.headers.get('content-type') || '';
            
            let data;
            if (contentType.includes('application/json')) {
              data = await response.json();
              console.log('Response:', JSON.stringify(data, null, 2));
            } else {
              const text = await response.text();
              console.log('Response (non-JSON):', text.substring(0, 500));
              throw new Error(`Expected JSON but received ${contentType}. Status: ${response.status}`);
            }
            
            return { data, status: response.status };
          } catch (error) {
            console.error('Error calling home pages API:', error);
            throw error;
          }
    }
}

module.exports = FlightPage;