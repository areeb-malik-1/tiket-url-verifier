const fetch = require("node-fetch");

const urlProd =
  "https://api.tiket.com/ms-gateway/tix-member-core/v3/auth/unm/service-ticket";
const urlPreprod =
  "https://member-core-v2-be-svc.preprod-platform-cluster.tiket.com/tix-member-core/v3/auth/unm/service-ticket";

const headersPreprod = {
  Cookie:
    "tiket_currency=IDR; uniqueId=8a845f67-05c0-419b-a33b-e64e1a; userlang=en",
  "X-Username": "GUEST",
  "X-Login-Media": "none",
  "X-Reseller-Id": "0",
  "X-Account-Id": "0",
  "X-Channel-Id": "DESKTOP",
  "X-Request-Id": "d1f3321d-54f3-4f67-9ebc-de8f13194492",
  "X-Store-Id": "TIKETCOM",
  "X-Business-Id": "0",
  "X-Currency": "idr",
  "True-Client-Ip": "127.0.0.1",
  accept: "*/*",
  "X-Service-Id": "gateway",
  "X-Forwarded-For": "127.0.0.1",
  "X-Identity": "identity",
  "Accept-Language": "id",
  "Content-Type": "application/json",
};

const headersProd = {
  accept: "*/*",
  "X-Store-Id": "TIKETCOM",
  "X-Channel-Id": "WEB",
  "X-Service-Id": "gateway",
  "X-Request-Id": "6ba7b89e-c641-418c-a1a6-f3408cb59082",
  "X-Username": "username",
  "X-Account-Id": "0",
  "Accept-Language": "id",
  "Content-Type": "application/json",
};

class ServiceTiket {
  constructor(serviceTiket, env) {
    this.serviceTiket = serviceTiket;
    this.env = env;
  }

  getConfig() {
    return {
      url: this.env == "prod" ? urlProd : urlPreprod,
      headers: this.env == "prod" ? headersProd : headersPreprod,
      body: {
        serviceTicket: this.serviceTiket,
      },
    };
  }

  async hitApi() {
    const { url, headers, body } = this.getConfig();
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });
      console.log("\n=== Service Ticket API Response ===");
      console.log("Status:", response.status);
      const contentType = response.headers.get("content-type") || "";

      let data;
      if (contentType.includes("application/json")) {
        data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log("Response (non-JSON):", text.substring(0, 500));
        throw new Error(
          `Expected JSON but received ${contentType}. Status: ${response.status}`
        );
      }

      // Extract access token from response
      const accessToken = this.extractAccessToken(data, response);

      if (accessToken) {
        console.log("\n=== Access Token Extracted ===");
        console.log("Access Token:", accessToken);
      } else {
        console.log("\n=== No Access Token Found ===");
        console.log("Checked common fields: accessToken, access_token, token");
      }

      return { data, status: response.status, accessToken };
    } catch (error) {
      console.error("Error calling service ticket API:", error);
      throw error;
    }
  }

  extractAccessToken(data, response) {
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
    const authHeader =
      response.headers.get("authorization") ||
      response.headers.get("Authorization");
    if (authHeader) {
      // Remove "Bearer " prefix if present
      return authHeader.replace(/^Bearer\s+/i, "");
    }

    return null;
  }
}

module.exports = ServiceTiket;
