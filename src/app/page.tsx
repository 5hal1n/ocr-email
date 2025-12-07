import { Button } from "@/components/ui/button";
import { ReceiptDataTable } from "@/components/usecase/receiptDataTable";

const Home = () => {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">領収書一覧</h1>
      <p className="mb-4">
        領収書は
        <a
          target="_blank"
          href="mailto:banso@uldaebeloo.resend.app?subject=領収書データの送付"
          rel="noopener"
          className="text-blue-600 underline ml-1 mr-1"
        >
          banso@uldaebeloo.resend.app
        </a>
        に送信してください
      </p>
      <div className="mb-4 outline">
        <ReceiptDataTable />
      </div>
      <div className="flex justify-end">
        <Button variant="default" className="mr-2">
          SaaSインポート
        </Button>
        <Button variant="outline">CSV出力</Button>
      </div>
    </main>
  );
};

export default Home;
