import type { SellerApplicationResponse } from "../../../lib/sellerApi";

export interface ApplicationRecord extends SellerApplicationResponse {
  applicantEmail?: string;
  submittedAt: string;
}
