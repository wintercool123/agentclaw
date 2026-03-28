/**
 * API Key 连通性测试脚本
 * 测试 DeepSeek / GLM-4 / Kimi 三个模型
 */

const https = require('https');

const KEYS = {
  deepseek: 'sk-d8715dc96a2b4380b6181052dbc47e0b',
  glm: '20a513ba925243fda8600adfcdfd09d1.urwef1IdUCnD6Gpl',
  kimi: 'sk-3Rww1ag6WE8ttxJVSTTAXmsY1PrGiAUSGqu99KTIN2mBjTjx'
};

const TEST_PAYLOAD = JSON.stringify({
  model: 'placeholder',
  messages: [{ role: 'user', content: 'Say "OK" in one word.' }],
  max_tokens: 10
});

function callAPI(name, hostname, path, apiKey) {
  return new Promise((resolve) => {
    const payload = TEST_PAYLOAD.replace('"placeholder"',
      name === 'deepseek' ? '"deepseek-chat"' :
      name === 'glm' ? '"glm-4"' : '"moonshot-v1-8k"'
    );

    const options = {
      hostname,
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    let data = '';
    const req = https.request(options, (res) => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.choices && json.choices[0]) {
            const content = json.choices[0].message?.content || json.choices[0].text;
            resolve({ success: true, status: res.statusCode, reply: content?.trim() });
          } else if (json.error) {
            resolve({ success: false, status: res.statusCode, error: json.error.message || JSON.stringify(json.error) });
          } else {
            resolve({ success: false, status: res.statusCode, error: data.substring(0, 200) });
          }
        } catch (e) {
          resolve({ success: false, status: res.statusCode, error: data.substring(0, 200) });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ success: false, error: 'Timeout (15s)' }); });
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('🔍 Testing API Keys...\n');

  const tests = [
    { name: 'DeepSeek', key: 'deepseek', hostname: 'api.deepseek.com', path: '/v1/chat/completions' },
    { name: 'GLM-4',    key: 'glm',      hostname: 'open.bigmodel.cn',  path: '/api/paas/v4/chat/completions' },
    { name: 'Kimi',     key: 'kimi',     hostname: 'api.moonshot.cn',   path: '/v1/chat/completions' }
  ];

  for (const t of tests) {
    process.stdout.write(`  ${t.name.padEnd(10)} ... `);
    const result = await callAPI(t.key, t.hostname, t.path, KEYS[t.key]);
    if (result.success) {
      console.log(`✅  HTTP ${result.status}  reply: "${result.reply}"`);
    } else {
      console.log(`❌  HTTP ${result.status || 'ERR'}  ${result.error}`);
    }
  }

  console.log('\nDone.');
}

main();
