const args = process.argv.slice(2);

const params = {};
args.forEach(arg => {
  const [key, value] = arg.replace('--', '').split('=');
  params[key] = value;
});

console.log(params);

let baseUrl;
let loginUrl;
let verificationUrl;
let serviceTicketUrl;
let homePagesUrl;

if (params.env === 'preprod') {
  baseUrl = 'https://preprod.tiket.com';
  loginUrl = 'https://sandbox.bliblitiket.com/gateway/gks-unm-go-be/api/v1/auth/login';
  verificationUrl = 'https://sandbox.bliblitiket.com/gateway/gks-unm-go-be/api/v1/auth/code/verify';
  serviceTicketUrl = 'https://member-core-v2-be-svc.preprod-platform-cluster.tiket.com/tix-member-core/v3/auth/unm/service-ticket';
  homePagesUrl = 'https://preprod.tiket.com/ms-gateway/tix-home/v2/home-pages';
} else if(params.env === 'prod') {
  baseUrl = 'https://www.tiket.com';
  loginUrl = 'https://account.bliblitiket.com/gateway/gks-unm-go-be/api/v1/auth/login';
  verificationUrl = 'https://account.bliblitiket.com/gateway/gks-unm-go-be/api/v1/auth/code/verify';
  serviceTicketUrl = 'https://api.tiket.com/ms-gateway/tix-member-core/v3/auth/unm/service-ticket';
  homePagesUrl = 'https://tiket.com/ms-gateway/tix-home/v2/home-pages'
} else {
  throw new Error('Invalid environment');
}

