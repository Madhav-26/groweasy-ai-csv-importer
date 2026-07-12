-- CreateTable
CREATE TABLE "ImportRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "imported" INTEGER NOT NULL,
    "skipped" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "importId" TEXT NOT NULL,
    "createdAt" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "crmStatus" TEXT,
    "crmNote" TEXT,
    "dataSource" TEXT,
    "description" TEXT,
    CONSTRAINT "Lead_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ImportRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
