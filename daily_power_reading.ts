export type DailyPowerReading = {
    dayLow: PowerReading;
    dayHigh: PowerReading;
    dayAverage: number;
    //powerIntervals: Array<PowerPriceInterval>;
}

export type PowerPriceInterval = {
    consumption: number
    start: Date
    end: Date
}


export type PowerReading = {
    price: number;
    start: string;
    end: string;
}