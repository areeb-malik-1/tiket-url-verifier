const fetch = require("node-fetch");

const urlPreprod = "https://sandbox.bliblitiket.com/gateway/gks-unm-go-be/api/v1/auth/code/verify";
const urlProd = "https://account.bliblitiket.com/gateway/gks-unm-go-be/api/v1/auth/code/verify";

class VerifyPage {
  constructor(authCode, env) {
    this.authCode = authCode;
    this.env = env;
  }

  getConfig() {
    return {
      url: this.env === "prod" ? urlProd : urlPreprod,
      headers: {
        "Accept-Language": "en",
        "accept": "application/json",
      },
    };
  }

  async hitApi() {
    const { url, headers } = this.getConfig();
    try {
      if (!this.authCode) {
        console.error("No auth code provided for verification");
        return null;
      }

      const verifyUrl = `${url}?authCode=${encodeURIComponent(this.authCode)}`;
      console.log('\nurl: ' + verifyUrl)
      const response = await fetch(verifyUrl, {
        method: "GET",
        headers: headers,
      });

      console.log("\n=== Verify API Response ===");
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

      // Extract service ticket from response
      const serviceTicket = this.extractServiceTicket(data);

      if (serviceTicket) {
        console.log("\n=== Service Ticket Extracted ===");
        console.log("Service Ticket:", serviceTicket);
      } else {
        console.log("\n=== No Service Ticket Found ===");
        console.log(
          "Checked common fields: serviceTicket, service_ticket, ticket"
        );
      }

      return { data, status: response.status, serviceTicket };
    } catch (error) {
      console.error("Error calling verify API:", error);
      throw error;
    }
  }

  extractServiceTicket(data) {
      // Check response body for common service ticket fields
      if (data?.data?.serviceTicket) return data.data.serviceTicket;
      return null;
  }
}

module.exports = VerifyPage;