async function callLoginAPI() {
  
  const headers = {
    'X-Country-Code': 'ID',
    'Cookie': 'device_id=53401112-03e1-461d-8143-4d60d76d1262-dont-change; Path=/; Domain=staging.bliblitiket.com; HttpOnly; Secure',
    'X-Client-Id': '9dc79e3916a042abc86c2aa525bff009',
    'X-City': 'ID',
    'X-Request-Id-123123123': '',
    'Accept-Language': 'en',
    'True-Client-Ip': '127.0.0.1',
    'accept': 'application/json',
    'Content-Type': 'application/json'
  };

  const headersProd = {
    'accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'X-Client-Id': '9dc79e3916a042abc86c2aa525bff009',
    'Accept-Language': 'en',
    'Content-Type': 'application/json',
    'Cookie': 'unm_device_id=8db0a266-80f0-4022-a189-548d46a20e9d; entity=tiket; shared_storage_bliblitiket-com-analytic=%7B%22utmCampaign%22%3A%22none%22%2C%22utmExternal%22%3A%22external%22%2C%22utmMedium%22%3A%22none%22%2C%22utmSource%22%3A%22none%22%2C%22referrer%22%3A%22none%22%2C%22fbclid%22%3A%22%22%2C%22gclid%22%3A%22%22%7D; _ga=GA1.1.1995835216.1761025416; enabledPasskey=on; AMP_12fecdb0db=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjJub25lJTIyJTJDJTIydXNlcklkJTIyJTNBMCUyQyUyMnNlc3Npb25JZCUyMiUzQTE3NjQ3NjQ4MzgxMDYlMkMlMjJvcHRPdXQlMjIlM0FmYWxzZSUyQyUyMmxhc3RFdmVudFRpbWUlMjIlM0ExNzY0NzY0ODM4MTA3JTJDJTIybGFzdEV2ZW50SWQlMjIlM0ExNjAlN0Q=; AMP_7db88c71bd=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIxMDVlNDU4ZC00MTEwLTQzYmQtYmU5MS1kZjZlMGVjNTMwZGUlMjIlMkMlMjJ1c2VySWQlMjIlM0EwJTJDJTIyc2Vzc2lvbklkJTIyJTNBMTc2NjM4MTkyODA1OSUyQyUyMm9wdE91dCUyMiUzQWZhbHNlJTJDJTIybGFzdEV2ZW50VGltZSUyMiUzQTE3NjYzODE5NTc2MjglMkMlMjJsYXN0RXZlbnRJZCUyMiUzQTUwJTdE; _ga_CYXQFXTBW8=GS2.1.s1766381928$o12$g1$t1766381963$j25$l0$h0; _ga_M865CMWYXJ=GS2.1.s1766381928$o5$g1$t1766381963$j25$l0$h0; dash_unm_session_access_token=eyJhbGciOiJFZERTQSIsImtpZCI6ImJ4YlVDT1pPY3FrIiwidHlwIjoiSldUIn0.eyJfdGNzIjoibm9uZSIsIl90cnMiOiJub25lIiwiYWNjZXNzIjpbMjA5NzE1MSwwLDAsMF0sImVtYWlsIjoieWFudWFyLmt1cm5pYXdhbkB0aWtldC5jb20iLCJlbnRpdHkiOiJUSUtFVCIsImV4cCI6MTc2Nzc3NTE0NCwiaWF0IjoxNzY3NjAyMzQ0LCJpc1N1cGVyVXNlciI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vc2FuZGJveC5ibGlibGl0aWtldC5jb20iLCJqdGkiOiJud3dtNGNJeFc2RkxxZFZzaDQ1SzZwVDEyUjQ5enFUZSIsIm5iZiI6MTc2NzYwMjM0NCwicm9sZUlkIjoxMDAwMCwic2Vzc2lvbklkIjoibnd3bTRjSXhXNkZMcWRWc2g0NUs2cFQxMlI0OXpxVGUiLCJzdWIiOiIxMDAwMDgyIiwidXNlcklkIjoxMDAwMDgyfQ.hy4ri4xu9dNZjX7rRwDmy1pOtaDKYQ0rAZ7tNSCUS4zU7Zwse_A4JznZ6vfWYWpSpGimR3En0rldwXc1ataUDw; dash_unm_userlang=en; _cfuvid=xptetbH7a9IdNCAmblPQDj8ExwXv7Jhir7LlKgEHHUc-1767692490784-0.0.1.1-604800000; dash_unm_tix_logger_correlation_id=3875ac7e-0701-4f45-a51e-15e09593c704; device_id=105e458d-4110-43bd-be91-df6e0ec530de; userlang=en; unm_cc=SG; cf_clearance=HJ9LH1cV_oEMZKyxNY2ba5aqpjmOUrS7IFII5oFH6g4-1767770490-1.2.1.1-liJgvpfnd_eOfVkhu5fDpPlBL.pv6GkWY.hg6AEvkfgLBPYDrbqo3IwUiiEwPu7CpzuO7UGQ77RFx13baK.VesceEcVUsy1JnOTyvSm8aWCYEJ5GHXqSNHPKLf0tSwmdeb7WXWvpKzP7VanCs7cIpJaq1zfczpL_jwXWyNyXy8SqlqdQGMTBCJfiYfit0QPuqMUgn6e4o5ZDmCm3UJ9TJbbJxGoWIr.78V6zhlRzrNA; fbsr_176613702824432=85fzp7RmJi6h_3nNeR0dy4Omxut8QHiY6XvCdgXqUtA.eyJ1c2VyX2lkIjoiMTIyMTQ0NjM5NzMyMDExMTYwIiwiY29kZSI6IkFRQ3NHd2ZSNlNMTmtkb3lXUkpyMFFIYjNtLVlTaGJBMUM0bzJVd3lDSkN1MWVsQmZjNHdFT0sxTV8xY29wWnJKU1FlRVJlVllia0VRM3VtbGV6OVNXUC02TDdrN29ObUFYRWFhUGVlUlQtM3BzRzRORzNyYTNzVkw0eGNQbGViX25Telp4cWpTcWRKT1BmTElNcjRsbzd4a1NaOG5DUll4ZVFTcFhzcHpNZUVqZVNRLThHc2N1a0hPZFNUOGppNXFZM05PLTZEWmJ1NDlaMjl1SjNTYVVfdWlWcGxqSHhXcS1Sc1lHZVhMNmJfWFdKbmNsbFUwRElKVm9MNER3UlU2WFh4X2NHUUhHRkctSzlmYUV4QnlIX0h1OXVlTUNzR2w3b1YtZGo5Y3F2Yk04S04xbGVkSmhMTFVZblpEVDNVWDU2bzFweTlOV3pvY1ZyRDF0LUhlV0JnIiwib2F1dGhfdG9rZW4iOiJFQUFDZ29SVUU4ZkFCUU9zd1JUcEVlZW9GUHh3aEI3bmI5YWNTalVsbVdOTHdSWkJHZFpBUDZkSGdNWUlzaGJyWkNaQ2FzSlhPYlpBWkJybWNJR1M0U09ZZWhRdmFVa3VDdlJlV1pBOWE5UDgxQVllWkNPQ3VqcXZ2OERBU0VuVHhIZmJzQ1NGMnlncjNmdVpCS1N5N2RIbVhyREtWUWhSTXZmWkFhNnpPT0ZtZFRwOGxWeGZId3ZaQVJBSzFtT0Rvcmc5UkFaRFpEIiwiYWxnb3JpdGhtIjoiSE1BQy1TSEEyNTYiLCJpc3N1ZWRfYXQiOjE3Njc3NzA1NDV9; searchParamsBeforeRedirect=%3FclientId%3D9dc79e3916a042abc86c2aa525bff009%26ref%3Dhttps%253A%252F%252Fwww.tiket.com%252Fen-sg%253Futm_section%253DnavigationBar%25253Blogin_label%2526utm_logic%253Dnone%26device_id%3D105e458d-4110-43bd-be91-df6e0ec530de%26lang%3Den%26utm_section%3DnavigationBar%253Blogin_label%26utm_logic%3Dnone%26skipPasskey%3Dtrue; _tix_logger_correlation_id=57fc0892-ed6d-4727-959e-cf7d5a192086; _ga_7H6ZDP2ZXG=GS2.1.s1767770542$o17$g1$t1767770549$j53$l0$h0; _ga_G3ZP2F3MW9=GS2.1.s1767770490$o19$g1$t1767770550$j60$l0$h2103917972; g_state={"i_l":0,"i_ll":1767770550836,"i_b":"FUmUKU58vkUiz3BOPeCF5XEMITNbQadSa96Ti7Q+530","i_e":{"enable_itp_optimization":12}}; _gcl_au=1.1.1784299521.1761025416.1412709294.1767770557.1767770557; _ga_D4RSCKVS19=GS2.1.s1767770490$o19$g1$t1767770557$j53$l0$h0; AMP_b34eb5901c=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIxMDVlNDU4ZC00MTEwLTQzYmQtYmU5MS1kZjZlMGVjNTMwZGUlMjIlMkMlMjJ1c2VySWQlMjIlM0EwJTJDJTIyc2Vzc2lvbklkJTIyJTNBMTc2Nzc3MDQ5MTIyNyUyQyUyMm9wdE91dCUyMiUzQWZhbHNlJTJDJTIybGFzdEV2ZW50VGltZSUyMiUzQTE3Njc3NzA1NTczMjklMkMlMjJsYXN0RXZlbnRJZCUyMiUzQTU1MCU3RA==; __cf_bm=C4n_q4rtXwHjomcc1mwnLFUeQWjF3bVK9oAyiACiEuw-1767770557.4424558-1.0.1.1-o2ebgeoVV9D1doJZnnA4sZGPJCwxhJ1KYjQnRq5dBP_QS8Jod92g8ak5d3Z9cFzzrLyH5v2BLdc186QU_.AFaKbpeDOIRZlikBrM_476H6s8XEydHIWPNnvIiEFHQF5.; __cf_bm=nmvoJG.40t2lypS.liz5xmSbZwl9vm_HdqfTRNyMxc8-1767771135.802936-1.0.1.1-VjVoktQ1xgf_HZq263ZjAYRFpnsXJPyJgvP1nrUor8dQ_ZU9X5SeqmYP9fdrPE7yQZOXLz09PdeyJM.mK_d1dx111leuWn.YdlPy5d3hR6ahYxEaOfEJ1T1dZ7i8SzuN; session_access_token=eyJhbGciOiJFZERTQSIsImtpZCI6IkpxSllFRGt3bmZRIiwidHlwIjoiSldUIn0.eyJfdGNzIjoibm9uZSIsIl90cnMiOiJub25lIiwiYWNjZXNzIjpbMTUsMCwwLDBdLCJlbWFpbCI6InlhbnVhci5rdXJuaWF3YW5AdGlrZXQuY29tIiwiZXhwIjoxNzY3Nzc0Njc1LCJpYXQiOjE3Njc3NzExMzUsImlzcyI6Imh0dHBzOi8vYWNjb3VudC5ibGlibGl0aWtldC5jb20iLCJqdGkiOiJzcU1NWkRBLTdnM1pGY3J0VWc5RndLTFROcGJQd1JGeSIsIm5iZiI6MTc2Nzc3MTEzNSwicmVmcmVzaElkIjoiODU1YjI2ZTctMzhjNC00MzI4LThhNDMtZDhiMzVjMDA5N2JkIiwic2Vzc2lvbklkIjoic3FNTVpEQS03ZzNaRmNydFVnOUZ3S0xUTnBiUHdSRnkiLCJzdWIiOiIyNjE4NjEyNjQiLCJ0b3BpYyI6IkFDQ0VTU19UT0tFTiIsInVzZXJJZCI6MjYxODYxMjY0fQ.e-tZaN6lVolzkawDgfAxn7Yl0khUiksq1-68CXXReJPjgEsczWLduxw_UCsQH64wTLAvtGa7VpJStT3LuYrjDw; session_refresh_token=eyJhbGciOiJFZERTQSIsImtpZCI6IjVtSWxBcXlOc3c0IiwidHlwIjoiSldUIn0.eyJfdGNzIjoibm9uZSIsIl90cnMiOiJub25lIiwiZXhwIjoxNzY4OTgwNzM1LCJpYXQiOjE3Njc3NzExMzUsImlzcyI6Imh0dHBzOi8vYWNjb3VudC5ibGlibGl0aWtldC5jb20iLCJqdGkiOiJzcU1NWkRBLTdnM1pGY3J0VWc5RndLTFROcGJQd1JGeSIsIm5iZiI6MTc2Nzc3MTEzNSwicmVmcmVzaElkIjoiODU1YjI2ZTctMzhjNC00MzI4LThhNDMtZDhiMzVjMDA5N2JkIiwic2Vzc2lvbklkIjoic3FNTVpEQS03ZzNaRmNydFVnOUZ3S0xUTnBiUHdSRnkiLCJzdWIiOiIyNjE4NjEyNjQiLCJ0b3BpYyI6IlJFRlJFU0hfVE9LRU4iLCJ1c2VySWQiOjI2MTg2MTI2NH0.qll-OwGCbDPNg9ce1m0LyMLY5lHRRTdNu00a058kJSMiGjYMIzVofnJz9PGAdKiCE-M9rOhRS7oMNvIXAUjTBw; unm_device_id=ee290bbb-e390-435b-9d78-1dc43dc0f632; __cf_bm=qCOoZrBeC5hHIHPtW5SpEj6pxNn.9F2l7arJEwO5b44-1767784726-1.0.1.1-GECF0blPkZc4xuXc0ELgysU0r0h42ALl83cNeY50Ldb8a7_C.lZPLL5i8NnjdkYh3EQzPLEDCx9n98AvzsLj_hZskV1xviH81i2HTyA3s90'
  }

  const body = {
    ref: baseUrl,
    identity: params.id,    
    secret: params.secret,  
    type: 'EMAIL_PASSWORD'
  };

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: params.env === 'prod'? headersProd : headers,
      body: JSON.stringify(body)
    });

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
    
    // Extract auth code from response
    const authCode = extractAuthCode(data, response);
    
    if (authCode) {
      console.log('\n=== Auth Code Extracted ===');
      console.log('Auth Code:', authCode);
    } else {
      console.log('\n=== No Auth Code Found ===');
      console.log('Checked common fields: token, access_token, authCode, auth_code, authorization');
    }
    
    return { data, authCode };
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}

