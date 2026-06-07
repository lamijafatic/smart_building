-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_apartments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "area" REAL NOT NULL,
    "buildingId" INTEGER NOT NULL,
    "ownerId" INTEGER,
    "activeMode" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "apartments_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "apartments_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_apartments" ("activeMode", "area", "buildingId", "createdAt", "id", "number", "ownerId", "updatedAt") SELECT "activeMode", "area", "buildingId", "createdAt", "id", "number", "ownerId", "updatedAt" FROM "apartments";
DROP TABLE "apartments";
ALTER TABLE "new_apartments" RENAME TO "apartments";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
