import Head from "next/head";
import MainLayout from "../components/ui/MainLayout";
import AnalyticsDashboard from "../components/ui/AnalyticsDashboard";

export default function Analytics() {
  return (
    <>
      <Head>
        <title>Your Analytics - NetFlex</title>
        <meta name="description" content="View detailed analytics about your streaming habits and preferences on NetFlex." />
      </Head>
      
      <MainLayout>
        <AnalyticsDashboard />
      </MainLayout>
    </>
  );
} 