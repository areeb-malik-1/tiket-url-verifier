const slack = require("../main/io/slack.js");
const LoginPage = require("../main/page/auth/login.js");
const ServiceTiket = require("../main/page/auth/servicetiket.js");
const VerifyPage = require("../main/page/auth/verify.js");
const FlightPage = require("../main/page/flight/flight.js");
const HomePage = require("../main/page/home/home.js");
const {
  findAllUrls,
  verifyIconUrls,
  verifyClickUrls,
  findAllEndpoints,
} = require("../main/verify/verifyurls.js");

async function test() {
  const env = "prod";
  const platform = "android";
  const baseUrl =
    env === "prod" ? "https://www.tiket.com" : "https://preprod.tiket.com";
  // const loginPage = new LoginPage(
  //   "travelmanager@yopmail.com",
  //   "Testing123!",
  //   env
  // );
  const loginPage = new LoginPage('Yanuar.kurniawan@tiket.com', 'Testing123', env);
  var { response, data } = await loginPage.hitApi();
  const authCode = loginPage.extractAuthCode(response, data);
  console.log("Auth Code: " + authCode);
  const verifyPage = new VerifyPage(authCode, env);
  var { data, status, serviceTicket } = await verifyPage.hitApi();
  console.log("Service Ticket: " + serviceTicket);
  const serviceTiketPage = new ServiceTiket(serviceTicket, env);
  var { data, status, accessToken } = await serviceTiketPage.hitApi();
  console.log("Auth Token: " + accessToken);

  const Apis = [
    {
      page: new HomePage(accessToken, env, platform),
      iconKeys: ["iconUrl", "imageUrl"],
      clickKeys: ["clickUrl"],
    },
    {
      page: new FlightPage(accessToken, env, platform),
      iconKeys: ["iconUrl", "imageUrl"],
      clickKeys: ["clickUrl"],
    },
  ];

  for (const api of Apis) {
    const clickKeys = api.clickKeys;
    console.log(clickKeys);
    const { data, status } = await api.page.hitApi();
    console.log("Data: " + JSON.stringify(data, null, 2));

    console.log("clickKyes: " + api.clickKeys);

    for (const key of api.iconKeys) {
      const iconUrls = findAllUrls(data, key);
      console.log('key: ' + key);
      console.log(key + "s: " + clickUrls.length);
      const { result, failedUrls } = await verifyIconUrls(iconUrls);
      for (const url of failedUrls) {
        await slack(url);
      }
    }

    for (const key in api.clickKeys) {
      const clickUrls = findAllEndpoints(data, key);
      console.log('key: ' + key);
      console.log(key + "s: " + clickUrls.length);
      const { result, failedUrls } = await verifyClickUrls(clickUrls, baseUrl);
      for (const url of failedUrls) {
        await slack(url);
      }
    }
  }
}
test();
