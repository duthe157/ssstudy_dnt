import "./credit-history.css";
import { Suspense } from "react";
import CreditHistoryClient from "./CreditHistoryClient";

export default function CreditHistoryPage() {
  return (
    <Suspense fallback={null}>
      <CreditHistoryClient />
    </Suspense>
  );
}
