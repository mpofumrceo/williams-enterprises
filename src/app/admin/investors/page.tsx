import { getAdminInvestorOpportunities, getAdminInvestorStatistics } from "@/src/lib/data/cms";
import { InvestorsCmsClient } from "./InvestorsCmsClient";

export default async function InvestorsAdminPage() {
  const [opportunities, statistics] = await Promise.all([
    getAdminInvestorOpportunities(),
    getAdminInvestorStatistics(),
  ]);
  return <InvestorsCmsClient opportunities={opportunities} statistics={statistics} />;
}