function extractAuthCode(data, response) {
  // Check response body for common auth code fields
  if (data?.token) return data.token;
  if (data?.access_token) return data.access_token;
  if (data?.authCode) return data.authCode;
  if (data?.auth_code) return data.auth_code;
  if (data?.authorization) return data.authorization;
  if (data?.data?.token) return data.data.token;
  if (data?.data?.access_token) return data.data.access_token;
  if (data?.data?.authCode) return data.data.authCode;
  if (data?.result?.token) return data.result.token;
  if (data?.result?.access_token) return data.result.access_token;
  
  // Check response headers for authorization
  const authHeader = response.headers.get('authorization') || response.headers.get('Authorization');
  if (authHeader) return authHeader;
  
  // Check Set-Cookie header for auth tokens
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const tokenMatch = setCookie.match(/(?:token|auth|access_token)=([^;]+)/i);
    if (tokenMatch) return tokenMatch[1];
  }
  
  return null;
}

async function verifyAuthCode(authCode) {
  if (!authCode) {
    console.error('No auth code provided for verification');
    return null;
  }

  const url = `${verificationUrl}?authCode=${encodeURIComponent(authCode)}`;
  
  const headers = {
    'Accept-Language': 'en',
    'accept': 'application/json'
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    console.log('\n=== Verify API Response ===');
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
    
    // Extract service ticket from response
    const serviceTicket = extractServiceTicket(data, response);
    
    if (serviceTicket) {
      console.log('\n=== Service Ticket Extracted ===');
      console.log('Service Ticket:', serviceTicket);
    } else {
      console.log('\n=== No Service Ticket Found ===');
      console.log('Checked common fields: serviceTicket, service_ticket, ticket');
    }
    
    return { data, status: response.status, serviceTicket };
  } catch (error) {
    console.error('Error calling verify API:', error);
    throw error;
  }
}

