import Head from "next/head";
import Script from 'next/script'
import { useEffect } from "react";
import LandingPage from "../components/LandingPage";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import ReactGA from "react-ga";
import MainLayout from "../components/ui/MainLayout";

export default function Home() {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
			ReactGA.pageview(window.location.pathname + window.location.search);
		}
	});
	return (
		<>
			<div>
				<div className="App">
					{process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID && process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID && (
						<TawkMessengerReact propertyId={process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID} widgetId={process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID} />
					)}
				</div>
				<Head>
					<title>NetFlex - Stream Movies & TV Shows</title>
					<meta name="title" content="NetFlex - Stream Movies & TV Shows" />
					<meta
						name="description"
						content="Stream unlimited movies and TV shows on NetFlex. Watch anywhere, anytime. No ads, just pure entertainment."
					/>

					<meta property="og:type" content="website" />
					<meta
						property="og:title"
						content="NetFlex - Stream Movies & TV Shows"
					/>
					<meta
						property="og:description"
						content="Stream unlimited movies and TV shows on NetFlex. Watch anywhere, anytime. No ads, just pure entertainment."
					/>


					<meta property="twitter:card" content="summary_large_image" />
					<meta
						property="twitter:title"
						content="NetFlex - Stream Movies & TV Shows"
					/>
					<meta
						property="twitter:description"
						content="Stream unlimited movies and TV shows on NetFlex. Watch anywhere, anytime. No ads, just pure entertainment."
					/>
					<meta name="theme-color" content="#C4AD8A" />
					<link rel="manifest" href="/manifest.json" />
					<link rel="shortcut icon" href="/favicon.ico" />
					<link rel="icon" type="image/png" href="/android-chrome-192x192.png" />
					<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
					<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
				</Head>
				{process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
					<Script src="https://us.umami.is/script.js" data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}></Script>
				)}

					<MainLayout search={false} landing={true}>
						<LandingPage />
					</MainLayout>
			</div>
		</>
	);
}
