/**
 * Shared test helpers: app factory, JWT signing, Prisma seed utilities.
 *
 * The tests use an in-process Express app (no real HTTP server) so supertest
 * can intercept requests. The database used is whatever DATABASE_URL points to
 * (the dev Postgres). Each test suite should clean up the rows it creates.
 */
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { PrismaClient, MemberRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { jwtAuth } from '../src/middleware/jwtAuth';
import { adminAuth } from '../src/middleware/adminAuth';
import adminRouter from '../src/routes/admin';
import orgResourcesRouter from '../src/routes/organizationResources';

export const prisma = new PrismaClient();

export const ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'change_me_admin_secret';
export const JWT_SECRET   = process.env.JWT_SECRET   ?? 'change_me_jwt_secret';

/** Build a minimal Express app wired identically to index.ts for testing. */
export function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(jwtAuth);
  app.use('/api/orgs', orgResourcesRouter);
  app.use('/api/admin', adminAuth);
  app.use('/api/admin', adminRouter);
  return app;
}

/** Sign a JWT that jwtAuth will accept. */
export function signJwt(userId: string, email: string, roles: string[] = []) {
  return jwt.sign({ userId, email, roles }, JWT_SECRET, { expiresIn: '1h' });
}

/** Create a minimal user for testing purposes. */
export async function createTestUser(email: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, emailVerified: false },
  });
}

/** Create an org + a member linking the user to it. */
export async function createTestOrgWithMember(
  slug: string,
  userId: string,
  role: MemberRole
) {
  const org = await prisma.organization.upsert({
    where: { slug },
    update: {},
    create: { name: slug, slug },
  });
  await prisma.member.upsert({
    where: { userId_organizationId: { userId, organizationId: org.id } },
    update: { role },
    create: { userId, organizationId: org.id, role },
  });
  return org;
}

/** Delete test-created rows by slug prefix to keep the DB clean. */
export async function cleanupTestOrgs(slugPrefix: string) {
  const orgs = await prisma.organization.findMany({
    where: { slug: { startsWith: slugPrefix } },
  });
  for (const org of orgs) {
    await prisma.member.deleteMany({ where: { organizationId: org.id } });
    await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
  }
}

export async function cleanupTestUsers(emailSuffix: string) {
  await prisma.user.deleteMany({ where: { email: { endsWith: emailSuffix } } });
}