function extractServiceTicket(data, response) {
  // Check response body for common service ticket fields
  if (data?.serviceTicket) return data.serviceTicket;
  if (data?.service_ticket) return data.service_ticket;
  if (data?.ticket) return data.ticket;
  if (data?.data?.serviceTicket) return data.data.serviceTicket;
  if (data?.data?.service_ticket) return data.data.service_ticket;
  if (data?.data?.ticket) return data.data.ticket;
  if (data?.result?.serviceTicket) return data.result.serviceTicket;
  if (data?.result?.service_ticket) return data.result.service_ticket;
  
  return null;
}

async function callServiceTicketAPI(serviceTicket) {
  if (!serviceTicket) {
    console.error('No service ticket provided');
    return null;
  }
  
  const headers = {
    'Cookie': 'tiket_currency=IDR; uniqueId=8a845f67-05c0-419b-a33b-e64e1a; userlang=en',
    'X-Username': 'GUEST',
    'X-Login-Media': 'none',
    'X-Reseller-Id': '0',
    'X-Account-Id': '0',
    'X-Channel-Id': 'DESKTOP',
    'X-Request-Id': 'd1f3321d-54f3-4f67-9ebc-de8f13194492',
    'X-Store-Id': 'TIKETCOM',
    'X-Business-Id': '0',
    'X-Currency': 'idr',
    'True-Client-Ip': '127.0.0.1',
    'accept': '*/*',
    'X-Service-Id': 'gateway',
    'X-Forwarded-For': '127.0.0.1',
    'X-Identity': 'identity',
    'Accept-Language': 'id',
    'Content-Type': 'application/json'
  };

  const headersProd = {
    'accept' : '*/*',
    'X-Store-Id': 'TIKETCOM',
    'X-Channel-Id' : 'WEB',
    'X-Service-Id' : 'gateway',
    'X-Request-Id' : '6ba7b89e-c641-418c-a1a6-f3408cb59082',
    'X-Username' : 'username',
    'X-Account-Id' : '0',
    'Accept-Language' : 'id',
    'Content-Type' : 'application/json' 
  }

  const body = {
    serviceTicket: serviceTicket
  };

  try {
    const response = await fetch(serviceTicketUrl, {
      method: 'POST',
      headers: params.env === 'prod'? headersProd : headers,
      body: JSON.stringify(body)
    });

    console.log('\n=== Service Ticket API Response ===');
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
    
    // Extract access token from response
    const accessToken = extractAccessToken(data, response);
    
    if (accessToken) {
      console.log('\n=== Access Token Extracted ===');
      console.log('Access Token:', accessToken);
    } else {
      console.log('\n=== No Access Token Found ===');
      console.log('Checked common fields: accessToken, access_token, token');
    }
    
    return { data, status: response.status, accessToken };
  } catch (error) {
    console.error('Error calling service ticket API:', error);
    throw error;
  }
}

