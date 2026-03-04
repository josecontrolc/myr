/**
 * Integration tests — Admin Organization endpoints
 *
 * Covers: GET /api/admin/organizations, POST, PATCH
 * Auth: x-admin-secret header (correct vs incorrect)
 */
import request from 'supertest';
import {
  buildApp, prisma, ADMIN_SECRET,
  cleanupTestOrgs,
} from './helpers';

const app = buildApp();
const SLUG_PREFIX = 'test-admin-org-';

afterAll(async () => {
  await cleanupTestOrgs(SLUG_PREFIX);
  await prisma.$disconnect();
});

describe('GET /api/admin/organizations', () => {
  it('returns 403 without x-admin-secret', async () => {
    const res = await request(app).get('/api/admin/organizations');
    expect(res.status).toBe(403);
  });

  it('returns 403 with wrong x-admin-secret', async () => {
    const res = await request(app)
      .get('/api/admin/organizations')
      .set('x-admin-secret', 'wrong-secret');
    expect(res.status).toBe(403);
  });

  it('returns 200 with paginated result when authenticated', async () => {
    const res = await request(app)
      .get('/api/admin/organizations?page=1&limit=5')
      .set('x-admin-secret', ADMIN_SECRET);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 5);
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/admin/organizations', () => {
  it('returns 403 without x-admin-secret', async () => {
    const res = await request(app)
      .post('/api/admin/organizations')
      .send({ name: 'X', slug: 'x' });
    expect(res.status).toBe(403);
  });

  it('returns 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/admin/organizations')
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ slug: `${SLUG_PREFIX}no-name` });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('returns 400 if slug is missing', async () => {
    const res = await request(app)
      .post('/api/admin/organizations')
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ name: 'No Slug' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/slug/i);
  });

  it('returns 400 if slug contains invalid chars', async () => {
    const res = await request(app)
      .post('/api/admin/organizations')
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ name: 'Bad', slug: 'has spaces!' });
    expect(res.status).toBe(400);
  });

  it('creates an organization and returns 201', async () => {
    const slug = `${SLUG_PREFIX}create-ok`;
    const res = await request(app)
      .post('/api/admin/organizations')
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ name: 'Test Org Create', slug, externalReferenceId: 'EXT-TEST' });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe(slug);
    expect(res.body.name).toBe('Test Org Create');
    expect(res.body.externalReferenceId).toBe('EXT-TEST');
  });

  it('returns 400 for duplicate slug', async () => {
    const slug = `${SLUG_PREFIX}dup-slug`;
    await request(app)
      .post('/api/admin/organizations')
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ name: 'Dup 1', slug });
    const res = await request(app)
      .post('/api/admin/organizations')
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ name: 'Dup 2', slug });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });
});

describe('PATCH /api/admin/organizations/:orgId', () => {
  it('returns 404 for nonexistent org', async () => {
    const res = await request(app)
      .patch('/api/admin/organizations/nonexistent-id-xxx')
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ name: 'New Name' });
    expect(res.status).toBe(404);
  });

  it('updates name successfully', async () => {
    const slug = `${SLUG_PREFIX}patch-ok`;
    const created = await request(app)
      .post('/api/admin/organizations')
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ name: 'Before Patch', slug });
    expect(created.status).toBe(201);

    const res = await request(app)
      .patch(`/api/admin/organizations/${created.body.id}`)
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ name: 'After Patch' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('After Patch');
  });
});
