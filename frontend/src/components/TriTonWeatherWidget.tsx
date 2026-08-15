'use client';

import React, { useState, useEffect } from 'react';
import { CloudSun, Sun, CloudRain, Wind, Droplets, Compass, Sparkles, MapPin } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  isRainy: boolean;
  conditionText: string;
  advice: string;
}

export default function TriTonWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTriTonWeather() {
      try {
        // Open-Meteo API for Tri Tôn coordinates (10.4215°N, 105.0125°E)
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=10.4215&longitude=105.0125&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FBangkok'
        );
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();
        const cur = data.current;

        const code = cur.weather_code || 0;
        const temp = Math.round(cur.temperature_2m || 30);
        const hum = cur.relative_humidity_2m || 75;
        const wind = Math.round(cur.wind_speed_10m || 8);
        const rain = (cur.precipitation || 0) > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code);

        let cond = 'Nắng ấm trong lành';
        let adv = 'Thời tiết rất lý tưởng để săn mây Đỉnh Cô Tô và check-in Hồ Tà Pạ ngọc bích.';

        if (rain) {
          cond = 'Có mưa rào Bảy Núi';
          adv = 'Nên ghé Chùa Xvayton chiêm bái, quán cafe ngắm mưa hoặc ăn lẩu bò Tri Tôn nóng hổi.';
        } else if (code >= 1 && code <= 3) {
          cond = 'Trời râm mát nhiều mây';
          adv = 'Khí hậu mát mẻ, thích hợp đạp xe quanh cánh đồng Tà Pạ và ngắm Cổng trời Koh Kas.';
        } else if (temp >= 33) {
          cond = 'Nắng gắt trưa hè';
          adv = 'Nên tham quan buổi sáng sớm, trưa ghé các chòi lá râm mát bờ Hồ Ô Thum thưởng thức Gà Đốt.';
        }

        setWeather({
          temperature: temp,
          humidity: hum,
          weatherCode: code,
          windSpeed: wind,
          isRainy: rain,
          conditionText: cond,
          advice: adv,
        });
      } catch (err) {
        // Fallback default pleasant Tri Tôn climate
        setWeather({
          temperature: 29,
          humidity: 70,
          weatherCode: 1,
          windSpeed: 9,
          isRainy: false,
          conditionText: 'Nắng ấm Bảy Núi',
          advice: 'Khí hậu thuận lợi để trải nghiệm các cung đường danh thắng và ẩm thực Tri Tôn.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTriTonWeather();
  }, []);

  if (loading || !weather) {
    return (
      <div className="w-full bg-[#FFFDF7] rounded-[22px] p-4 border border-[#26221B]/8 shadow-xs flex items-center justify-between text-xs text-[#6B6355] animate-pulse font-body">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-[#F0A32F]" />
          <span>Đang cập nhật thời tiết thực địa Tri Tôn...</span>
        </div>
      </div>
    );
  }

  const WeatherIcon = weather.isRainy ? CloudRain : weather.weatherCode === 0 ? Sun : CloudSun;

  return (
    <div className="w-full bg-[#FFFDF7] rounded-[24px] p-4 sm:p-5 border border-[#26221B]/8 shadow-[0_2px_10px_rgba(38,34,27,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4 font-body">
      {/* Left: Current Weather Conditions */}
      <div className="flex items-center gap-3.5 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-[#0E8C7F]/10 text-[#0E8C7F] flex items-center justify-center border border-[#0E8C7F]/20 shrink-0 shadow-xs">
          <WeatherIcon className="w-6 h-6 text-[#F0A32F]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-display">
            <span className="font-extrabold text-2xl text-[#26221B]">{weather.temperature}°C</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF3E7] text-[#0E8C7F] border border-[#0E8C7F]/20">
              {weather.conditionText}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-[#6B6355]">
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-[#0E8C7F]" />
              <span>Ẩm: {weather.humidity}%</span>
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-[#6B6355]" />
              <span>Gió: {weather.windSpeed} km/h</span>
            </span>
            <span className="flex items-center gap-1 text-[#D9822B] font-medium hidden sm:inline-flex">
              <MapPin className="w-3 h-3 text-[#F0A32F]" />
              <span>Tri Tôn, An Giang</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Realtime Travel Recommendation */}
      <div className="flex-1 bg-[#FAF3E7] rounded-[18px] p-3 sm:p-3.5 border border-[#26221B]/6 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#F0A32F] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-[#26221B] leading-relaxed">
          <strong className="font-display font-bold text-[#0E8C7F] mr-1">Gợi ý hôm nay:</strong>
          {weather.advice}
        </p>
      </div>
    </div>
  );
}
