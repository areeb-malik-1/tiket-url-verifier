const fetch = require("node-fetch");

async function slack(msg) {
  console.log("Sending msg to slack");
  const payload = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'API Test Result' }
      },
      {
        type: 'section',
        fields: Object.entries(msg).map(([k, v]) => ({
          type: 'mrkdwn',
          text: `*${k}:*\n${JSON.stringify(v)}`
        }))
      }
    ]
  };
  return await fetch(process.env.SLACK_URL, {
      method: 'POST',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify(payload)
    });
}

module.exports = slack;
