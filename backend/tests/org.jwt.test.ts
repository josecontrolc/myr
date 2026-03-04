/**
 * Integration tests — Tenant-scoped JWT routes
 *
 * Covers:
 *   GET /api/orgs/:orgId/profile    (requires VIEWER+)
 *   GET /api/orgs/:orgId/audit-logs (requires ADMIN+)
 *
 * Scenarios tested per endpoint:
 *   - No Authorization header → 401
 *   - Valid JWT but user is NOT a member → 403 (not a member)
 *   - Valid JWT, member with insufficient role → 403 (insufficient role)
 *   - Valid JWT, member with sufficient role → 200
 */
import request from 'supertest';
import { MemberRole } from '@prisma/client';
import {
  buildApp, prisma, signJwt,
  createTestUser, createTestOrgWithMember,
  cleanupTestOrgs, cleanupTestUsers,
} from './helpers';

const app = buildApp();
const SLUG_PREFIX  = 'test-jwt-org-';
const EMAIL_SUFFIX = '@jwt-org-test.local';

let orgId: string;
let ownerJwt:   string;
let adminJwt:   string;
let managerJwt: string;
let viewerJwt:  string;
let outsiderJwt: string;

beforeAll(async () => {
  const owner   = await createTestUser(`owner${EMAIL_SUFFIX}`);
  const admin   = await createTestUser(`admin${EMAIL_SUFFIX}`);
  const manager = await createTestUser(`manager${EMAIL_SUFFIX}`);
  const viewer  = await createTestUser(`viewer${EMAIL_SUFFIX}`);
  const outsider= await createTestUser(`outsider${EMAIL_SUFFIX}`);

  const org = await createTestOrgWithMember(`${SLUG_PREFIX}main`, owner.id, MemberRole.OWNER);
  orgId = org.id;
  await prisma.member.createMany({
    data: [
      { userId: admin.id,   organizationId: orgId, role: MemberRole.ADMIN },
      { userId: manager.id, organizationId: orgId, role: MemberRole.MANAGER },
      { userId: viewer.id,  organizationId: orgId, role: MemberRole.VIEWER },
    ],
    skipDuplicates: true,
  });

  ownerJwt   = signJwt(owner.id,   owner.email);
  adminJwt   = signJwt(admin.id,   admin.email);
  managerJwt = signJwt(manager.id, manager.email);
  viewerJwt  = signJwt(viewer.id,  viewer.email);
  outsiderJwt= signJwt(outsider.id, outsider.email);
});

afterAll(async () => {
  await cleanupTestOrgs(SLUG_PREFIX);
  await cleanupTestUsers(EMAIL_SUFFIX);
  await prisma.$disconnect();
});

// ─── GET /api/orgs/:orgId/profile (VIEWER+) ──────────────────────────────────

describe('GET /api/orgs/:orgId/profile', () => {
  const path = () => `/api/orgs/${orgId}/profile`;

  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get(path());
    expect(res.status).toBe(401);
  });

  it('returns 403 for outsider (not a member)', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${outsiderJwt}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/not a member/i);
  });

  it('returns 200 for VIEWER', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${viewerJwt}`);
    expect(res.status).toBe(200);
    expect(res.body.organization).toHaveProperty('id', orgId);
    expect(res.body.member).toHaveProperty('role', 'VIEWER');
  });

  it('returns 200 for MANAGER', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${managerJwt}`);
    expect(res.status).toBe(200);
    expect(res.body.member.role).toBe('MANAGER');
  });

  it('returns 200 for OWNER', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${ownerJwt}`);
    expect(res.status).toBe(200);
    expect(res.body.member.role).toBe('OWNER');
  });
});

// ─── GET /api/orgs/:orgId/audit-logs (ADMIN+) ────────────────────────────────

describe('GET /api/orgs/:orgId/audit-logs', () => {
  const path = () => `/api/orgs/${orgId}/audit-logs`;

  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get(path());
    expect(res.status).toBe(401);
  });

  it('returns 403 for outsider (not a member)', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${outsiderJwt}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 for VIEWER (insufficient role)', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${viewerJwt}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/insufficient role/i);
    expect(res.body.yourRole).toBe('VIEWER');
    expect(res.body.requiredRole).toBe('ADMIN');
  });

  it('returns 403 for MANAGER (insufficient role)', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${managerJwt}`);
    expect(res.status).toBe(403);
  });

  it('returns 200 for ADMIN', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${adminJwt}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 200 for OWNER', async () => {
    const res = await request(app).get(path()).set('Authorization', `Bearer ${ownerJwt}`);
    expect(res.status).toBe(200);
  });
});