function extractAccessToken(data, response) {
  // Check response body for common access token fields
  if (data?.accessToken) return data.accessToken;
  if (data?.access_token) return data.access_token;
  if (data?.token) return data.token;
  if (data?.data?.accessToken) return data.data.accessToken;
  if (data?.data?.access_token) return data.data.access_token;
  if (data?.data?.token) return data.data.token;
  if (data?.result?.accessToken) return data.result.accessToken;
  if (data?.result?.access_token) return data.result.access_token;
  if (data?.result?.token) return data.result.token;
  
  // Check response headers for authorization
  const authHeader = response.headers.get('authorization') || response.headers.get('Authorization');
  if (authHeader) {
    // Remove "Bearer " prefix if present
    return authHeader.replace(/^Bearer\s+/i, '');
  }
  
  return null;
}

async function callHomePagesAPI(accessToken) {
  if (!accessToken) {
    console.error('No access token provided');
    return null;
  }

  const url = `${homePagesUrl}?availablePlatforms=ANDROID&isNotificationActive=true&pageModuleCode=HOME_V2&verticalIconVariant=control&variant=HOME_V2&vertical=HOME&headerVariant=newhome&platform=MOBILE`;
  
  const headers = {
    'authorization': `Bearer ${accessToken}`,
    'X-Country-Code': 'IDN',
    'X-Account-Id': 'asdad',
    'Accept': 'application/json',
    'X-Channel-Id': 'ANDROID',
    'X-Request-Id': '23123123',
    'User-Agent': 'tiketcom/android-version (twh:20296642) - v5.4.0',
    'currency': 'IDR',
    'Accept-Language': 'en'
  };

  try {
    const response = await fetch(url, {
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

// Function to recursively find all iconUrl values in an object
function findAllIconUrls(obj, path = '', urls = []) {
  if (obj === null || obj === undefined) {
    return urls;
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        findAllIconUrls(item, `${path}[${index}]`, urls);
      });
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if this is an iconUrl field (case-insensitive)
        if (key.toLowerCase() === 'iconurl') {
          if (typeof value === 'string' && value.trim() !== '') {
            urls.push({
              url: value,
              path: currentPath
            });
          }
        } else {
          // Recursively search nested objects
          findAllIconUrls(value, currentPath, urls);
        }
      }
    }
  }

  return urls;
}

