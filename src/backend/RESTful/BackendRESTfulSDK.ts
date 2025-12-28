/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateUserDto {
  /**
   * Name of the user
   * @example "John Doe"
   */
  name: string;
  /**
   * Email of the user
   * @format email
   * @example "johndoe@email.com"
   */
  email: string;
  /**
   * Password of the user
   * @minLength 8
   * @example "secret123"
   */
  password: string;
  /**
   * Avatar URL of the user
   * @example "http://www.image.com/abc"
   */
  avatarUrl?: string;
  /**
   * Description in profile of the user
   * @example "Welcome to my profile!"
   */
  description?: string;
}

export interface AuthResponse {
  /**
   * JWT access token for authentication
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  access_token: string;
}

export interface LoginUserDto {
  /**
   * Email of the user
   * @format email
   * @example "johndoe@email.com"
   */
  email: string;
  /**
   * Password of the user
   * @example "secret123"
   */
  password: string;
}

export interface UserResponse {
  /**
   * Unique identifier of the user
   * @example "507f1f77bcf86cd799439011"
   */
  id: string;
  /**
   * Name of the user
   * @example "John Doe"
   */
  name: string;
  /**
   * Email of the user
   * @example "johndoe@email.com"
   */
  email: string;
  /**
   * Avatar URL of the user
   * @example "http://www.image.com/abc"
   */
  avatarUrl?: string;
  /**
   * Description in profile of the user
   * @example "Welcome to my profile!"
   */
  description?: string;
}

export interface MessageResponse {
  /** Unique indentifier of the chat */
  chatId: string;
  /** Unique identifier of the sender */
  senderId: string;
  /** Content of the message */
  content: string;
  /**
   * Timestamp when the message was created
   * @format date-time
   */
  createdAt: string;
}

export interface ChatHistoryResponse {
  /** Chat history messages */
  chatHistory: MessageResponse[];
}

export interface SaveMessageDto {
  /**
   * Unique identifier of the chat
   * @example "chat123"
   */
  chatId: string;
  /**
   * Unique identifier of the sender
   * @example "user123"
   */
  senderId: string;
  /**
   * Content of the message
   * @example "Hello, world!"
   */
  content: string;
}

export interface MessageDto {
  role: MessageDtoRoleEnum;
  content: string;
}

export interface ChatRequestDto {
  /**
   * Message from user
   * @example "message"
   */
  message: string;
  /**
   * The conversation history including messages from chatbot and user
   * @example [{"role":"chatbot","content":"Hello user, I am chatbot."},{"role":"user","content":"Hello chatbot, I am user."}]
   */
  conversationHistory?: MessageDto[];
}

export interface ChatResponse {
  /**
   * Indicates whether the request was successful
   * @example true
   */
  success: boolean;
  /**
   * The chatbot's response message
   * @example "Da Nang City is a vibrant destination..."
   */
  response: string;
  /**
   * The AI model used to generate the response
   * @example "meta-llama/Llama-3.2-3B-Instruct"
   */
  model: string;
}

export interface LocationRecommendationDto {
  /**
   * Name of the location
   * @example "Da Nang"
   */
  location: string;
  /**
   * Category needed to recommend
   * @example "restaurants"
   */
  category: LocationRecommendationDtoCategoryEnum;
}

export interface LocationRecommendationResponse {
  /**
   * Indicates whether the request was successful
   * @example true
   */
  success: boolean;
  /**
   * The chatbot's recommendations for the specified location and category
   * @example "1. Olivia's Prime Steakhouse - A michelin restaurant..."
   */
  response: string;
  /**
   * The AI model used to generate the recommendations
   * @example "meta-llama/Llama-3.2-3B-Instruct"
   */
  model: string;
}

export interface LocationCoordinates {
  /**
   * Latitude of the location
   * @example 10.762622
   */
  lat: number;
  /**
   * Longitude of the location
   * @example 106.660172
   */
  lon: number;
}

