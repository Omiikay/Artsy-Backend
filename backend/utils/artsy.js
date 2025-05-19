const axios = require('axios');

/**
 * Format biography text
 * @param {string} biography 
 * @returns 
 */
const formatBiography = (biography) => {
  if (!biography) return '';
  
  // 防止单词分割
  // 查找所有可能被连字符分割的单词，如 "word-\nword"
  const fixedText = biography.replace(/(\w+)- (\w+)/g, '$1$2').replace(/\u2013/g, "\u002D").replace(/\u0096/g, '\u2014');
  
  return fixedText
};

// 辅助函数：获取图片URL或返回缺失标记
const getImageUrl = (links) => {
    // 检查是否有thumbnail链接
    if (!links.thumbnail || !links.thumbnail.href) {
      return 'artsy_logo.svg';
    }
    
    // 检查如果是默认的缺失图片路径
    if (links.thumbnail.href === '/assets/shared/missing_image.png') {
      return 'artsy_logo.svg';
    }
    
    return links.thumbnail.href;
  };


// 辅助函数：从自连接中提取ID
const extractIdFromSelfLink = (selfLink) => {
  return selfLink.split('/').pop();
};

// 辅助函数：格式化艺术家搜索结果
const formatArtistSearchResult = (artist) => {
  return {
    id: extractIdFromSelfLink(artist._links.self.href),
    title: artist.title,
    _links: artist._links,
    // imageUrl: artist._links.thumbnail.href
    imageUrl: getImageUrl(artist._links)
  };
};

// 辅助函数：格式化艺术家详情
const formatArtistDetails = (artist) => {
  return {
    id: extractIdFromSelfLink(artist._links.self.href),
    name: artist.name,
    birthday: artist.birthday || '',
    deathday: artist.deathday || '',
    nationality: artist.nationality || '',
    // biography: artist.biography || '',
    biography: formatBiography(artist.biography),
    _links: artist._links,
    // imageUrl: artist._links.thumbnail.href
    imageUrl: getImageUrl(artist._links)
  };
};

// 辅助函数：格式化类似艺术家
const formatSimilarArtist = (artist) => {
  return {
    id: extractIdFromSelfLink(artist._links.self.href),
    name: artist.name,
    birthday: artist.birthday || '',
    deathday: artist.deathday || '',
    nationality: artist.nationality || '',
    _links: artist._links,
    // imageUrl: artist._links.thumbnail.href
    imageUrl: getImageUrl(artist._links)
  };
};

// 辅助函数：格式化艺术品
const formatArtwork = (artwork) => {
  return {
    id: extractIdFromSelfLink(artwork._links.self.href),
    title: artwork.title || '',
    date: artwork.date || '',
    _links: artwork._links,
    // imageUrl: artwork._links.thumbnail.href
    imageUrl: getImageUrl(artwork._links)
  };
};

// 辅助函数：格式化类别
const formatCategory = (category) => {
  // 处理描述中的链接，将相对路径转为绝对URL
  let processedDescription = '';
  if (category.description) {
    // 使用正则表达式查找Markdown链接并替换路径
    processedDescription = category.description.replace(
      /\[(.*?)\]\((\/[^)]+)\)/g, 
      (match, linkText, linkPath) => {
        // 构建完整URL
        const fullUrl = `${process.env.ARTSY_WEB_URL}${linkPath}`;
        return `[${linkText}](${fullUrl})`;
      }
    );
  }

  return {
    id: extractIdFromSelfLink(category._links.self.href),
    name: category.name || '',
    _links: category._links,
    description: processedDescription ?? '',
    imageUrl: getImageUrl(category._links)
  };
};

// Cache token for an hour
let tokenCache = {
  token: null,
  expiresAt: null
};

/**
 * Get authentication token from Artsy API
 * @returns {Promise<string>} Authentication token
 */
