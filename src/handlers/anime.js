import { getAnimeStreamingUrls, getAnimeEpisodeStreamingUrls, extractImdbId, getAniListId } from './streaming.js';

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const baseUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

// Animation genre ID in TMDB for filtering anime content
const ANIMATION_GENRE_ID = 16;

export const getAnimeDetails = async (id) => {
  try {
    // Fetch anime details and external IDs in parallel
    const [animeResponse, externalIdsResponse] = await Promise.all([
      fetch(`${baseUrl}/tv/${id}?api_key=${apiKey}&language=en-US`),
      fetch(`${baseUrl}/tv/${id}/external_ids?api_key=${apiKey}`)
    ]);
    
    const data = await animeResponse.json();
    const externalIds = await externalIdsResponse.json();
    
    // Extract IMDB ID and get AniList ID for anime-specific streaming
    const imdbId = extractImdbId(externalIds);
    const animeTitle = {
      english: data.name,
      original: data.original_name,
    };
    const anilistId = await getAniListId(id.toString(), imdbId, animeTitle.english || animeTitle.original);
    const streamingUrls = getAnimeStreamingUrls(imdbId, id.toString(), anilistId);
    
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
      type: 'anime',
    };
  } catch (error) {
    console.error('Error fetching anime details:', error);
    return null;
  }
};

export const getAnimeEpisodes = async (id, season = 1) => {
  try {
    // Fetch episodes and external IDs in parallel
    const [episodesResponse, externalIdsResponse] = await Promise.all([
      fetch(`${baseUrl}/tv/${id}/season/${season}?api_key=${apiKey}&language=en-US`),
      fetch(`${baseUrl}/tv/${id}/external_ids?api_key=${apiKey}`)
    ]);
    
    const data = await episodesResponse.json();
    const externalIds = await externalIdsResponse.json();
    
    // Extract IMDB ID for streaming URLs and get anime title
    const imdbId = extractImdbId(externalIds);
    
    // Get anime title for episode streaming
    const animeDetailsResponse = await fetch(`${baseUrl}/tv/${id}?api_key=${apiKey}&language=en-US`);
    const animeDetails = await animeDetailsResponse.json();
    const animeTitle = {
      english: animeDetails.name,
      original: animeDetails.original_name,
    };
    
    // Get AniList ID for anime-specific streaming
    const anilistId = await getAniListId(id.toString(), imdbId, animeTitle.english || animeTitle.original);
    
    return data.episodes?.map(episode => {
      const streamingUrls = getAnimeEpisodeStreamingUrls(
        imdbId, 
        id.toString(), 
        season, 
        episode.episode_number, 
        anilistId,
        animeTitle
      );
      
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
    console.error('Error fetching anime episodes:', error);
    return [];
  }
};

export const getAnimeSeasons = async (id) => {
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
    console.error('Error fetching anime seasons:', error);
    return [];
  }
};

export const getPopularAnime = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/discover/tv?api_key=${apiKey}&language=en-US&with_genres=${ANIMATION_GENRE_ID}&with_origin_country=JP&page=1&sort_by=popularity.desc`);
    const data = await response.json();
    return data.results?.slice(0, count).map(anime => ({
      id: anime.id,
      title: {
        english: anime.name,
        original: anime.original_name,
      },
      image: `${imageBaseUrl}${anime.poster_path}`,
      bannerImage: `${imageBaseUrl}${anime.backdrop_path}`,
      description: anime.overview,
      rating: anime.vote_average,
      releaseDate: anime.first_air_date,
      genres: anime.genre_ids,
      type: 'anime',
    })) || [];
  } catch (error) {
    console.error('Error fetching popular anime:', error);
    return [];
  }
};

export const getTrendingAnime = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/trending/tv/week?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    
    // Filter for animation genre and Japanese origin
    const animeResults = data.results?.filter(item => 
      item.genre_ids?.includes(ANIMATION_GENRE_ID) && 
      (item.origin_country?.includes('JP') || item.original_language === 'ja')
    ) || [];
    
    return animeResults.slice(0, count).map(anime => ({
      id: anime.id,
      title: {
        english: anime.name,
        original: anime.original_name,
      },
      image: `${imageBaseUrl}${anime.poster_path}`,
      bannerImage: `${imageBaseUrl}${anime.backdrop_path}`,
      description: anime.overview,
      rating: anime.vote_average,
      releaseDate: anime.first_air_date,
      genres: anime.genre_ids,
      type: 'anime',
    }));
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    return [];
  }
};

export const getTopRatedAnime = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/discover/tv?api_key=${apiKey}&language=en-US&with_genres=${ANIMATION_GENRE_ID}&with_origin_country=JP&page=1&sort_by=vote_average.desc&vote_count.gte=100`);
    const data = await response.json();
    return data.results?.slice(0, count).map(anime => ({
      id: anime.id,
      title: {
        english: anime.name,
        original: anime.original_name,
      },
      image: `${imageBaseUrl}${anime.poster_path}`,
      bannerImage: `${imageBaseUrl}${anime.backdrop_path}`,
      description: anime.overview,
      rating: anime.vote_average,
      releaseDate: anime.first_air_date,
      genres: anime.genre_ids,
      type: 'anime',
    })) || [];
  } catch (error) {
    console.error('Error fetching top rated anime:', error);
    return [];
  }
};

