import express, { Request, Response } from 'express';

const router = express.Router();

function getExternalApiConfig() {
  const base = process.env.DECOMPTE_API_BASE;
  const apiKey = process.env.DECOMPTE_API_KEY;
  const bearer = process.env.DECOMPTE_API_BEARER;

  if (!base || !apiKey || !bearer) {
    throw new Error('External tickets API configuration is incomplete (check DECOMPTE_API_* env vars)');
  }

  const normalizedBase = base.replace(/\/+$/, '');

  return {
    base: normalizedBase,
    apiKey,
    bearer,
  };
}

/**
 * Proxy endpoint for tickets GraphQL queries.
 *
 * Accepts a simplified JSON payload with ticket list parameters and forwards
 * a properly-shaped GraphQL query to the external service. The response is
 * normalized so the frontend can read `payload.ticket.data`.
 */
router.post('/graphql', async (req: Request, res: Response): Promise<void> => {
  try {
    const { base, apiKey, bearer } = getExternalApiConfig();
    const url = `${base}/graphql`;

    const {
      suppliersIdAssign,
      paginLimit = 10,
      paginPage = 1,
      orderByDesc = 'date',
    } = req.body as {
      suppliersIdAssign?: number;
      paginLimit?: number;
      paginPage?: number;
      orderByDesc?: string;
    };

    // #region agent log
    try {
      fetch('http://127.0.0.1:7903/ingest/4fc0a345-d35c-4a05-a57f-ee4586fed261', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': '6e4103',
        },
        body: JSON.stringify({
          sessionId: '6e4103',
          runId: 'tickets-proxy',
          hypothesisId: 'H-params',
          location: 'backend/src/routes/tickets.ts:34',
          message: 'Incoming tickets graphql params',
          data: {
            suppliersIdAssign,
            suppliersIdAssignType: typeof suppliersIdAssign,
            paginLimit,
            paginPage,
            orderByDesc,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch {
      // ignore logging failures
    }
    // #endregion agent log

    if (!suppliersIdAssign) {
      res.status(400).json({ error: 'suppliersIdAssign is required' });
      return;
    }

    const graphqlQuery = `{
      ticket(
        suppliers_id_assign: ${suppliersIdAssign},
        paginLimit: ${paginLimit},
        paginPage: ${paginPage},
        orderByDesc: "${orderByDesc}"
      ) {
        data {
          solvedate
          content
          date
          id
          name
          status
          intervention_date
          is_cyber_incident
          priority_v2
          tical_numero_prj
          ticketcategories { name }
          user_assign { realname firstname }
          group_assign { name }
          interventions {
            non_facturable
            desc_facturation
            preste
            date_begin
          }
          supplier { id }
        }
      }
    }`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({ query: graphqlQuery }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('Tickets GraphQL proxy error:', response.status, response.statusText, text);
      res
        .status(502)
        .json({ error: 'Failed to fetch tickets from external service', status: response.status, body: text });
      return;
    }

    try {
      const externalJson = JSON.parse(text) as { data?: { ticket?: unknown } };
      const ticket = externalJson.data?.ticket ?? null;
      res.json({ ticket });
    } catch {
      console.error('Tickets GraphQL proxy received non-JSON response:', text);
      res.status(502).json({ error: 'Invalid JSON response from external tickets service' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error in tickets GraphQL proxy:', message);
    res.status(500).json({ error: 'Internal tickets proxy error', details: message });
  }
});

export default router;