export interface ImageLocationResponse {
  /**
   * Indicates whether the request was successful
   * @example true
   */
  success: boolean;
  /**
   * Name or description of the identified location
   * @example "Notre-Dame Cathedral Basilica of Saigon"
   */
  locationName: string;
  /**
   * Detailed information about the location
   * @example "The Notre-Dame Cathedral Basilica of Saigon is a Roman Catholic cathedral located in Ho Chi Minh City, Vietnam..."
   */
  description: string;
  /** Geographical coordinates of the location */
  coordinates?: LocationCoordinates;
  /**
   * The AI model used to analyze the image
   * @example "meta-llama/Llama-3.2-11B-Vision-Instruct"
   */
  model: string;
  /**
   * URL of the uploaded image on Cloudinary
   * @example "https://res.cloudinary.com/demo/image/upload/v1234567890/image-analysis/abc123.jpg"
   */
  imageUrl?: string;
}

export interface LocationDto {
  lat: number;
  lon: number;
}

export interface NearbyPlacesDto {
  location: LocationDto;
  type: NearbyPlacesDtoTypeEnum;
  radius?: number;
}

export interface DirectionsDto {
  origin: LocationDto;
  destination: LocationDto;
}

export interface GeoPointResponse {
  /** Coordinates of the geographical point as [longitude, latitude] */
  x: number;
  /** Coordinates of the geographical point as [longitude, latitude] */
  y: number;
}

export interface PlaceResponse {
  /** Unique identifier of the place */
  name: string;
  /** Geographical location of the place */
  location: GeoPointResponse;
  /** Tags associated with the place */
  tags: string[];
}

export interface PlacesResponse {
  /** List of places */
  places: PlaceResponse[];
}

export interface GeoPointDto {
  /** @example 10.7793648 */
  x: number;
  /** @example 106.6922806 */
  y: number;
}

export interface CreatePlaceDto {
  /**
   * Name of the place
   * @example "Vinhome Central Park"
   */
  name: string;
  location: GeoPointDto;
  /** @example "museum, history" */
  tags?: string;
}

export interface WeatherLocationResponse {
  /**
   * Latitude in decimal degrees
   * @example 52.52
   */
  latitude: number;
  /**
   * Longitude in decimal degrees
   * @example 13.405
   */
  longitude: number;
  /**
   * Name of the city or area
   * @example "Berlin"
   */
  name?: string;
  /**
   * Country code or name
   * @example "Germany"
   */
  country?: string;
}

export interface CurrentWeatherResponse {
  /**
   * Current temperature in Celsius
   * @example 18.5
   */
  temperature: number;
  /**
   * Apparent temperature in Celsius
   * @example 17
   */
  feelsLike: number;
  /**
   * Humidity percentage
   * @min 0
   * @max 100
   * @example 45
   */
  humidity: number;
  /**
   * Atmospheric pressure in hPa
   * @example 1015
   */
  pressure: number;
  /**
   * Wind speed in meters per second
   * @example 3.6
   */
  windSpeed: number;
  /**
   * Wind direction in degrees (0-360)
   * @example 270
   */
  windDirection: number;
  /**
   * Description of current weather
   * @example "Clear sky"
   */
  description: string;
  /**
   * Weather icon code
   * @example "01d"
   */
  icon: string;
}

export interface WeatherResponse {
  /** Location details for the weather data */
  location: WeatherLocationResponse;
  /** Current weather conditions */
  current: CurrentWeatherResponse;
  /**
   * The time when the weather data was recorded
   * @format date-time
   * @example "2023-10-27T14:30:00Z"
   */
  timestamp: string;
}

export interface ForecastPeriodResponse {
  /**
   * Label indicating the timeframe of the forecast
   * @example "Next 3 Hours"
   */
  descriptionLabel?: string;
  /**
   * ISO 8601 formatted date string
   * @example "2023-10-27T12:00:00Z"
   */
  time: string;
  /**
   * Unix timestamp in seconds
   * @example 1698408000
   */
  timestamp: number;
  /**
   * Temperature in degrees Celsius
   * @example 22.5
   */
  temperature: number;
  /**
   * Apparent "feels like" temperature in Celsius
   * @example 21
   */
  feelsLike: number;
  /**
   * Humidity percentage
   * @min 0
   * @max 100
   * @example 65
   */
  humidity: number;
  /**
   * Atmospheric pressure in hPa
   * @example 1013
   */
  pressure: number;
  /**
   * Wind speed in meters per second
   * @example 5.4
   */
  windSpeed: number;
  /**
   * Wind direction in degrees
   * @min 0
   * @max 360
   * @example 180
   */
  windDirection: number;
  /**
   * Short text description of weather conditions
   * @example "Partly Cloudy"
   */
  description: string;
  /**
   * Weather icon identifier or code
   * @example "04d"
   */
  icon: string;
  /**
   * Precipitation volume in mm
   * @example 0.5
   */
  precipitation: number;
  /**
   * Cloudiness percentage
   * @min 0
   * @max 100
   * @example 75
   */
  clouds: number;
}