const getAuthToken = async () => {
  // Check if we have a valid cached token
  const now = new Date();
  if (tokenCache.token && tokenCache.expiresAt && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  try {
    const response = await axios.post(`${process.env.ARTSY_API_BASE}/tokens/xapp_token`, {
      client_id: process.env.ARTSY_CLIENT_ID,
      client_secret: process.env.ARTSY_CLIENT_SECRET
    });

    // Cache the token
    tokenCache.token = response.data.token;
    // Set expiration to 1 hour from now
    tokenCache.expiresAt = new Date(Date.now() + 3600000);

    return response.data.token;
  } catch (error) {
    console.error('Error getting Artsy auth token:', error);
    throw new Error('Failed to authenticate with Artsy API');
  }
};

/**
 * Search for artists using the Artsy API
 * @param {string} query Search query
 * @returns {Promise<Array>} Search results
 */
const searchArtists = async (query) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${process.env.ARTSY_API_BASE}/search`, {
      params: {
        q: query,
        type: 'artist',
        size: 10
      },
      headers: {
        'X-Xapp-Token': token
      }
    });

    // 处理结果，格式化并提取ID
    return response.data._embedded.results.map(formatArtistSearchResult);
  } catch (error) {
    console.error('Error searching artists:', error);
    throw new Error('Failed to search artists');
  }
};

/**
 * Get artist details from Artsy API
 * @param {string} artistId Artist ID
 * @returns {Promise<Object>} Artist details
 */
const getArtistDetails = async (artistId) => {
  try {
    const token = await getAuthToken();
    const url = `${process.env.ARTSY_API_BASE}/artists/${artistId}`;
    
    const response = await axios.get(url, {
      headers: {
        'X-Xapp-Token': token
      }
    });
    
    // 格式化艺术家详情
    return formatArtistDetails(response.data);
  } catch (error) {
    console.error('Error getting artist details:', error);
    throw new Error('Failed to get artist details');
  }
};

/**
 * Get similar artists from Artsy API
 * @param {string} artistId Artist ID to find similar artists for
 * @returns {Promise<Array>} Similar artists
 */
const getSimilarArtists = async (artistId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${process.env.ARTSY_API_BASE}/artists`, {
      params: {
        similar_to_artist_id: artistId,
        size: 10
      },
      headers: {
        'X-Xapp-Token': token
      }
    });
    
    // 格式化类似艺术家列表
    return response.data._embedded.artists.map(formatSimilarArtist);
  } catch (error) {
    console.error('Error getting similar artists:', error);
    throw new Error('Failed to get similar artists');
  }
};

/**
 * Get artworks by artist from Artsy API
 * @param {string} artistId Artist ID
 * @returns {Promise<Array>} Artworks
 */
const getArtworksByArtist = async (artistId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${process.env.ARTSY_API_BASE}/artworks`, {
      params: {
        artist_id: artistId,
        size: 10
      },
      headers: {
        'X-Xapp-Token': token
      }
    });

    // 添加错误处理以确保_embedded存在
    if (!response.data._embedded || !response.data._embedded.artworks) {
        console.warn('No artworks found for artist:', artistId);
        return [];
    }
    
    // 格式化艺术品列表
    return response.data._embedded.artworks.map(formatArtwork);
  } catch (error) {
    console.error('Error getting artworks:', error);
    throw new Error('Failed to get artworks');
  }
};

/**
 * Get artwork categories (genes) from Artsy API
 * @param {string} artworkId Artwork ID
 * @returns {Promise<Array>} Categories
 */
const getArtworkCategories = async (artworkId) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${process.env.ARTSY_API_BASE}/genes`, {
      params: {
        artwork_id: artworkId
      },
      headers: {
        'X-Xapp-Token': token
      }
    });

    // 添加错误处理以确保_embedded存在
    if (!response.data._embedded || !response.data._embedded.genes) {
        console.warn('No categories found for artwork:', artworkId);
        return [];
    }
    
    // 格式化类别列表
    return response.data._embedded.genes.map(formatCategory);
  } catch (error) {
    console.error('Error getting artwork categories:', error);
    throw new Error('Failed to get artwork categories');
  }
};

module.exports = {
  getAuthToken,
  searchArtists,
  getArtistDetails,
  getSimilarArtists,
  getArtworksByArtist,
  getArtworkCategories
};