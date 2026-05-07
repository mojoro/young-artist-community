-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "application_deadline" DATE,
    "tuition" DOUBLE PRECISION,
    "application_fee" DOUBLE PRECISION,
    "age_min" INTEGER,
    "age_max" INTEGER,
    "offers_scholarship" BOOLEAN NOT NULL DEFAULT false,
    "application_url" TEXT,
    "program_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "year_attended" INTEGER,
    "reviewer_name" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_like" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audition" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "time_slot" TIMESTAMP(3),
    "audition_fee" DOUBLE PRECISION,
    "instructions" TEXT,
    "registration_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_instrument" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "instrument_id" TEXT NOT NULL,

    CONSTRAINT "program_instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_category" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "program_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_location" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,

    CONSTRAINT "program_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audition_instrument" (
    "id" TEXT NOT NULL,
    "audition_id" TEXT NOT NULL,
    "instrument_id" TEXT NOT NULL,

    CONSTRAINT "audition_instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "composer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_production" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "production_id" TEXT NOT NULL,

    CONSTRAINT "program_production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_revision" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "edit_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "program_id" TEXT,
    "review_id" TEXT,
    "report_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reporter_email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "schedule" TEXT,
    "program_id" TEXT,
    "last_fetched_at" TIMESTAMP(3),
    "last_content_hash" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_run" (
    "id" TEXT NOT NULL,
    "import_source_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "result" TEXT NOT NULL,
    "error_message" TEXT,
    "http_status" INTEGER,
    "content_hash" TEXT,
    "raw_html_gz" BYTEA,
    "raw_html_size" INTEGER,
    "extraction_model" TEXT,
    "extraction_tokens_in" INTEGER,
    "extraction_tokens_out" INTEGER,

    CONSTRAINT "import_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_candidate" (
    "id" TEXT NOT NULL,
    "import_source_id" TEXT NOT NULL,
    "import_run_id" TEXT NOT NULL,
    "program_id" TEXT,
    "extracted_json" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewer_notes" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_vote" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "program_slug_key" ON "program"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "review_like_review_id_ip_hash_key" ON "review_like"("review_id", "ip_hash");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_name_key" ON "instrument"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "program_instrument_program_id_instrument_id_key" ON "program_instrument"("program_id", "instrument_id");

-- CreateIndex
CREATE UNIQUE INDEX "program_category_program_id_category_id_key" ON "program_category"("program_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "program_location_program_id_location_id_key" ON "program_location"("program_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "audition_instrument_audition_id_instrument_id_key" ON "audition_instrument"("audition_id", "instrument_id");

-- CreateIndex
CREATE UNIQUE INDEX "program_production_program_id_production_id_key" ON "program_production"("program_id", "production_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_email_key" ON "subscriber"("email");

-- CreateIndex
CREATE INDEX "program_revision_program_id_created_at_idx" ON "program_revision"("program_id", "created_at");

-- CreateIndex
CREATE INDEX "report_status_created_at_idx" ON "report"("status", "created_at");

-- CreateIndex
CREATE INDEX "feedback_status_created_at_idx" ON "feedback"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "import_source_url_key" ON "import_source"("url");

-- CreateIndex
CREATE INDEX "import_run_import_source_id_started_at_idx" ON "import_run"("import_source_id", "started_at");

-- CreateIndex
CREATE INDEX "program_candidate_status_created_at_idx" ON "program_candidate"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "platform_vote_platform_ip_hash_key" ON "platform_vote"("platform", "ip_hash");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audition" ADD CONSTRAINT "audition_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audition" ADD CONSTRAINT "audition_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_instrument" ADD CONSTRAINT "program_instrument_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_instrument" ADD CONSTRAINT "program_instrument_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_category" ADD CONSTRAINT "program_category_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_category" ADD CONSTRAINT "program_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_location" ADD CONSTRAINT "program_location_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_location" ADD CONSTRAINT "program_location_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audition_instrument" ADD CONSTRAINT "audition_instrument_audition_id_fkey" FOREIGN KEY ("audition_id") REFERENCES "audition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audition_instrument" ADD CONSTRAINT "audition_instrument_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_production" ADD CONSTRAINT "program_production_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_production" ADD CONSTRAINT "program_production_production_id_fkey" FOREIGN KEY ("production_id") REFERENCES "production"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_revision" ADD CONSTRAINT "program_revision_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_source" ADD CONSTRAINT "import_source_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_run" ADD CONSTRAINT "import_run_import_source_id_fkey" FOREIGN KEY ("import_source_id") REFERENCES "import_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_candidate" ADD CONSTRAINT "program_candidate_import_source_id_fkey" FOREIGN KEY ("import_source_id") REFERENCES "import_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_candidate" ADD CONSTRAINT "program_candidate_import_run_id_fkey" FOREIGN KEY ("import_run_id") REFERENCES "import_run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_candidate" ADD CONSTRAINT "program_candidate_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