export const getOngoingAnime = async (count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/discover/tv?api_key=${apiKey}&language=en-US&with_genres=${ANIMATION_GENRE_ID}&with_origin_country=JP&air_date.gte=${new Date().toISOString().split('T')[0]}&page=1&sort_by=popularity.desc`);
    const data = await response.json();
    return data.results?.slice(0, count).map(anime => ({
      id: anime.id,
      title: {
        english: anime.name,
        original: anime.original_name,
      },
      image: `${imageBaseUrl}${anime.poster_path}`,
      bannerImage: `${imageBaseUrl}${anime.backdrop_path}`,
      description: anime.overview,
      rating: anime.vote_average,
      releaseDate: anime.first_air_date,
      genres: anime.genre_ids,
      type: 'anime',
    })) || [];
  } catch (error) {
    console.error('Error fetching ongoing anime:', error);
    return [];
  }
};

export const getAnimeGenres = async () => {
  try {
    const response = await fetch(`${baseUrl}/genre/tv/list?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    
    // Filter for genres commonly used with anime content
    const animeGenres = data.genres?.filter(genre => 
      ['Animation', 'Action & Adventure', 'Sci-Fi & Fantasy', 'Drama', 'Comedy', 'Crime', 'Mystery'].includes(genre.name)
    ) || [];
    
    return animeGenres;
  } catch (error) {
    console.error('Error fetching anime genres:', error);
    return [];
  }
};

export const getAnimeByGenre = async (genreId, count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/discover/tv?api_key=${apiKey}&language=en-US&with_genres=${ANIMATION_GENRE_ID},${genreId}&with_origin_country=JP&page=1&sort_by=popularity.desc`);
    const data = await response.json();
    return data.results?.slice(0, count).map(anime => ({
      id: anime.id,
      title: {
        english: anime.name,
        original: anime.original_name,
      },
      image: `${imageBaseUrl}${anime.poster_path}`,
      bannerImage: `${imageBaseUrl}${anime.backdrop_path}`,
      description: anime.overview,
      rating: anime.vote_average,
      releaseDate: anime.first_air_date,
      genres: anime.genre_ids,
      type: 'anime',
    })) || [];
  } catch (error) {
    console.error('Error fetching anime by genre:', error);
    return [];
  }
};

export const searchAnime = async (query, count = 20) => {
  try {
    const response = await fetch(`${baseUrl}/search/tv?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=1`);
    const data = await response.json();
    
    // Filter search results for anime content
    const animeResults = data.results?.filter(item => 
      item.genre_ids?.includes(ANIMATION_GENRE_ID) && 
      (item.origin_country?.includes('JP') || item.original_language === 'ja')
    ) || [];
    
    return animeResults.slice(0, count).map(anime => ({
      id: anime.id,
      title: {
        english: anime.name,
        original: anime.original_name,
      },
      image: anime.poster_path ? `${imageBaseUrl}${anime.poster_path}` : null,
      bannerImage: anime.backdrop_path ? `${imageBaseUrl}${anime.backdrop_path}` : null,
      description: anime.overview,
      rating: anime.vote_average,
      releaseDate: anime.first_air_date,
      genres: anime.genre_ids,
      type: 'anime',
    }));
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
}; 