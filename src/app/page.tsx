import { ReceiptDataTable } from "@/components/usecase/receiptDataTable";

export default function Home() {
  return (
    <main>
      <h1>領収書一覧</h1>
      <p>領収書は{"<会社ID>@uldaebeloo.resend.app"}に送信してください</p>
      <ReceiptDataTable />
    </main>
  );
}