export interface ForecastResponse {
  /** Geographic and identifying information for the weather location */
  location: WeatherLocationResponse;
  /** A list of forecast periods (3h, 6h, 12h, 24h intervals) */
  forecasts: ForecastPeriodResponse[];
  /**
   * The timestamp when this data was fetched from the provider
   * @format date-time
   * @example "2023-10-27T10:00:00.000Z"
   */
  retrievedAt: string;
}

export interface CoordinateDto {
  /**
   * Latitude of the coordination
   * @example 10.762622
   */
  lat: number;
  /**
   * Longitude of the coordination
   * @example 106.660172
   */
  lon: number;
}

export interface RouteRequestDto {
  /**
   * List of coordinations in the route
   * @minItems 2
   * @example [{"lat":10.762622,"lon":106.660172},{"lat":10.782622,"lon":106.680172}]
   */
  waypoints: CoordinateDto[];
  /**
   * Vehicle mode to find the suitable route
   * @default "driving"
   * @example "walking"
   */
  mode?: RouteRequestDtoModeEnum;
}

export interface RouteResponse {
  /**
   * Indicates if route calculation was successful
   * @example true
   */
  success: boolean;
  /** Route data and details */
  data: RouteData;
}

export type Object = object;

export interface MapLocation {
  /**
   * Unique identifier for the location
   * @example "123456789"
   */
  id?: string;
  /**
   * Name of the location
   * @example "Eiffel Tower"
   */
  name: string;
  /**
   * Latitude coordinate
   * @example 48.8584
   */
  lat: number;
  /**
   * Longitude coordinate
   * @example 2.2945
   */
  lng: number;
  /**
   * Type classification of the location
   * @example "poi"
   */
  type: MapLocationTypeEnum;
  /**
   * Full display name with address details
   * @example "Eiffel Tower, Paris, France"
   */
  displayName?: string;
  /**
   * Specific type of place
   * @example "attraction"
   */
  placeType?: string;
  /**
   * Importance score of the location
   * @example 0.8
   */
  importance?: number;
}

export interface SearchPlaceResponse {
  /**
   * Indicates if the search was successful
   * @example true
   */
  success: boolean;
  /** Array of found locations */
  data: MapLocation[];
  /**
   * Number of results returned
   * @example 5
   */
  count: number;
}

export interface Coordinate {
  /**
   * Latitude coordinate
   * @example 48.8584
   */
  lat: number;
  /**
   * Longitude coordinate
   * @example 2.2945
   */
  lng: number;
}

export interface LocationData {
  /** Location coordinates */
  coordinate: Coordinate;
  /**
   * Full address of the location
   * @example "5 Avenue Anatole France, 75007 Paris, France"
   */
  address: string;
  /**
   * Nearby places categorized by type
   * @example {"restaurant":[{"id":"123","name":"Restaurant A","lat":48.8584,"lng":2.2945,"type":"restaurant"}],"cafe":[{"id":"456","name":"Cafe B","lat":48.8585,"lng":2.2946,"type":"cafe"}]}
   */
  nearby: object;
  /**
   * Type of location
   * @example "tourist_attraction"
   */
  locationType?: string;
}

export interface LocationDetailResponse {
  /**
   * Indicates if the request was successful
   * @example true
   */
  success: boolean;
  /** Location details and nearby places */
  data: LocationData;
}

export interface BuildRouteDto {
  /** Starting point coordinates */
  origin: Coordinate;
  /** Destination point coordinates */
  destination: Coordinate;
  /** Optional intermediate waypoints */
  waypoints?: Coordinate[];
  /**
   * Travel mode for routing
   * @default "driving"
   */
  mode?: BuildRouteDtoModeEnum;
}

export interface RouteStep {
  /**
   * Step distance in meters
   * @example 250
   */
  distance: number;
  /**
   * Step duration in seconds
   * @example 60
   */
  duration: number;
  /**
   * Turn-by-turn instruction
   * @example "Turn right onto Main Street"
   */
  instruction: string;
  /**
   * Road or street name
   * @example "Main Street"
   */
  name: string;
  /**
   * Travel mode for this step
   * @example "driving"
   */
  mode: string;
}

