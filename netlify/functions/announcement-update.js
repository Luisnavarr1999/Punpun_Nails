const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Método permitido
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Validar env vars
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Supabase env vars missing' })
    };
  }

  // Parsear body
  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON payload' })
    };
  }

  // Normalizar settings
  const settings = {
    id: 1,
    active: payload.active === true,
    text: typeof payload.text === 'string' ? payload.text.trim() : '',
    speed:
      Number.isFinite(Number(payload.speed)) && Number(payload.speed) > 0
        ? Number(payload.speed)
        : null,
    link: typeof payload.link === 'string' ? payload.link.trim() : '',
    updated_at: new Date().toISOString()
  };

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/announcement_settings?on_conflict=id`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'resolution=merge-duplicates,return=representation',
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(settings)
      }
    );

    // Error desde Supabase
    if (!response.ok) {
      const errorBody = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: errorBody })
      };
    }

    // OK
    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data[0] || settings)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
