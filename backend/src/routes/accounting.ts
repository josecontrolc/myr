import express, { Request, Response } from 'express';

const router = express.Router();

type DecompteItem = {
  Client: number;
  Bl_Adm: number;
  Bl_TICAL: number;
  Facture: string;
  Libelle: string;
  Emission: string;
  Echeance: string;
  Mnt_Init: string;
  Solde: string;
  Blq: number;
  Plainte: string;
  Debut: string;
  Fin: string;
  Relance: number;
  Rappel: number;
  dummy?: string;
  amount?: string;
  solde?: string;
};

function getDecompteConfig() {
  const base = process.env.DECOMPTE_API_BASE;
  const apiKey = process.env.DECOMPTE_API_KEY;
  const bearer = process.env.DECOMPTE_API_BEARER;

  if (!base || !apiKey || !bearer) {
    throw new Error('Decompte API configuration is incomplete (check DECOMPTE_API_* env vars)');
  }

  const normalizedBase = base.replace(/\/+$/, '');

  return {
    base: normalizedBase,
    apiKey,
    bearer,
  };
}

async function fetchDecompteFromExternal(clientId: string): Promise<DecompteItem[]> {
  const { base, apiKey, bearer } = getDecompteConfig();
  const url = `${base}/accounting/${encodeURIComponent(clientId)}/decompte`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      Authorization: `Bearer ${bearer}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `Decompte API request failed with ${response.status} ${response.statusText}: ${text}`,
    );
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('Unexpected decompte API response shape (expected an array)');
  }

  return data as DecompteItem[];
}

/**
 * @swagger
 * /api/accounting/{clientId}/decompte:
 *   get:
 *     summary: Get accounting decompte for a client
 *     description: >
 *       Returns the raw decompte information for a given accounting client id.
 *       This endpoint proxies an external accounting API and is protected by JWT/RBAC.
 *     tags:
 *       - Accounting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Accounting client identifier (e.g. 400000037)
 *     responses:
 *       200:
 *         description: Decompte entries for the client
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Missing client id
 *       502:
 *         description: External decompte API failed
 */
router.get('/:clientId/decompte', async (req: Request, res: Response): Promise<void> => {
  const { clientId } = req.params;

  if (!clientId) {
    res.status(400).json({ error: 'clientId is required' });
    return;
  }

  try {
    const entries = await fetchDecompteFromExternal(clientId);
    res.json(entries);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching decompte from external API:', message);
    res.status(502).json({ error: 'Failed to fetch decompte data', details: message });
  }
});

export default router;