// Function to verify a URL with GET request (check headers only)
// If the initial response is 3XX, it will also verify the redirected URL.
async function verifyUrl(url, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // First request: do NOT auto-follow so we can detect 3XX
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'manual'
    });

    clearTimeout(timeoutId);

    // Immediately cancel body stream to avoid downloading full content
    if (response.body) {
      const reader = response.body.getReader();
      reader.cancel().catch(() => {});
    }

    const baseResult = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type') || 'unknown',
      contentLength: response.headers.get('content-length') || 'unknown',
      error: null,
      redirected: null
    };

    // If 3XX, follow the Location header and verify the final URL as well
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location') || response.headers.get('Location');
      if (location) {
        // Resolve relative redirects against the original URL
        let redirectedUrl;
        try {
          redirectedUrl = new URL(location, url).toString();
        } catch {
          redirectedUrl = location;
        }

        try {
          const followController = new AbortController();
          const followTimeoutId = setTimeout(() => followController.abort(), timeout);

          const redirectedResponse = await fetch(redirectedUrl, {
            method: 'GET',
            signal: followController.signal,
            redirect: 'follow'
          });

          clearTimeout(followTimeoutId);

          if (redirectedResponse.body) {
            const redirectedReader = redirectedResponse.body.getReader();
            redirectedReader.cancel().catch(() => {});
          }

          const redirectedInfo = {
            url: redirectedUrl,
            status: redirectedResponse.status,
            statusText: redirectedResponse.statusText,
            ok: redirectedResponse.ok,
            contentType: redirectedResponse.headers.get('content-type') || 'unknown',
            contentLength: redirectedResponse.headers.get('content-length') || 'unknown',
            error: null
          };

          return {
            ...baseResult,
            // overall ok should consider the final redirected response
            ok: redirectedInfo.ok,
            redirected: redirectedInfo
          };
        } catch (redirectError) {
          return {
            ...baseResult,
            ok: false,
            redirected: {
              url: location,
              status: null,
              statusText: 'Error',
              ok: false,
              contentType: null,
              contentLength: null,
              error: redirectError.message
            }
          };
        }
      }
    }

    return baseResult;
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        status: null,
        statusText: 'Timeout',
        ok: false,
        contentType: null,
        contentLength: null,
        error: 'Request timeout after 10 seconds',
        redirected: null
      };
    }
    return {
      status: null,
      statusText: 'Error',
      ok: false,
      contentType: null,
      contentLength: null,
      error: error.message,
      redirected: null
    };
  }
}

// Function to verify all iconUrls in the responses data
async function verifyIconUrls(data) {
  console.log('\n=== Starting Icon URL Verification ===');
  console.log('Extracting all iconUrl values...');
  const iconUrls = findAllIconUrls(data);
  
  console.log(`Found ${iconUrls.length} iconUrl values to verify\n`);

  // Remove duplicates
  const uniqueUrls = Array.from(
    new Map(iconUrls.map(item => [item.url, item])).values()
  );

  console.log(`Found ${uniqueUrls.length} unique URLs\n`);
  console.log('Verifying URLs (this may take a while)...\n');

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Verify each URL with a small delay to avoid overwhelming the server
  for (let i = 0; i < uniqueUrls.length; i++) {
    const item = uniqueUrls[i];
    process.stdout.write(`[${i + 1}/${uniqueUrls.length}] Verifying: ${item.url.substring(0, 60)}... `);
    
    const verification = await verifyUrl(item.url);
    
    const result = {
      url: item.url,
      path: item.path,
      ...verification
    };

    results.push(result);

    if (verification.ok) {
      console.log(`✓ ${verification.status}`);
      successCount++;
    } else {
      console.log(`✗ ${verification.status || verification.error}`);
      failureCount++;
    }

    // Small delay to avoid rate limiting
    if (i < uniqueUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: uniqueUrls.length,
      successful: successCount,
      failed: failureCount,
      successRate: ((successCount / uniqueUrls.length) * 100).toFixed(2) + '%'
    },
    results: results.sort((a, b) => {
      // Sort by status: successful first, then by status code
      if (a.ok !== b.ok) return a.ok ? -1 : 1;
      if (a.status && b.status) return a.status - b.status;
      return 0;
    })
  };

  // Save report to JSON file
  const fs = await import('fs/promises');
  await fs.writeFile('icon-verification-report.json', JSON.stringify(report, null, 2), 'utf8');

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total URLs: ${report.summary.totalUrls}`);
  console.log(`Successful: ${report.summary.successful} (${report.summary.successRate})`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log('\nReport saved to: icon-verification-report.json');

  // Print failed URLs
  const failedUrls = results.filter(r => !r.ok);
  if (failedUrls.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('FAILED URLs:');
    console.log('='.repeat(80));
    failedUrls.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.url}`);
      console.log(`   Path: ${item.path}`);
      console.log(`   Status: ${item.status || 'N/A'}`);
      console.log(`   Error: ${item.error || item.statusText || 'Unknown error'}`);
    });
  }

  return report;
}

