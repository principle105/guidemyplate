const YELP_API_KEY = process.env.EXPO_PUBLIC_YELP_API_KEY;
const YELP_BASE_URL = 'https://api.yelp.com/v3/businesses/search';

export interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Array<{ alias: string; title: string }>;
  rating: number;
  coordinates: { latitude: number; longitude: number };
  transactions: string[];
  price?: string;
  location: {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance: number;
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: { longitude: number; latitude: number };
  };
}

class YelpService {
  private static checkApiKey(): void {
    if (!YELP_API_KEY) {
      throw new Error('Yelp API key not found. Please add EXPO_PUBLIC_YELP_API_KEY to your .env file');
    }
  }

  static async searchRestaurants(
    latitude: number,
    longitude: number,
    term: string = 'healthy food',
    limit: number = 20
  ): Promise<YelpSearchResponse> {
    this.checkApiKey();

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      term,
      limit: limit.toString(),
      categories: 'restaurants',
      sort_by: 'best_match',
      radius: '5000', // 5km radius
    });

    try {
      const response = await fetch(`${YELP_BASE_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }

      const data: YelpSearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching restaurants from Yelp:', error);
      throw error;
    }
  }

  static async searchHealthyRestaurants(
    latitude: number,
    longitude: number,
    limit: number = 20
  ): Promise<YelpSearchResponse> {
    return this.searchRestaurants(latitude, longitude, 'healthy food', limit);
  }

  static async searchByCategory(
    latitude: number,
    longitude: number,
    category: string,
    limit: number = 20
  ): Promise<YelpSearchResponse> {
    this.checkApiKey();

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      categories: category,
      limit: limit.toString(),
      sort_by: 'rating',
      radius: '5000',
    });

    try {
      const response = await fetch(`${YELP_BASE_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
      }

      const data: YelpSearchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching restaurants by category:', error);
      throw error;
    }
  }
}

export default YelpService;