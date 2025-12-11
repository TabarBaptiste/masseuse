/*
  Warnings:

  - You are about to drop the column `isPublished` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum - Ajout de la nouvelle valeur d'enum (doit être committée avant utilisation)
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PENDING_PAYMENT';

-- DropIndex
DROP INDEX IF EXISTS "Review_isPublished_idx";

-- AlterTable - Ajout des colonnes Stripe sur Booking (sans changer le default encore)
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "depositAmount" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "depositPaidAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isDepositPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN IF EXISTS "isPublished";
ALTER TABLE "Review" ALTER COLUMN "isApproved" SET DEFAULT true;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "depositAmount" DECIMAL(10,2) NOT NULL DEFAULT 20,
ADD COLUMN IF NOT EXISTS "depositRequired" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_stripeSessionId_key" ON "Booking"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Booking_stripeSessionId_idx" ON "Booking"("stripeSessionId");
