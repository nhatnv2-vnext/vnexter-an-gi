export type CreateReviewInput = {
  rating: number;
  comment?: string;
  authorName?: string;
};

export type WeatherCondition = "rain" | "hot" | "cold" | "mild";

export type WeatherSuggestionResult = {
  condition: WeatherCondition;
  tempC: number;
  suggestionText: string;
  suggestedRestaurantId?: string;
};