export interface RouteSummary {
  /**
   * Human-readable total distance
   * @example "5.2 km"
   */
  totalDistance: string;
  /**
   * Human-readable total time
   * @example "12 mins"
   */
  totalTime: string;
  /**
   * List of main roads on the route
   * @example ["Main Street","Highway 101"]
   */
  mainRoads: string[];
  /**
   * Route warnings if any
   * @example ["Heavy traffic ahead"]
   */
  warnings?: string[];
}

export interface RouteData {
  /** Route geometry (GeoJSON or encoded polyline) */
  geometry: object;
  /**
   * Total route distance in meters
   * @example 5200
   */
  distance: number;
  /**
   * Total route duration in seconds
   * @example 720
   */
  duration: number;
  /** Turn-by-turn navigation steps */
  steps: RouteStep[];
  /** Route summary information */
  summary?: RouteSummary;
}

export interface NearbyResponse {
  /**
   * Indicates if the search was successful
   * @example true
   */
  success: boolean;
  /**
   * Nearby places categorized by amenity type
   * @example {"restaurant":[{"id":"123","name":"Restaurant A","lat":48.8584,"lng":2.2945,"type":"restaurant"}],"cafe":[{"id":"456","name":"Cafe B","lat":48.8585,"lng":2.2946,"type":"cafe"}]}
   */
  data: object;
  /**
   * Total number of places found
   * @example 15
   */
  count: number;
}

export enum MessageDtoRoleEnum {
  Chatbot = "chatbot",
  System = "system",
  User = "user",
}

/**
 * Category needed to recommend
 * @example "restaurants"
 */
export enum LocationRecommendationDtoCategoryEnum {
  Activities = "activities",
  Attractions = "attractions",
  Hotels = "hotels",
  Restaurants = "restaurants",
}

export enum NearbyPlacesDtoTypeEnum {
  AdministrativeAreaLevel1 = "administrative_area_level_1",
  AdministrativeAreaLevel2 = "administrative_area_level_2",
  AdministrativeAreaLevel3 = "administrative_area_level_3",
  AdministrativeAreaLevel4 = "administrative_area_level_4",
  AdministrativeAreaLevel5 = "administrative_area_level_5",
  Archipelago = "archipelago",
  ColloquialArea = "colloquial_area",
  Continent = "continent",
  Country = "country",
  Establishment = "establishment",
  Finance = "finance",
  Floor = "floor",
  Food = "food",
  GeneralContractor = "general_contractor",
  Geocode = "geocode",
  Health = "health",
  Intersection = "intersection",
  Landmark = "landmark",
  Locality = "locality",
  NaturalFeature = "natural_feature",
  Neighborhood = "neighborhood",
  PlaceOfWorship = "place_of_worship",
  PlusCode = "plus_code",
  PointOfInterest = "point_of_interest",
  Political = "political",
  PostBox = "post_box",
  PostalCode = "postal_code",
  PostalCodePrefix = "postal_code_prefix",
  PostalCodeSuffix = "postal_code_suffix",
  PostalTown = "postal_town",
  Premise = "premise",
  Room = "room",
  Route = "route",
  StreetAddress = "street_address",
  StreetNumber = "street_number",
  Sublocality = "sublocality",
  SublocalityLevel1 = "sublocality_level_1",
  SublocalityLevel2 = "sublocality_level_2",
  SublocalityLevel3 = "sublocality_level_3",
  SublocalityLevel4 = "sublocality_level_4",
  SublocalityLevel5 = "sublocality_level_5",
  Subpremise = "subpremise",
  TownSquare = "town_square",
}

/**
 * Vehicle mode to find the suitable route
 * @default "driving"
 * @example "walking"
 */
export enum RouteRequestDtoModeEnum {
  Driving = "driving",
  Walking = "walking",
  Cycling = "cycling",
}

/**
 * Type classification of the location
 * @example "poi"
 */
export enum MapLocationTypeEnum {
  Place = "place",
  Address = "address",
  Poi = "poi",
}

/**
 * Travel mode for routing
 * @default "driving"
 */
