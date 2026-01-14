const fetch = require("node-fetch");

// Function to recursively find all iconUrl values in an object
function findAllUrls(obj, pkey, path = "", urls = []) {
  if (obj === null || obj === undefined) {
    return urls;
  }

  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        findAllUrls(item, pkey, `${path}[${index}]`, urls);
      });
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Check if this is an iconUrl field (case-insensitive)
        if (pkey.toLowerCase() === key.toLowerCase()) {
          if (typeof value === "string" && value.trim() !== "") {
            urls.push({
              url: value,
              path: currentPath,
            });
          }
        } else {
          // Recursively search nested objects
          findAllUrls(value, pkey, currentPath, urls);
        }
      }
    }
  }

  return urls;
}

function findAllEndpoints(obj, path = "", urls = []) {
  if (obj === null || obj === undefined) {
    return urls;
  }

  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        findAllEndpoints(item, `${path}[${index}]`, urls);
      });
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Check if this is a clickUrl field (case-insensitive)
        if (key.toLowerCase() === "clickurl") {
          if (typeof value === "string" && value.trim() !== "") {
            urls.push({
              endpoint: value,
              path: currentPath,
            });
          }
        } else {
          // Recursively search nested objects
          findAllEndpoints(value, currentPath, urls);
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
      method: "GET",
      signal: controller.signal,
      redirect: "manual",
    });

    clearTimeout(timeoutId);

    // Immediately cancel body stream to avoid downloading full content
    if (response.body && typeof response.body.destroy === "function") {
      response.body.destroy();
    }

    const baseResult = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get("content-type") || "unknown",
      contentLength: response.headers.get("content-length") || "unknown",
      error: null,
      redirected: null,
    };

    // If 3XX, follow the Location header and verify the final URL as well
    if (response.status >= 300 && response.status < 400) {
      const location =
        response.headers.get("location") || response.headers.get("Location");
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
          const followTimeoutId = setTimeout(
            () => followController.abort(),
            timeout
          );

          const redirectedResponse = await fetch(redirectedUrl, {
            method: "GET",
            signal: followController.signal,
            redirect: "follow",
          });

          clearTimeout(followTimeoutId);

          if (
            redirectedResponse.body &&
            typeof redirectedResponse.body.destroy === "function"
          ) {
            redirectedResponse.body.destroy();
          }

          const redirectedInfo = {
            url: redirectedUrl,
            status: redirectedResponse.status,
            statusText: redirectedResponse.statusText,
            ok: redirectedResponse.ok,
            contentType:
              redirectedResponse.headers.get("content-type") || "unknown",
            contentLength:
              redirectedResponse.headers.get("content-length") || "unknown",
            error: null,
          };

          return {
            ...baseResult,
            // overall ok should consider the final redirected response
            ok: redirectedInfo.ok,
            redirected: redirectedInfo,
          };
        } catch (redirectError) {
          return {
            ...baseResult,
            ok: false,
            redirected: {
              url: location,
              status: null,
              statusText: "Error",
              ok: false,
              contentType: null,
              contentLength: null,
              error: redirectError.message,
            },
          };
        }
      }
    }

    return baseResult;
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        status: null,
        statusText: "Timeout",
        ok: false,
        contentType: null,
        contentLength: null,
        error: "Request timeout after 10 seconds",
        redirected: null,
      };
    }
    return {
      status: null,
      statusText: "Error",
      ok: false,
      contentType: null,
      contentLength: null,
      error: error.message,
      redirected: null,
    };
  }
}