// Function to recursively find all clickUrl values in an object
function findAllClickUrls(obj, path = '', urls = []) {
  if (obj === null || obj === undefined) {
    return urls;
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        findAllClickUrls(item, `${path}[${index}]`, urls);
      });
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check if this is a clickUrl field (case-insensitive)
        if (key.toLowerCase() === 'clickurl') {
          if (typeof value === 'string' && value.trim() !== '') {
            urls.push({
              endpoint: value,
              path: currentPath
            });
          }
        } else {
          // Recursively search nested objects
          findAllClickUrls(value, currentPath, urls);
        }
      }
    }
  }

  return urls;
}

// Function to verify a URL with HEAD request
// If the initial response is 3XX, it will also verify the redirected URL.
async function verifyUrlWithHead(url, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // First request: do NOT auto-follow so we can detect 3XX
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual'
    });

    clearTimeout(timeoutId);

    const baseResult = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type') || 'unknown',
      contentLength: response.headers.get('content-length') || 'unknown',
      error: null,
      redirected: null
    };

    // If 3XX, follow the Location header and verify the final URL as well
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location') || response.headers.get('Location');
      if (location) {
        let redirectedUrl;
        try {
          redirectedUrl = new URL(location, url).toString();
        } catch {
          redirectedUrl = location;
        }

        try {
          const followController = new AbortController();
          const followTimeoutId = setTimeout(() => followController.abort(), timeout);

          const redirectedResponse = await fetch(redirectedUrl, {
            method: 'HEAD',
            signal: followController.signal,
            redirect: 'follow'
          });

          clearTimeout(followTimeoutId);

          const redirectedInfo = {
            url: redirectedUrl,
            status: redirectedResponse.status,
            statusText: redirectedResponse.statusText,
            ok: redirectedResponse.ok,
            contentType: redirectedResponse.headers.get('content-type') || 'unknown',
            contentLength: redirectedResponse.headers.get('content-length') || 'unknown',
            error: null
          };

          return {
            ...baseResult,
            ok: redirectedInfo.ok,
            redirected: redirectedInfo
          };
        } catch (redirectError) {
          return {
            ...baseResult,
            ok: false,
            redirected: {
              url: location,
              status: null,
              statusText: 'Error',
              ok: false,
              contentType: null,
              contentLength: null,
              error: redirectError.message
            }
          };
        }
      }
    }

    return baseResult;
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        status: null,
        statusText: 'Timeout',
        ok: false,
        contentType: null,
        contentLength: null,
        error: 'Request timeout after 10 seconds',
        redirected: null
      };
    }
    return {
      status: null,
      statusText: 'Error',
      ok: false,
      contentType: null,
      contentLength: null,
      error: error.message,
      redirected: null
    };
  }
}

