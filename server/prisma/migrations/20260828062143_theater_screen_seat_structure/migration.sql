/*
  Warnings:

  - The primary key for the `movies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `posterUrl` on the `movies` table. All the data in the column will be lost.
  - You are about to drop the column `runtimeMin` on the `movies` table. All the data in the column will be lost.
  - The `id` column on the `movies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `title` on the `movies` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `genre` on the `movies` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - The primary key for the `reservation_seats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `reservationId` on the `reservation_seats` table. All the data in the column will be lost.
  - You are about to drop the column `seatId` on the `reservation_seats` table. All the data in the column will be lost.
  - The `id` column on the `reservation_seats` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `reservations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `showtimeId` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `reservations` table. All the data in the column will be lost.
  - The `id` column on the `reservations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `seats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `showtimeId` on the `seats` table. All the data in the column will be lost.
  - The `id` column on the `seats` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `row` on the `seats` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(5)`.
  - The primary key for the `showtimes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `movieId` on the `showtimes` table. All the data in the column will be lost.
  - You are about to drop the column `screenName` on the `showtimes` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `showtimes` table. All the data in the column will be lost.
  - The `id` column on the `showtimes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - A unique constraint covering the columns `[showtime_id,seat_id]` on the table `reservation_seats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[screen_id,row,number]` on the table `seats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `runtime_min` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation_id` to the `reservation_seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seat_id` to the `reservation_seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `showtime_id` to the `reservation_seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `showtime_id` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `screen_id` to the `seats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_at` to the `showtimes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movie_id` to the `showtimes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `screen_id` to the `showtimes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_at` to the `showtimes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "reservation_seats" DROP CONSTRAINT "reservation_seats_reservationId_fkey";

-- DropForeignKey
ALTER TABLE "reservation_seats" DROP CONSTRAINT "reservation_seats_seatId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_showtimeId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_userId_fkey";

-- DropForeignKey
ALTER TABLE "seats" DROP CONSTRAINT "seats_showtimeId_fkey";

-- DropForeignKey
ALTER TABLE "showtimes" DROP CONSTRAINT "showtimes_movieId_fkey";

-- DropIndex
DROP INDEX "reservation_seats_seatId_key";

-- DropIndex
DROP INDEX "reservations_showtimeId_idx";

-- DropIndex
DROP INDEX "reservations_userId_idx";

-- DropIndex
DROP INDEX "seats_showtimeId_row_number_key";

-- DropIndex
DROP INDEX "showtimes_movieId_idx";

-- AlterTable
ALTER TABLE "movies" DROP CONSTRAINT "movies_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "posterUrl",
DROP COLUMN "runtimeMin",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(6),
ADD COLUMN     "poster_url" VARCHAR(255),
ADD COLUMN     "release_date" DATE,
ADD COLUMN     "runtime_min" INTEGER NOT NULL,
ADD COLUMN     "score" DECIMAL(2,1) NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(6),
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "genre" SET DATA TYPE VARCHAR(30),
ADD CONSTRAINT "movies_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "reservation_seats" DROP CONSTRAINT "reservation_seats_pkey",
DROP COLUMN "reservationId",
DROP COLUMN "seatId",
ADD COLUMN     "reservation_id" BIGINT NOT NULL,
ADD COLUMN     "seat_id" BIGINT NOT NULL,
ADD COLUMN     "showtime_id" BIGINT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "reservation_seats_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "showtimeId",
DROP COLUMN "totalPrice",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "showtime_id" BIGINT NOT NULL,
ADD COLUMN     "total_price" INTEGER NOT NULL,
ADD COLUMN     "user_id" BIGINT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "reservations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "seats" DROP CONSTRAINT "seats_pkey",
DROP COLUMN "showtimeId",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "screen_id" BIGINT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ALTER COLUMN "row" SET DATA TYPE VARCHAR(5),
ADD CONSTRAINT "seats_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "showtimes" DROP CONSTRAINT "showtimes_pkey",
DROP COLUMN "movieId",
DROP COLUMN "screenName",
DROP COLUMN "startAt",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_at" TIMESTAMP(6) NOT NULL,
ADD COLUMN     "movie_id" BIGINT NOT NULL,
ADD COLUMN     "screen_id" BIGINT NOT NULL,
ADD COLUMN     "start_at" TIMESTAMP(6) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "showtimes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(6),
ADD COLUMN     "updated_at" TIMESTAMP(6),
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(50),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "theaters" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(200),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "theaters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screens" (
    "id" BIGSERIAL NOT NULL,
    "theater_id" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "seat_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "screens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "screens_theater_id_idx" ON "screens"("theater_id");

-- CreateIndex
CREATE UNIQUE INDEX "screens_theater_id_name_key" ON "screens"("theater_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_seats_showtime_id_seat_id_key" ON "reservation_seats"("showtime_id", "seat_id");

-- CreateIndex
CREATE INDEX "reservations_user_id_idx" ON "reservations"("user_id");

-- CreateIndex
CREATE INDEX "reservations_showtime_id_idx" ON "reservations"("showtime_id");

-- CreateIndex
CREATE INDEX "seats_screen_id_idx" ON "seats"("screen_id");

-- CreateIndex
CREATE UNIQUE INDEX "seats_screen_id_row_number_key" ON "seats"("screen_id", "row", "number");

-- CreateIndex
CREATE INDEX "showtimes_movie_id_idx" ON "showtimes"("movie_id");

-- CreateIndex
CREATE INDEX "showtimes_screen_id_idx" ON "showtimes"("screen_id");

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "screens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "screens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_showtime_id_fkey" FOREIGN KEY ("showtime_id") REFERENCES "showtimes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_showtime_id_fkey" FOREIGN KEY ("showtime_id") REFERENCES "showtimes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
