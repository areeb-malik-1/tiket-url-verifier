const fetch = require('node-fetch');

const urlProd = 'https://api.tiket.com/ms-gateway/tix-home/v2/home-pages';
const urlPreprod = 'https://preprod.tiket.com/ms-gateway/tix-home/v2/home-pages';

class HomePage {
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
            'authorization': `Bearer ${this.accessToken}`,
            'X-Country-Code': 'IDN',
            'X-Account-Id': 'asdad',
            'Accept': 'application/json',
            'X-Channel-Id': 'ANDROID',
            'X-Request-Id': '23123123',
            'User-Agent': 'tiketcom/android-version (twh:20296642) - v5.4.0',
            'currency': 'IDR',
            'Accept-Language': 'en'
          }
        }
    }

    async hitApi() {
        const {url, headers} = this.getConfig();
        const homeUrl = `${url}?availablePlatforms=ANDROID&isNotificationActive=true&pageModuleCode=HOME_V2&verticalIconVariant=control&variant=HOME_V2&vertical=HOME&headerVariant=newhome&platform=MOBILE`;
        console.log("homeapi full url: " + homeUrl);
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

module.exports = HomePage;