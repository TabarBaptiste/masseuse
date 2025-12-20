-- Changer le statut par défaut des réservations vers PENDING_PAYMENT
-- Cette migration doit être exécutée après que la valeur PENDING_PAYMENT ait été committée
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';
