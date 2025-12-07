import { ReceiptDataTable } from "@/components/usecase/receiptDataTable";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black gap-12">
      <ReceiptDataTable />
    </main>
  );
}
