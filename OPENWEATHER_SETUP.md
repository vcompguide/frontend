# Setting Up OpenWeather API

## Getting Your API Key

1. Go to [OpenWeather API](https://openweathermap.org/api)
2. Click on "Sign Up" or "Get API Key"
3. Create a free account
4. Navigate to your API keys section
5. Copy your API key

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and replace `your_api_key_here` with your actual API key:
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Features

The map context menu (right-click on map) will now display:
- Current temperature
- Weather description with icon
- "Feels like" temperature
- Humidity percentage
- Wind speed

## Usage

1. Right-click anywhere on the map
2. View current weather data for that location
3. Click "Add to Current Route" to create a new plan at that location

## Free Tier Limits

OpenWeather's free tier includes:
- 60 calls/minute
- 1,000,000 calls/month
- Current weather data
- 5-day forecast

## Notes

- The `.env.local` file is gitignored and won't be committed
- Never commit your API key to version control
- For production deployment, set the environment variable in your hosting platform's settings
