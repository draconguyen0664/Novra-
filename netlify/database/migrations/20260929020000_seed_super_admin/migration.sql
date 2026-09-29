-- Seed the first Novra CMS super administrator.
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "active", "createdAt", "updatedAt")
VALUES ('c0038152-515b-4861-91fe-9aa8ca560b3b', 'Novra Super Admin', 'draconguyen0664@gmail.com', '$2b$12$GdYPSmBmFX/PxsPnto/IauwPcvk5xapDAgzPzNK0HofiQrrl0Hz3q', 'SUPER_ADMIN'::"UserRole", true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "passwordHash" = EXCLUDED."passwordHash",
  "role" = EXCLUDED."role",
  "active" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
