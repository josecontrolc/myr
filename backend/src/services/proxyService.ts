import axios from 'axios';

/**
 * Proxies a GraphQL query to the internal API using credentials from environment variables.
 * 
 * @param query The GraphQL query string to execute.
 * @returns The response data from the internal API.
 */
export async function proxyGraphQL(query: string): Promise<any> {
  const apiUrl = process.env.INTERNAL_API_URL;
  const apiKey = process.env.INTERNAL_API_KEY;
  const apiToken = process.env.INTERNAL_API_TOKEN;

  if (!apiUrl || !apiKey || !apiToken) {
    throw new Error('Internal API credentials not configured in environment.');
  }

  try {
    const { data } = await axios.post(
      apiUrl,
      { query },
      {
        headers: {
          'x-api-key': apiKey,
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return data;
  } catch (error: any) {
    console.error('Error during internal API proxy call:', error.response?.data || error.message);
    throw error;
  }
}
