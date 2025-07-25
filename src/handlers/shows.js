import { getShowStreamingUrls, getEpisodeStreamingUrls, extractImdbId } from './streaming.js';

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

// Animation genre ID to filter out anime content from TV shows
const ANIMATION_GENRE_ID = 16;

// Helper function to filter out anime content
const filterOutAnime = (results) => {
  return results.filter(item => {
    // Exclude content with animation genre AND Japanese origin
    const hasAnimationGenre = item.genre_ids?.includes(ANIMATION_GENRE_ID);
    const isJapanese = item.origin_country?.includes('JP') || item.original_language === 'ja';
    return !(hasAnimationGenre && isJapanese);
  });
};

export const getShowDetails = async (id) => {
  try {
    // Fetch show details and external IDs in parallel
    const [showResponse, externalIdsResponse] = await Promise.all([
      fetch(`${baseUrl}/tv/${id}?api_key=${apiKey}&language=en-US`),
      fetch(`${baseUrl}/tv/${id}/external_ids?api_key=${apiKey}`)
    ]);
    
    const data = await showResponse.json();
    const externalIds = await externalIdsResponse.json();
    
    // Extract IMDB ID and generate streaming URLs
    const imdbId = extractImdbId(externalIds);
    const streamingUrls = getShowStreamingUrls(imdbId, id.toString());
    
    return {
      id: data.id,
      title: {
        english: data.name,
        original: data.original_name,
      },
      image: `${imageBaseUrl}${data.poster_path}`,
      bannerImage: `${imageBaseUrl}${data.backdrop_path}`,
      description: data.overview,
      status: data.status,
      rating: data.vote_average,
      totalEpisodes: data.number_of_episodes,
      seasons: data.number_of_seasons,
      genres: data.genres,
      releaseDate: data.first_air_date,
      networks: data.networks,
      imdbId,
      externalIds,
      streaming: streamingUrls,
      type: 'show',
    };
  } catch (error) {
    console.error('Error fetching show details:', error);
    return null;
  }
};

export const getShowEpisodes = async (id, season = 1) => {
  try {
    // Fetch episodes and external IDs in parallel
    const [episodesResponse, externalIdsResponse] = await Promise.all([
      fetch(`${baseUrl}/tv/${id}/season/${season}?api_key=${apiKey}&language=en-US`),
      fetch(`${baseUrl}/tv/${id}/external_ids?api_key=${apiKey}`)
    ]);
    
    const data = await episodesResponse.json();
    const externalIds = await externalIdsResponse.json();
    
    // Extract IMDB ID for streaming URLs
    const imdbId = extractImdbId(externalIds);
    
    return data.episodes?.map(episode => {
      const streamingUrls = getEpisodeStreamingUrls(imdbId, id.toString(), season, episode.episode_number);
      
      return {
        id: episode.id,
        title: episode.name,
        episodeNumber: episode.episode_number,
        seasonNumber: episode.season_number,
        overview: episode.overview,
        airDate: episode.air_date,
        runtime: episode.runtime,
        rating: episode.vote_average,
        image: episode.still_path ? `${imageBaseUrl}${episode.still_path}` : null,
        streaming: streamingUrls,
        imdbId,
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching show episodes:', error);
    return [];
  }
};

export const getPopularShows = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/tv/popular?api_key=${apiKey}&language=en-US&page=1`);
    const data = await response.json();
    
    // Filter out anime content and add type
    const filteredResults = filterOutAnime(data.results || []);
    
    return filteredResults.slice(0, count).map(show => ({
      id: show.id,
      title: {
        english: show.name,
        original: show.original_name,
      },
      image: `${imageBaseUrl}${show.poster_path}`,
      bannerImage: `${imageBaseUrl}${show.backdrop_path}`,
      description: show.overview,
      rating: show.vote_average,
      releaseDate: show.first_air_date,
      genres: show.genre_ids,
      type: 'show',
    }));
  } catch (error) {
    console.error('Error fetching popular shows:', error);
    return [];
  }
};

export const getTrendingShows = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/trending/tv/week?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    
    // Filter out anime content and add type
    const filteredResults = filterOutAnime(data.results || []);
    
    return filteredResults.slice(0, count).map(show => ({
      id: show.id,
      title: {
        english: show.name,
        original: show.original_name,
      },
      image: `${imageBaseUrl}${show.poster_path}`,
      bannerImage: `${imageBaseUrl}${show.backdrop_path}`,
      description: show.overview,
      rating: show.vote_average,
      releaseDate: show.first_air_date,
      genres: show.genre_ids,
      type: 'show',
    }));
  } catch (error) {
    console.error('Error fetching trending shows:', error);
    return [];
  }
};

export const getTopRatedShows = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/tv/top_rated?api_key=${apiKey}&language=en-US&page=1`);
    const data = await response.json();
    
    // Filter out anime content and add type
    const filteredResults = filterOutAnime(data.results || []);
    
    return filteredResults.slice(0, count).map(show => ({
      id: show.id,
      title: {
        english: show.name,
        original: show.original_name,
      },
      image: `${imageBaseUrl}${show.poster_path}`,
      bannerImage: `${imageBaseUrl}${show.backdrop_path}`,
      description: show.overview,
      rating: show.vote_average,
      releaseDate: show.first_air_date,
      genres: show.genre_ids,
      type: 'show',
    }));
  } catch (error) {
    console.error('Error fetching top rated shows:', error);
    return [];
  }
};

