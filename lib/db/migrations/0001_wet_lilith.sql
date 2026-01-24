CREATE INDEX "product_formats_product_idx" ON "product_formats" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_formats_format_idx" ON "product_formats" USING btree ("format_id");--> statement-breakpoint
CREATE INDEX "product_type_idx" ON "products" USING btree ("product_type_id");--> statement-breakpoint
CREATE INDEX "occasion_idx" ON "products" USING btree ("occasion_id");--> statement-breakpoint
CREATE INDEX "collection_idx" ON "products" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");