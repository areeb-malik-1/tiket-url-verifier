const LoginPage = require('../main/page/auth/login.js');
const ServiceTiket = require('../main/page/auth/servicetiket.js');
const VerifyPage = require('../main/page/auth/verify.js');
const FlightPage = require('../main/page/flight/flight.js');
const HomePage = require('../main/page/home/home.js');
const { findAllUrls, verifyIconUrls, verifyClickUrls, findAllEndpoints } = require('../main/verify/verifyurls.js');

async function test() {
    const env = 'prod';
    const platform = 'android';
    const baseUrl = env === 'prod' ? 'https://www.tiket.com' : 'https://preprod.tiket.com';
    //const loginPage = new LoginPage('travelmanager@yopmail.com', 'Testing123!', env);
    const loginPage = new LoginPage('Yanuar.kurniawan@tiket.com', 'Testing123', env);
    var {response, data} = await loginPage.hitApi();
    const authCode = loginPage.extractAuthCode(response, data);
    console.log('Auth Code: ' + authCode);
    const verifyPage = new VerifyPage(authCode, env);
    var {data, status, serviceTicket} = await verifyPage.hitApi();
    console.log('Service Ticket: ' + serviceTicket);
    const serviceTiketPage = new ServiceTiket(serviceTicket, env);
    var {data, status, accessToken} = await serviceTiketPage.hitApi()
    console.log('Auth Token: ' + accessToken);

    const homePage = new HomePage(accessToken, env, platform);
    var {data, status} = await homePage.hitApi();
    console.log('HomepageData: ' + JSON.stringify(data, null, 2));
    var iconUrls = findAllUrls(data, 'iconUrl');
    var imageUrls = findAllUrls(data, 'imageUrl');
    var clickUrls = findAllEndpoints(data, 'clickUrl');
    console.log('iconUrls: ' + iconUrls.length);
    console.log('imageUrls: ' + imageUrls.length);
    console.log('clickUrls: ' + clickUrls.length);
    await verifyIconUrls(iconUrls);
    await verifyIconUrls(imageUrls);
    await verifyClickUrls(clickUrls, baseUrl);

    const flightPage = new FlightPage(accessToken, env, platform);
    var {data, status} = await flightPage.hitApi();
    console.log('FlightPageData: ' + JSON.stringify(data, null, 2));
    var iconUrls = findAllUrls(data, 'iconUrl');
    var imageUrls = findAllUrls(data, 'imageUrl');
    var clickUrls = findAllEndpoints(data, 'clickUrl');
    console.log('iconUrls: ' + iconUrls.length);
    console.log('imageUrls: ' + imageUrls.length);
    console.log('clickUrls: ' + clickUrls.length);
    await verifyIconUrls(iconUrls);
    await verifyIconUrls(imageUrls);
    await verifyClickUrls(clickUrls, baseUrl);
}

test();