// Function to verify all iconUrls in the responses data
async function verifyIconUrls(iconUrls) {
  console.log("\n=== Starting Icon URL Verification ===");
  console.log(`Found ${iconUrls.length} iconUrl values to verify\n`);

  // Remove duplicates
  const uniqueUrls = Array.from(
    new Map(iconUrls.map((item) => [item.url, item])).values()
  );

  console.log(`Found ${uniqueUrls.length} unique URLs\n`);
  console.log("Verifying URLs (this may take a while)...\n");

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Verify each URL with a small delay to avoid overwhelming the server
  for (let i = 0; i < uniqueUrls.length; i++) {
    const item = uniqueUrls[i];
    process.stdout.write(
      `[${i + 1}/${uniqueUrls.length}] Verifying: ${item.url.substring(
        0,
        60
      )}... `
    );

    const verification = await verifyUrl(item.url);

    const result = {
      url: item.url,
      path: item.path,
      ...verification,
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
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: uniqueUrls.length,
      successful: successCount,
      failed: failureCount,
      successRate: ((successCount / uniqueUrls.length) * 100).toFixed(2) + "%",
    },
    results: results.sort((a, b) => {
      // Sort by status: successful first, then by status code
      if (a.ok !== b.ok) return a.ok ? -1 : 1;
      if (a.status && b.status) return a.status - b.status;
      return 0;
    }),
  };

  // Save report to JSON file
  const fs = await import("fs/promises");
  await fs.writeFile(
    "icon-verification-report.json",
    JSON.stringify(report, null, 2),
    "utf8"
  );

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("VERIFICATION SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total URLs: ${report.summary.totalUrls}`);
  console.log(
    `Successful: ${report.summary.successful} (${report.summary.successRate})`
  );
  console.log(`Failed: ${report.summary.failed}`);
  console.log("\nReport saved to: icon-verification-report.json");

  // Print failed URLs
  const failedUrls = results.filter((r) => !r.ok);
  if (failedUrls.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("FAILED URLs:");
    console.log("=".repeat(80));
    failedUrls.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.url}`);
      console.log(`   Path: ${item.path}`);
      console.log(`   Status: ${item.status || "N/A"}`);
      console.log(
        `   Error: ${item.error || item.statusText || "Unknown error"}`
      );
    });
  }

  return { report, failedUrls };
}

// Function to verify a URL with HEAD request
// If the initial response is 3XX, it will also verify the redirected URL.
async function verifyUrlWithHead(url, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // First request: do NOT auto-follow so we can detect 3XX
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "manual",
    });

    clearTimeout(timeoutId);

    const baseResult = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get("content-type") || "unknown",
      contentLength: response.headers.get("content-length") || "unknown",
      error: null,
      redirected: null,
    };

    // If 3XX, follow the Location header and verify the final URL as well
    if (response.status >= 300 && response.status < 400) {
      const location =
        response.headers.get("location") || response.headers.get("Location");
      if (location) {
        let redirectedUrl;
        try {
          redirectedUrl = new URL(location, url).toString();
        } catch {
          redirectedUrl = location;
        }

        try {
          const followController = new AbortController();
          const followTimeoutId = setTimeout(
            () => followController.abort(),
            timeout
          );

          const redirectedResponse = await fetch(redirectedUrl, {
            method: "HEAD",
            signal: followController.signal,
            redirect: "follow",
          });

          clearTimeout(followTimeoutId);

          const redirectedInfo = {
            url: redirectedUrl,
            status: redirectedResponse.status,
            statusText: redirectedResponse.statusText,
            ok: redirectedResponse.ok,
            contentType:
              redirectedResponse.headers.get("content-type") || "unknown",
            contentLength:
              redirectedResponse.headers.get("content-length") || "unknown",
            error: null,
          };

          return {
            ...baseResult,
            ok: redirectedInfo.ok,
            redirected: redirectedInfo,
          };
        } catch (redirectError) {
          return {
            ...baseResult,
            ok: false,
            redirected: {
              url: location,
              status: null,
              statusText: "Error",
              ok: false,
              contentType: null,
              contentLength: null,
              error: redirectError.message,
            },
          };
        }
      }
    }

    return baseResult;
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        status: null,
        statusText: "Timeout",
        ok: false,
        contentType: null,
        contentLength: null,
        error: "Request timeout after 10 seconds",
        redirected: null,
      };
    }
    return {
      status: null,
      statusText: "Error",
      ok: false,
      contentType: null,
      contentLength: null,
      error: error.message,
      redirected: null,
    };
  }
}

// Function to verify all clickUrls in the responses data
async function verifyClickUrls(clickUrls, baseUrl) {
  console.log("\n=== Starting Click URL Verification ===");
  console.log(`Found ${clickUrls.length} clickUrl values\n`);

  // Remove duplicates
  const uniqueEndpoints = Array.from(
    new Map(clickUrls.map((item) => [item.endpoint, item])).values()
  );

  console.log(`Found ${uniqueEndpoints.length} unique clickUrl endpoints\n`);

  // Build full URLs by combining base URL with endpoints
  const fullUrls = uniqueEndpoints.map((item) => {
    // Ensure endpoint starts with / if it doesn't already
    if (
      item.endpoint.startsWith("http://") ||
      item.endpoint.startsWith("https://")
    ) {
      return {
        url: item.endpoint,
        endpoint: item.endpoint,
        path: item.path,
      };
    } else if (!item.endpoint.startsWith("/")) {
      return {
        url: `${baseUrl}/${item.endpoint}`,
        endpoint: item.endpoint,
        path: item.path,
      };
    } else {
      return {
        url: `${baseUrl}${item.endpoint}`,
        endpoint: item.endpoint,
        path: item.path,
      };
    }
  });

  console.log(
    `Verifying ${fullUrls.length} URLs with HEAD requests (this may take a while)...\n`
  );

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Verify each URL with a small delay to avoid overwhelming the server
  for (let i = 0; i < fullUrls.length; i++) {
    const item = fullUrls[i];
    process.stdout.write(
      `[${i + 1}/${fullUrls.length}] Verifying: ${item.url.substring(
        0,
        60
      )}... `
    );

    const verification = await verifyUrlWithHead(item.url);

    const result = {
      url: item.url,
      endpoint: item.endpoint,
      path: item.path,
      ...verification,
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
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: fullUrls.length,
      successful: successCount,
      failed: failureCount,
      successRate: ((successCount / fullUrls.length) * 100).toFixed(2) + "%",
    },
    results: results.sort((a, b) => {
      // Sort by status: successful first, then by status code
      if (a.ok !== b.ok) return a.ok ? -1 : 1;
      if (a.status && b.status) return a.status - b.status;
      return 0;
    }),
  };

  // Save report to JSON file
  const fs = await import("fs/promises");
  await fs.writeFile(
    "clickurl-verification-report.json",
    JSON.stringify(report, null, 2),
    "utf8"
  );

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("CLICK URL VERIFICATION SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total URLs: ${report.summary.totalUrls}`);
  console.log(
    `Successful: ${report.summary.successful} (${report.summary.successRate})`
  );
  console.log(`Failed: ${report.summary.failed}`);
  console.log("\nReport saved to: clickurl-verification-report.json");

  // Print failed URLs
  const failedUrls = results.filter((r) => !r.ok);
  if (failedUrls.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("FAILED URLs:");
    console.log("=".repeat(80));
    failedUrls.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.url}`);
      console.log(`   Endpoint: ${item.endpoint}`);
      console.log(`   Path: ${item.path}`);
      console.log(`   Status: ${item.status || "N/A"}`);
      console.log(
        `   Error: ${item.error || item.statusText || "Unknown error"}`
      );
    });
  }

  return { report, failedUrls };
}

module.exports = {
  findAllUrls,
  verifyIconUrls,
  verifyClickUrls,
  findAllEndpoints,
};
