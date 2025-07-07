import Head from "next/head";
import Footer from "./Footer";
import Header from "./Header";

function MainLayout({ children, useHead = true, banner, search = true, landing = false, type, showBrowseButtons = false }) {
  return (
    <div className="bg-netflix-black min-h-screen">
      {useHead && (
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
        </Head>
      )}

      <Header search={search} bg={landing} type={type} showBrowseButtons={showBrowseButtons} />
      {banner && (
        <div className="pt-3 relative max-lg:hidden">
          <img src={banner} className="w-full h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-netflix-black opacity-100"></div>
        </div>
      )}
      <div className="flex">
        <div className="z-10 w-full min-h-[90vh]">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;