import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import MainLayout from "../../../components/ui/MainLayout";
import ShowCard from "../../../components/shows/ShowCard";
import { searchShows } from '../../../src/handlers/shows';
import { FaArrowLeft } from 'react-icons/fa';

function ShowSearchPage() {
  const router = useRouter();
  const { searchId } = router.query;
  const [showSearchData, setShowSearchData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchId) {
      const fetchSearchResults = async () => {
        try {
          const results = await searchShows(searchId, 24);
          setShowSearchData(results);
        } catch (error) {
          console.error('Error searching shows:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSearchResults();
    }
  }, [searchId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-netflix-white text-xl">Searching TV Shows...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{"TV Show Search Results For: " + searchId + " - NetFlex"}</title>
        <meta
          name="description"
          content="Search results for TV shows on NetFlex streaming platform."
        />
        <meta
          property="og:title"
          content={"TV Show Search Results For: " + searchId + " - NetFlex"}
        />
        <meta
          property="og:description"
          content="Search results for TV shows on NetFlex streaming platform."
        />
      </Head>
      
      <MainLayout useHead={false} type={"shows"}>
        <div className="pt-10 px-8">
          {/* Back Button */}
          <div className="mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-netflix-text-gray hover:text-netflix-white transition-colors group"
            >
              <FaArrowLeft className="group-hover:translate-x-[-2px] transition-transform" />
              <span>Back</span>
            </button>
          </div>

          <h1 className="text-netflix-white text-2xl font-bold mb-6">
            Search Results &gt; {searchId}
          </h1>

          {showSearchData.length === 0 && (
            <div className="text-center mt-10 text-2xl text-netflix-text-gray">
              No TV Shows Found
            </div>
          )}

          {showSearchData.length > 0 && (
            <div className="pb-10 mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {showSearchData.map((show) => (
                <ShowCard key={show.id} data={show} />
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}

export default ShowSearchPage; 