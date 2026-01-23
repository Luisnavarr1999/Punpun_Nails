const fetch = require('node-fetch');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase env vars missing' }) };
  }

  const id = event.queryStringParameters?.id;
  if (!id) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id' }) };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=representation'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { statusCode: response.status, headers, body: errorBody };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};