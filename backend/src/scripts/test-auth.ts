import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testAuth = async () => {
  console.log('\n=== Better Auth Test Script ===\n');

  // Check auth settings
  console.log('1. Checking SystemSettings...');
  const settings = await prisma.systemSettings.findMany({
    where: {
      settingKey: {
        startsWith: 'auth_'
      }
    }
  });

  console.log(`   Found ${settings.length} auth settings:`);
  settings.forEach(setting => {
    console.log(`   - ${setting.settingKey}: ${setting.isEnabled ? 'enabled' : 'disabled'}`);
  });

  // Check users
  console.log('\n2. Checking users in database...');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      createdAt: true
    }
  });

  if (users.length === 0) {
    console.log('   No users found. Register a user through the UI at http://localhost/register');
  } else {
    console.log(`   Found ${users.length} user(s):`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name || 'no name'})`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Created: ${user.createdAt.toISOString()}`);
    });
  }

  // Check sessions
  console.log('\n3. Checking active sessions...');
  const sessions = await prisma.session.findMany({
    where: {
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  });

  if (sessions.length === 0) {
    console.log('   No active sessions.');
  } else {
    console.log(`   Found ${sessions.length} active session(s):`);
    sessions.forEach(session => {
      console.log(`   - User: ${session.user.email}`);
      console.log(`     Expires: ${session.expiresAt.toISOString()}`);
    });
  }

  console.log('\n=== Test Complete ===\n');
  console.log('Next steps:');
  console.log('  1. Visit http://localhost to see the home page');
  console.log('  2. Click "Create Account" to register a new user');
  console.log('  3. After registration, you will be logged in automatically');
  console.log('  4. Visit the Dashboard to see your user information');
  console.log('  5. Run this script again to see the new user and session\n');
};

const main = async () => {
  try {
    await testAuth();
  } catch (error) {
    console.error('Error testing auth:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
