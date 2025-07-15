// 📁 src/utils/emissionFactors.js
export const EMISSION_FACTORS = {
    electricity_kwh_co2e: 0.20705, // kg CO2e per kWh (Source: dxw report 2024)
    // Owned Vehicles Fleet (Scope 1) - using average DEFRA figures for typical fuel types
    // Assuming average petrol/diesel car and diesel van for illustrative purposes.
    // For actual PPN006, specific fuel consumption and fuel type factors are required.
    fleet_petrol_car_co2e_per_km: 0.174, // kg CO2e per km (Average car, petrol, Source: DEFRA/DESNZ 2024 figures generally around this for fleet average)
    fleet_diesel_van_co2e_per_km: 0.298, // kg CO2e per km (Average Light Commercial Vehicle (LCV) 3.5t, diesel, Source: DEFRA/DESNZ 2024 figures)
    
    // Business and Office Travel Land (Scope 3, typically)
    car_co2e_per_km: 0.1698, // kg CO2e per km (Average Car, Source: dxw report 2024)
    bus_co2e_per_km: 0.078323, // kg CO2e per passenger-km (Bus, Source: dxw report 2024)
    train_co2e_per_km: 0.035463, // kg CO2e per passenger-km (National Rail, Source: dxw report 2024)
    taxi_co2e_per_km: 0.1137, // kg CO2e per km (Taxi, Source: dxw report 2024)
    homeworking_co2e_per_hour: 0.33378, // kg CO2e per hour per person (Source: Circular Ecology, Rod McLaren citing UK Gov factors)
    hotel_night_co2e: 10.4, // kg CO2e per room per night (UK, Source: MeasureUp, BMA reports citing UK Gov factors)
  };
  