/*
  Warnings:

  - Made the column `student_id_code` on table `student_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "student_profiles" ALTER COLUMN "student_id_code" SET NOT NULL;
