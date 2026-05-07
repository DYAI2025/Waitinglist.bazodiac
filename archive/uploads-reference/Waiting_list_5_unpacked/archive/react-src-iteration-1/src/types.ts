export interface AstrologyData {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  baziAnimal: string;
  baziDaymaster: string;
  baziHourMaster: string;
  wuXing: string;
  interpretation?: string;
}

export interface BirthData {
  date: string;
  time: string;
  place: string;
  lat?: number;
  lng?: number;
}