export enum BuildRouteDtoModeEnum {
  Driving = "driving",
  Walking = "walking",
  Cycling = "cycling",
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL,
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title VCOMPGUIDE V1 API Docs
 * @version 1.0
 * @baseUrl http://localhost:9000
 * @contact
 */
export class Sdk<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  authentication = {
    /**
     * @description Create a new user account and return a JWT access token
     *
     * @tags Authentication
     * @name AuthControllerSignup
     * @summary Register a new user
     * @request POST:/api/auth/signup
     * @secure
     */
    authControllerSignup: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<AuthResponse, void>({
        path: `/api/auth/signup`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Authenticate user and return a JWT access token
     *
     * @tags Authentication
     * @name AuthControllerSignin
     * @summary Sign in with email and password
     * @request POST:/api/auth/signin
     * @secure
     */
    authControllerSignin: (data: LoginUserDto, params: RequestParams = {}) =>
      this.request<AuthResponse, void>({
        path: `/api/auth/signin`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  user = {
    /**
     * @description Find all users in the database without any filter
     *
     * @tags User
     * @name UsersControllerFindAll
     * @summary Get all users in the database
     * @request GET:/api/users
     * @secure
     */
    usersControllerFindAll: (params: RequestParams = {}) =>
      this.request<UserResponse[], any>({
        path: `/api/users`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new user account with the provided information
     *
     * @tags User
     * @name UsersControllerCreate
     * @summary Create a new user
     * @request POST:/api/users
     * @secure
     */
    usersControllerCreate: (data: CreateUserDto, params: RequestParams = {}) =>
      this.request<UserResponse, void>({
        path: `/api/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the profile of the currently authenticated user from JWT token
     *
     * @tags User
     * @name UsersControllerGetMe
     * @summary Get current authenticated user
     * @request GET:/api/users/me
     * @secure
     */
    usersControllerGetMe: (params: RequestParams = {}) =>
      this.request<UserResponse, void>({
        path: `/api/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Find a specific user by their unique identifier
     *
     * @tags User
     * @name UsersControllerFindOneById
     * @summary Get a user by ID
     * @request GET:/api/users/{id}
     * @secure
     */
    usersControllerFindOneById: (id: string, params: RequestParams = {}) =>
      this.request<UserResponse, void>({
        path: `/api/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  chat = {
    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerGetChatById
     * @summary Get chat by ID
     * @request GET:/api/chat/{chatId}
     * @secure
     */
    chatControllerGetChatById: (chatId: string, params: RequestParams = {}) =>
      this.request<ChatHistoryResponse, any>({
        path: `/api/chat/${chatId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Chat
     * @name ChatControllerSaveMessage
     * @summary Save message to database
     * @request POST:/api/chat/save
     * @secure
     */
    chatControllerSaveMessage: (
      data: SaveMessageDto,
      params: RequestParams = {},
    ) =>
      this.request<MessageResponse, any>({
        path: `/api/chat/save`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  chatbot = {
    /**
     * @description Get response from HuggingFace model for user's request message
     *
     * @tags Chatbot
     * @name ChatbotControllerChat
     * @summary Get response message from the chatbot
     * @request POST:/api/chatbot/chat
     * @secure
     */
    chatbotControllerChat: (data: ChatRequestDto, params: RequestParams = {}) =>
      this.request<ChatResponse, void>({
        path: `/api/chatbot/chat`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get recommendations from HuggingFace model for a specific category requested by user
     *
     * @tags Chatbot
     * @name ChatbotControllerGetLocationRecommendations
     * @summary Get recommendations from the chatbot
     * @request POST:/api/chatbot/recommendations
     * @secure
     */
    chatbotControllerGetLocationRecommendations: (
      data: LocationRecommendationDto,
      params: RequestParams = {},
    ) =>
      this.request<LocationRecommendationResponse, void>({
        path: `/api/chatbot/recommendations`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Upload an image to identify the location and return its information with geo coordinates
     *
     * @tags Chatbot
     * @name ChatbotControllerAnalyzeImageLocation
     * @summary Identify location from image
     * @request POST:/api/chatbot/image-location
     * @secure
     */
    chatbotControllerAnalyzeImageLocation: (
      data: {
        /**
         * Image file to analyze
         * @format binary
         */
        file?: File;
        /** Optional additional context or question about the image */
        additionalContext?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ImageLocationResponse, void>({
        path: `/api/chatbot/image-location`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  gmaps = {
    /**
     * No description
     *
     * @tags Gmaps
     * @name GmapsControllerGetNearbyPlaces
     * @request POST:/api/gmaps/nearby-places
     * @secure
     */
    gmapsControllerGetNearbyPlaces: (
      data: NearbyPlacesDto,
      params: RequestParams = {},
    ) =>
      this.request<Object, any>({
        path: `/api/gmaps/nearby-places`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Gmaps
     * @name GmapsControllerGetDirections
     * @request POST:/api/gmaps/directions
     * @secure
     */
    gmapsControllerGetDirections: (
      data: DirectionsDto,
      params: RequestParams = {},
    ) =>
      this.request<Object, any>({
        path: `/api/gmaps/directions`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  landmarks = {
    /**
     * No description
     *
     * @tags Landmarks
     * @name LandmarksControllerFindAll
     * @request GET:/api/landmarks
     * @secure
     */
    landmarksControllerFindAll: (params: RequestParams = {}) =>
      this.request<object[], any>({
        path: `/api/landmarks`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Landmarks
     * @name LandmarksControllerFindOne
     * @request GET:/api/landmarks/{id}
     * @secure
     */
    landmarksControllerFindOne: (id: string, params: RequestParams = {}) =>
      this.request<Object, any>({
        path: `/api/landmarks/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  place = {
    /**
     * @description Retrieve a list of places that match the specified tags.
     *
     * @tags Place
     * @name PlaceControllerGetPlacesByTags
     * @summary Get places filtered by tags
     * @request GET:/api/place/by-tags
     * @secure
     */
    placeControllerGetPlacesByTags: (
      query?: {
        /** List of tags to filter places by */
        tags?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PlacesResponse, any>({
        path: `/api/place/by-tags`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Insert a new place into the database from an external source using its identifier.
     *
     * @tags Place
     * @name PlaceControllerInsert
     * @summary Insert place from external source
     * @request POST:/api/place/insert
     * @secure
     */
    placeControllerInsert: (data: CreatePlaceDto, params: RequestParams = {}) =>
      this.request<PlacesResponse, any>({
        path: `/api/place/insert`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  weather = {
    /**
     * @description Retrieve the current weather conditions for a specific location.
     *
     * @tags Weather
     * @name WeatherControllerGetCurrentWeather
     * @summary Get current weather
     * @request GET:/api/weather/current
     * @secure
     */
    weatherControllerGetCurrentWeather: (
      query: {
        locationName?: string;
        /**
         * @min -90
         * @max 90
         */
        latitude: number;
        /**
         * @min -180
         * @max 180
         */
        longitude: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<WeatherResponse, any>({
        path: `/api/weather/current`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a multi-day weather forecast for a specific location.
     *
     * @tags Weather
     * @name WeatherControllerGetForecast
     * @summary Get weather forecast
     * @request GET:/api/weather/forecast
     * @secure
     */
    weatherControllerGetForecast: (
      query: {
        locationName?: string;
        /**
         * @min -90
         * @max 90
         */
        latitude: number;
        /**
         * @min -180
         * @max 180
         */
        longitude: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ForecastResponse, any>({
        path: `/api/weather/forecast`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  routing = {
    /**
     * @description Get the most suitable route passing through the user's waypoints with a specific vehicle mode
     *
     * @tags Routing
     * @name RoutingControllerGetRoute
     * @summary Get a route passing through the user's waypoints
     * @request POST:/api/routing
     * @secure
     */
    routingControllerGetRoute: (
      data: RouteRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<RouteResponse, void>({
        path: `/api/routing`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  poi = {
    /**
     * No description
     *
     * @tags poi
     * @name PoiControllerSearchNearby
     * @summary Search for nearby Poi by radius
     * @request GET:/api/poi/nearby
     * @secure
     */
    poiControllerSearchNearby: (
      query: {
        /**
         * Latitude of the center point
         * @min -90
         * @max 90
         * @example 37.7749
         */
        latitude: number;
        /**
         * Longitude of the center point
         * @min -180
         * @max 180
         * @example -122.4194
         */
        longitude: number;
        /**
         * Search radius in meters
         * @min 1
         * @max 50000
         * @example 1000
         */
        radius: number;
        /**
         * Array of amenity types to search for
         * @example ["restaurant","cafe","hospital"]
         */
        amenities?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/poi/nearby`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags poi
     * @name PoiControllerSearchByTags
     * @summary Search for Poi by specific tags
     * @request GET:/api/poi/tags
     * @secure
     */
    poiControllerSearchByTags: (
      query: {
        /**
         * Latitude of the center point
         * @min -90
         * @max 90
         * @example 37.7749
         */
        latitude: number;
        /**
         * Longitude of the center point
         * @min -180
         * @max 180
         * @example -122.4194
         */
        longitude: number;
        /**
         * Search radius in meters
         * @min 1
         * @max 50000
         * @example 1000
         */
        radius: number;
        /** Key-value pairs of tags to search for */
        tags: Object;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/poi/tags`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags poi
     * @name PoiControllerSearchByBoundingBox
     * @summary Search for Poi within a bounding box
     * @request GET:/api/poi/bounding-box
     * @secure
     */
    poiControllerSearchByBoundingBox: (
      query: {
        /**
         * South latitude of bounding box
         * @min -90
         * @max 90
         * @example 37.7
         */
        south: number;
        /**
         * West longitude of bounding box
         * @min -180
         * @max 180
         * @example -122.5
         */
        west: number;
        /**
         * North latitude of bounding box
         * @min -90
         * @max 90
         * @example 37.8
         */
        north: number;
        /**
         * East longitude of bounding box
         * @min -180
         * @max 180
         * @example -122.3
         */
        east: number;
        /**
         * Array of amenity types to search for
         * @example ["restaurant","cafe","hospital"]
         */
        amenities?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/poi/bounding-box`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  map = {
    /**
     * @description Search for locations, addresses, and points of interest by name using Nominatim geocoding service
     *
     * @tags Map
     * @name MapControllerSearchPlace
     * @summary Search for places by name
     * @request GET:/api/map/search
     * @secure
     */
    mapControllerSearchPlace: (
      query: {
        /**
         * Search query string
         * @example "Eiffel Tower"
         */
        q: string;
        /**
         * Maximum number of results
         * @min 1
         * @max 50
         * @default 5
         * @example 5
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SearchPlaceResponse, void>({
        path: `/api/map/search`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve comprehensive details about a specific location using its coordinates
     *
     * @tags Map
     * @name MapControllerGetLocationDetail
     * @summary Get detailed location information
     * @request GET:/api/map/location
     * @secure
     */
    mapControllerGetLocationDetail: (
      query: {
        /**
         * Latitude coordinate
         * @min -90
         * @max 90
         * @example 48.8584
         */
        lat: number;
        /**
         * Longitude coordinate
         * @min -180
         * @max 180
         * @example 2.2945
         */
        lng: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<LocationDetailResponse, void>({
        path: `/api/map/location`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Calculate an optimized route between origin and destination with optional waypoints using OSRM routing service
     *
     * @tags Map
     * @name MapControllerBuildRoute
     * @summary Build a route between two locations
     * @request POST:/api/map/route
     * @secure
     */
    mapControllerBuildRoute: (
      data: BuildRouteDto,
      params: RequestParams = {},
    ) =>
      this.request<RouteResponse, void>({
        path: `/api/map/route`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Recalculate a route with updated waypoints between origin and destination
     *
     * @tags Map
     * @name MapControllerUpdateWaypoints
     * @summary Update route waypoints
     * @request POST:/api/map/route/waypoints
     * @secure
     */
    mapControllerUpdateWaypoints: (params: RequestParams = {}) =>
      this.request<RouteResponse, void>({
        path: `/api/map/route/waypoints`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Find nearby amenities and points of interest within a specified radius using Overpass API
     *
     * @tags Map
     * @name MapControllerSearchNearby
     * @summary Search for nearby places
     * @request GET:/api/map/nearby
     * @secure
     */
    mapControllerSearchNearby: (
      query: {
        /**
         * Center latitude coordinate
         * @min -90
         * @max 90
         * @example 48.8584
         */
        lat: number;
        /**
         * Center longitude coordinate
         * @min -180
         * @max 180
         * @example 2.2945
         */
        lng: number;
        /**
         * Search radius in meters
         * @min 100
         * @max 10000
         * @default 1000
         * @example 1000
         */
        radius?: number;
        /**
         * Comma-separated list of amenity types
         * @example "restaurant,cafe,hotel"
         */
        amenities?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<NearbyResponse, void>({
        path: `/api/map/nearby`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
