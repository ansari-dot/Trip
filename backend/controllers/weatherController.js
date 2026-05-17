import { fetchWeatherApi } from "openmeteo";

export const getWeather = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const params = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      current: ["temperature_2m", "relative_humidity_2m", "wind_speed_10m", "weather_code"],
      daily: ["weather_code", "temperature_2m_max", "temperature_2m_min"],
      timezone: "auto",
    };

    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];

    const current = response.current();
    const daily = response.daily();

    if (!current || !daily) {
      return res.status(500).json({
        success: false,
        message: "Failed to parse weather data",
      });
    }

    const utcOffsetSeconds = response.utcOffsetSeconds();

    const weatherData = {
      current: {
        temperature: current.variables(0)?.value(),
        humidity: current.variables(1)?.value(),
        windSpeed: current.variables(2)?.value(),
        weatherCode: current.variables(3)?.value(),
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      },
      daily: {
        time: Array.from({ length: daily.timeEnd() - daily.time() }, (_, i) =>
          new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
        ).slice(0, 7),
        weatherCode: daily.variables(0)?.valuesArray()?.slice(0, 7),
        tempMax: daily.variables(1)?.valuesArray()?.slice(0, 7),
        tempMin: daily.variables(2)?.valuesArray()?.slice(0, 7),
      },
    };

    res.status(200).json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch weather data",
    });
  }
};
