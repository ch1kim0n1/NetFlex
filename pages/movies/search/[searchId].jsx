import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import MainLayout from "../../../components/ui/MainLayout";
import MovieCard from "../../../components/movies/MovieCard";
import { searchMovies } from '../../../src/handlers/movies';

function MovieSearchPage() {
  const router = useRouter();
  const { searchId } = router.query;
  const [movieSearchData, setMovieSearchData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchId) {
      const fetchSearchResults = async () => {
        try {
          const results = await searchMovies(searchId, 24);
          setMovieSearchData(results);
        } catch (error) {
          console.error('Error searching movies:', error);
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
          <div className="text-netflix-white text-xl">Searching Movies...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{"Movie Search Results For: " + searchId + " - NetFlex"}</title>
        <meta
          name="description"
          content="Search results for movies on NetFlex streaming platform."
        />
        <meta
          property="og:title"
          content={"Movie Search Results For: " + searchId + " - NetFlex"}
        />
        <meta
          property="og:description"
          content="Search results for movies on NetFlex streaming platform."
        />
      </Head>
      
      <MainLayout useHead={false} type={"movies"}>
        <div className="pt-10 px-6">
          <h1 className="text-netflix-white text-2xl font-bold mb-6">
            Search Results &gt; {searchId}
          </h1>

          {movieSearchData.length === 0 && (
            <div className="text-center mt-10 text-2xl text-netflix-text-gray">
              No Movies Found
            </div>
          )}

          {movieSearchData.length > 0 && (
            <div className="pb-10 mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {movieSearchData.map((movie) => (
                <MovieCard key={movie.id} data={movie} />
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}

export default MovieSearchPage; 