// Function to verify all clickUrls in the responses data
async function verifyClickUrls(data) {
  console.log('\n=== Starting Click URL Verification ===');
  console.log('Extracting all clickUrl values...');
  const clickUrls = findAllClickUrls(data);
  
  console.log(`Found ${clickUrls.length} clickUrl values\n`);

  // Remove duplicates
  const uniqueEndpoints = Array.from(
    new Map(clickUrls.map(item => [item.endpoint, item])).values()
  );

  console.log(`Found ${uniqueEndpoints.length} unique clickUrl endpoints\n`);

  // Base URL
  const baseUrl = 'https://preprod.tiket.com';
  
  // Build full URLs by combining base URL with endpoints
  const fullUrls = uniqueEndpoints.map(item => {
    // Ensure endpoint starts with / if it doesn't already
    if(item.endpoint.startsWith('http://') || item.endpoint.startsWith('https://')) {
      return {
        url: item.endpoint,
        endpoint: item.endpoint,
        path: item.path
      };
    } else if(!item.endpoint.startsWith('/')) {
      return {
        url: `${baseUrl}/${item.endpoint}`,
        endpoint: item.endpoint,
        path: item.path
      };
    } else {
      return {
        url: `${baseUrl}${item.endpoint}`,
        endpoint: item.endpoint,
        path: item.path
      };
    }
  });

  console.log(`Verifying ${fullUrls.length} URLs with HEAD requests (this may take a while)...\n`);

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Verify each URL with a small delay to avoid overwhelming the server
  for (let i = 0; i < fullUrls.length; i++) {
    const item = fullUrls[i];
    process.stdout.write(`[${i + 1}/${fullUrls.length}] Verifying: ${item.url.substring(0, 60)}... `);
    
    const verification = await verifyUrlWithHead(item.url);
    
    const result = {
      url: item.url,
      endpoint: item.endpoint,
      path: item.path,
      ...verification
    };

    results.push(result);

    if (verification.ok) {
      console.log(`✓ ${verification.status}`);
      successCount++;
    } else {
      console.log(`✗ ${verification.status || verification.error}`);
      failureCount++;
    }

    // Small delay to avoid rate limiting
    if (i < fullUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: fullUrls.length,
      successful: successCount,
      failed: failureCount,
      successRate: ((successCount / fullUrls.length) * 100).toFixed(2) + '%'
    },
    results: results.sort((a, b) => {
      // Sort by status: successful first, then by status code
      if (a.ok !== b.ok) return a.ok ? -1 : 1;
      if (a.status && b.status) return a.status - b.status;
      return 0;
    })
  };

  // Save report to JSON file
  const fs = await import('fs/promises');
  await fs.writeFile('clickurl-verification-report.json', JSON.stringify(report, null, 2), 'utf8');

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('CLICK URL VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total URLs: ${report.summary.totalUrls}`);
  console.log(`Successful: ${report.summary.successful} (${report.summary.successRate})`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log('\nReport saved to: clickurl-verification-report.json');

  // Print failed URLs
  const failedUrls = results.filter(r => !r.ok);
  if (failedUrls.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('FAILED URLs:');
    console.log('='.repeat(80));
    failedUrls.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.url}`);
      console.log(`   Endpoint: ${item.endpoint}`);
      console.log(`   Path: ${item.path}`);
      console.log(`   Status: ${item.status || 'N/A'}`);
      console.log(`   Error: ${item.error || item.statusText || 'Unknown error'}`);
    });
  }

  return report;
}

// Main execution: Login -> Verify -> Service Ticket -> Home Pages -> Icon Verification -> Click URL Verification
async function main() {
  const fs = await import('fs/promises');
  const responses = {
    timestamp: new Date().toISOString(),
    login: null,
    verify: null,
    serviceTicket: null,
    homePages: null
  };

  try {
    // Step 1: Login and get auth code
    const loginResult = await callLoginAPI();
    responses.login = {
      status: 'success',
      data: loginResult.data,
      authCode: loginResult.authCode
    };
    
    if (loginResult.authCode) {
      // Step 2: Verify auth code and get service ticket
      const verifyResult = await verifyAuthCode(loginResult.authCode);
      responses.verify = {
        status: 'success',
        data: verifyResult.data,
        serviceTicket: verifyResult.serviceTicket
      };
      
      if (verifyResult.serviceTicket) {
        // Step 3: Call service ticket API and get access token
        const serviceTicketResult = await callServiceTicketAPI(verifyResult.serviceTicket);
        responses.serviceTicket = {
          status: 'success',
          data: serviceTicketResult.data,
          accessToken: serviceTicketResult.accessToken
        };
        
        if (serviceTicketResult.accessToken) {
          // Step 4: Call home pages API with access token
          const homePagesResult = await callHomePagesAPI(serviceTicketResult.accessToken);
          responses.homePages = {
            status: 'success',
            data: homePagesResult.data
          };
          
          // Step 5: Verify all iconUrls in the home pages response
          if (homePagesResult.data) {
            try {
              const iconVerificationReport = await verifyIconUrls(responses);
              responses.iconVerification = {
                status: 'success',
                report: iconVerificationReport
              };
            } catch (iconError) {
              console.error('Error during icon verification:', iconError);
              responses.iconVerification = {
                status: 'error',
                error: iconError.message
              };
            }
            
            // Step 6: Verify all clickUrls in the home pages response
            try {
              const clickUrlVerificationReport = await verifyClickUrls(responses);
              responses.clickUrlVerification = {
                status: 'success',
                report: clickUrlVerificationReport
              };
            } catch (clickUrlError) {
              console.error('Error during clickUrl verification:', clickUrlError);
              responses.clickUrlVerification = {
                status: 'error',
                error: clickUrlError.message
              };
            }
          }
        } else {
          console.log('\nSkipping home pages API call - no access token available');
          responses.homePages = {
            status: 'skipped',
            reason: 'No access token available'
          };
        }
      } else {
        console.log('\nSkipping service ticket API call - no service ticket available');
        responses.serviceTicket = {
          status: 'skipped',
          reason: 'No service ticket available'
        };
      }
    } else {
      console.log('\nSkipping verify API call - no auth code available');
      responses.verify = {
        status: 'skipped',
        reason: 'No auth code available'
      };
    }
  } catch (error) {
    console.error('Error in main execution:', error);
    responses.error = {
      message: error.message,
      stack: error.stack
    };
  } finally {
    // Write responses to JSON file
    try {
      await fs.writeFile('responses.json', JSON.stringify(responses, null, 2), 'utf8');
      console.log('\n=== Responses saved to responses.json ===');
    } catch (writeError) {
      console.error('Error writing to JSON file:', writeError);
    }
  }
}

// Call the main function
main();

