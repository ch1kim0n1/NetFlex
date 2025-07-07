import "../styles/globals.css";
import "../styles/nprogress.css";
import { QueryClient, QueryClientProvider } from "react-query";
import React from "react";
import ReactGA from "react-ga";
import { events } from "next/router";
import nprogress from "nprogress";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { AuthProvider } from '../src/contexts/AuthContext'
import SecurityAlert from '../components/auth/SecurityAlert'

if (process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
  ReactGA.initialize(process.env.NEXT_PUBLIC_GA_TRACKING_ID);
}

events.on("routeChangeStart", nprogress.start);
events.on("routeChangeError", nprogress.done);
events.on("routeChangeComplete", nprogress.done);

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {process.env.NEXT_PUBLIC_GA_TACKING_ID && (
          <GoogleAnalytics />
        )}
        <Component {...pageProps} />
        <SecurityAlert />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default MyApp;
