import { getMovieStreamingUrls, extractImdbId } from './streaming.js';

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

export const getMovieDetails = async (id) => {
  try {
    // Fetch movie details and external IDs in parallel
    const [movieResponse, externalIdsResponse] = await Promise.all([
      fetch(`${baseUrl}/movie/${id}?api_key=${apiKey}&language=en-US`),
      fetch(`${baseUrl}/movie/${id}/external_ids?api_key=${apiKey}`)
    ]);
    
    const data = await movieResponse.json();
    const externalIds = await externalIdsResponse.json();
    
    // Extract IMDB ID and generate streaming URLs
    const imdbId = extractImdbId(externalIds);
    const streamingUrls = getMovieStreamingUrls(imdbId, id.toString());
    
    return {
      id: data.id,
      title: {
        english: data.title,
        original: data.original_title,
      },
      image: `${imageBaseUrl}${data.poster_path}`,
      bannerImage: `${imageBaseUrl}${data.backdrop_path}`,
      description: data.overview,
      status: data.status,
      rating: data.vote_average,
      runtime: data.runtime,
      genres: data.genres,
      releaseDate: data.release_date,
      budget: data.budget,
      revenue: data.revenue,
      productionCompanies: data.production_companies,
      imdbId,
      externalIds,
      streaming: streamingUrls,
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export const getPopularMovies = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
    const data = await response.json();
    return data.results?.slice(0, count).map(movie => ({
      id: movie.id,
      title: {
        english: movie.title,
        original: movie.original_title,
      },
      image: `${imageBaseUrl}${movie.poster_path}`,
      bannerImage: `${imageBaseUrl}${movie.backdrop_path}`,
      description: movie.overview,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      genres: movie.genre_ids,
    })) || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const getTrendingMovies = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/trending/movie/week?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    return data.results?.slice(0, count).map(movie => ({
      id: movie.id,
      title: {
        english: movie.title,
        original: movie.original_title,
      },
      image: `${imageBaseUrl}${movie.poster_path}`,
      bannerImage: `${imageBaseUrl}${movie.backdrop_path}`,
      description: movie.overview,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      genres: movie.genre_ids,
    })) || [];
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

export const getTopRatedMovies = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`);
    const data = await response.json();
    return data.results?.slice(0, count).map(movie => ({
      id: movie.id,
      title: {
        english: movie.title,
        original: movie.original_title,
      },
      image: `${imageBaseUrl}${movie.poster_path}`,
      bannerImage: `${imageBaseUrl}${movie.backdrop_path}`,
      description: movie.overview,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      genres: movie.genre_ids,
    })) || [];
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

export const getUpcomingMovies = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`);
    const data = await response.json();
    return data.results?.slice(0, count).map(movie => ({
      id: movie.id,
      title: {
        english: movie.title,
        original: movie.original_title,
      },
      image: `${imageBaseUrl}${movie.poster_path}`,
      bannerImage: `${imageBaseUrl}${movie.backdrop_path}`,
      description: movie.overview,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      genres: movie.genre_ids,
    })) || [];
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    return [];
  }
};

export const getNowPlayingMovies = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`);
    const data = await response.json();
    return data.results?.slice(0, count).map(movie => ({
      id: movie.id,
      title: {
        english: movie.title,
        original: movie.original_title,
      },
      image: `${imageBaseUrl}${movie.poster_path}`,
      bannerImage: `${imageBaseUrl}${movie.backdrop_path}`,
      description: movie.overview,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      genres: movie.genre_ids,
    })) || [];
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    return [];
  }
};

export const searchMovies = async (query, count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=1`);
    const data = await response.json();
    return data.results?.slice(0, count).map(movie => ({
      id: movie.id,
      title: {
        english: movie.title,
        original: movie.original_title,
      },
      image: movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : null,
      bannerImage: movie.backdrop_path ? `${imageBaseUrl}${movie.backdrop_path}` : null,
      description: movie.overview,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      genres: movie.genre_ids,
    })) || [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}; 