/**
 * Integration tests — Admin Member management endpoints
 *
 * Covers: POST/PATCH/DELETE /api/admin/organizations/:orgId/members
 * Auth: x-admin-secret header
 */
import request from 'supertest';
import { MemberRole } from '@prisma/client';
import {
  buildApp, prisma, ADMIN_SECRET,
  createTestUser, createTestOrgWithMember,
  cleanupTestOrgs, cleanupTestUsers,
} from './helpers';

const app = buildApp();
const SLUG_PREFIX   = 'test-member-mgmt-';
const EMAIL_SUFFIX  = '@member-test.local';

let orgId: string;
let memberUserId: string;

beforeAll(async () => {
  const user = await createTestUser(`owner${EMAIL_SUFFIX}`);
  memberUserId = user.id;
  const org = await createTestOrgWithMember(`${SLUG_PREFIX}main`, user.id, MemberRole.OWNER);
  orgId = org.id;
});

afterAll(async () => {
  await cleanupTestOrgs(SLUG_PREFIX);
  await cleanupTestUsers(EMAIL_SUFFIX);
  await prisma.$disconnect();
});

describe('GET /api/admin/organizations/:orgId/members', () => {
  it('returns 403 without x-admin-secret', async () => {
    const res = await request(app).get(`/api/admin/organizations/${orgId}/members`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for nonexistent org', async () => {
    const res = await request(app)
      .get('/api/admin/organizations/nonexistent-org/members')
      .set('x-admin-secret', ADMIN_SECRET);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns paginated members for existing org', async () => {
    const res = await request(app)
      .get(`/api/admin/organizations/${orgId}/members`)
      .set('x-admin-secret', ADMIN_SECRET);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toHaveProperty('role');
    expect(res.body.data[0]).toHaveProperty('user');
  });
});

describe('POST /api/admin/organizations/:orgId/members', () => {
  it('returns 400 for missing email', async () => {
    const res = await request(app)
      .post(`/api/admin/organizations/${orgId}/members`)
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ role: 'VIEWER' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 400 for invalid role', async () => {
    const res = await request(app)
      .post(`/api/admin/organizations/${orgId}/members`)
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ email: `owner${EMAIL_SUFFIX}`, role: 'SUPERADMIN' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when user email not found', async () => {
    const res = await request(app)
      .post(`/api/admin/organizations/${orgId}/members`)
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ email: 'nobody@nowhere.invalid', role: 'VIEWER' });
    expect(res.status).toBe(404);
  });

  it('adds an existing user as MANAGER', async () => {
    const newUser = await createTestUser(`manager${EMAIL_SUFFIX}`);
    const res = await request(app)
      .post(`/api/admin/organizations/${orgId}/members`)
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ email: newUser.email, role: 'MANAGER' });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('MANAGER');
    expect(res.body.user.email).toBe(newUser.email);
  });
});

describe('PATCH /api/admin/organizations/:orgId/members/:userId', () => {
  it('returns 404 for non-member userId', async () => {
    const res = await request(app)
      .patch(`/api/admin/organizations/${orgId}/members/no-such-user`)
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ role: 'VIEWER' });
    expect(res.status).toBe(404);
  });

  it('changes role successfully', async () => {
    const res = await request(app)
      .patch(`/api/admin/organizations/${orgId}/members/${memberUserId}`)
      .set('x-admin-secret', ADMIN_SECRET)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ADMIN');
  });
});

describe('DELETE /api/admin/organizations/:orgId/members/:userId', () => {
  it('returns 404 for non-member', async () => {
    const res = await request(app)
      .delete(`/api/admin/organizations/${orgId}/members/no-such-user`)
      .set('x-admin-secret', ADMIN_SECRET);
    expect(res.status).toBe(404);
  });

  it('removes a member successfully', async () => {
    const toRemove = await createTestUser(`to-remove${EMAIL_SUFFIX}`);
    await prisma.member.create({
      data: { userId: toRemove.id, organizationId: orgId, role: MemberRole.VIEWER },
    });

    const res = await request(app)
      .delete(`/api/admin/organizations/${orgId}/members/${toRemove.id}`)
      .set('x-admin-secret', ADMIN_SECRET);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(toRemove.id);

    const gone = await prisma.member.findUnique({
      where: { userId_organizationId: { userId: toRemove.id, organizationId: orgId } },
    });
    expect(gone).toBeNull();
  });
});
