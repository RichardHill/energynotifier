export type DailyPowerReading = {
    dayLow: PowerReading;
    dayHigh: PowerReading;
    dayAverage: number;
    //powerIntervals: Array<PowerPriceInterval>;
}

export type PowerPriceInterval = {
    value: number
    start: Date
    end: Date
}


export type PowerReading = {
    value: number;
    start: string;
    end: string;
}
