import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();
const name = process.env.ADMIN_NAME || 'Novra Admin';
const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters).');
const passwordHash = await hash(password, 12);
await prisma.user.upsert({ where: { email }, create: { name, email, passwordHash, role: 'ADMIN' }, update: { name, passwordHash, role: 'ADMIN' } });
console.log(`Admin ready: ${email}`);
await prisma.$disconnect();