export const getOnTheAirShows = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/tv/on_the_air?api_key=${apiKey}&language=en-US&page=1`);
    const data = await response.json();
    
    // Filter out anime content and add type
    const filteredResults = filterOutAnime(data.results || []);
    
    return filteredResults.slice(0, count).map(show => ({
      id: show.id,
      title: {
        english: show.name,
        original: show.original_name,
      },
      image: `${imageBaseUrl}${show.poster_path}`,
      bannerImage: `${imageBaseUrl}${show.backdrop_path}`,
      description: show.overview,
      rating: show.vote_average,
      releaseDate: show.first_air_date,
      genres: show.genre_ids,
      type: 'show',
    }));
  } catch (error) {
    console.error('Error fetching on the air shows:', error);
    return [];
  }
};

export const getShowSeasons = async (id) => {
  try {
    const response = await fetch(`${baseUrl}/tv/${id}?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    
    return data.seasons?.map(season => ({
      id: season.id,
      seasonNumber: season.season_number,
      name: season.name,
      overview: season.overview,
      posterPath: season.poster_path ? `${imageBaseUrl}${season.poster_path}` : null,
      airDate: season.air_date,
      episodeCount: season.episode_count,
    })) || [];
  } catch (error) {
    console.error('Error fetching show seasons:', error);
    return [];
  }
};

export const getGenres = async () => {
  try {
    const response = await fetch(`${baseUrl}/genre/tv/list?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    return [];
  }
};

export const getShowsByGenre = async (genreId, count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/discover/tv?api_key=${apiKey}&language=en-US&with_genres=${genreId}&page=1`);
    const data = await response.json();
    
    // Filter out anime content and add type
    const filteredResults = filterOutAnime(data.results || []);
    
    return filteredResults.slice(0, count).map(show => ({
      id: show.id,
      title: {
        english: show.name,
        original: show.original_name,
      },
      image: `${imageBaseUrl}${show.poster_path}`,
      bannerImage: `${imageBaseUrl}${show.backdrop_path}`,
      description: show.overview,
      rating: show.vote_average,
      releaseDate: show.first_air_date,
      genres: show.genre_ids,
      type: 'show',
    }));
  } catch (error) {
    console.error('Error fetching shows by genre:', error);
    return [];
  }
};

export const searchShows = async (query, count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/search/tv?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=1`);
    const data = await response.json();
    
    // Filter out anime content and add type
    const filteredResults = filterOutAnime(data.results || []);
    
    return filteredResults.slice(0, count).map(show => ({
      id: show.id,
      title: {
        english: show.name,
        original: show.original_name,
      },
      image: show.poster_path ? `${imageBaseUrl}${show.poster_path}` : null,
      bannerImage: show.backdrop_path ? `${imageBaseUrl}${show.backdrop_path}` : null,
      description: show.overview,
      rating: show.vote_average,
      releaseDate: show.first_air_date,
      genres: show.genre_ids,
      type: 'show',
    }));
  } catch (error) {
    console.error('Error searching shows:', error);
    return [];
  }
}; 