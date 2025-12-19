import type { Timestamp } from "firebase/firestore";

export type Receipt = {
  id: string;
  merchant_name: string;
  total_amount: number;
  image_url: string;
  created_at: Timestamp;
};

export type ReceiptDisplay = Omit<Receipt, "created_at"> & {
  created_at: string;
};
