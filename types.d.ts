// Card object interface based on card-object-api-docs.md and /data JSON files

export interface Card {
    id: string;
    name: string;
    supertype: string;
    subtypes?: string[];
    level?: string;
    hp?: string;
    types?: string[];
    evolvesFrom?: string;
    evolvesTo?: string[];
    rules?: string[];
    ancientTrait?: {
      name: string;
      text: string;
    };
    abilities?: {
      name: string;
      text: string;
      type: string;
    }[];
    attacks?: {
      cost: string[];
      name: string;
      text: string;
      damage: string;
      convertedEnergyCost: number;
    }[];
    weaknesses?: {
      type: string;
      value: string;
    }[];
    resistances?: {
      type: string;
      value: string;
    }[];
    retreatCost?: string[];
    convertedRetreatCost?: number;
    set?: {
      id: string;
      name: string;
      series: string;
      printedTotal: number;
      total: number;
      legalities: {
        unlimited?: string;
        standard?: string;
        expanded?: string;
      };
      ptcgoCode?: string;
      releaseDate?: string;
      updatedAt?: string;
      images?: {
        symbol: string;
        logo: string;
      };
    };
    number?: string;
    artist?: string;
    rarity?: string;
    flavorText?: string;
    nationalPokedexNumbers?: number[];
    legalities?: {
      unlimited?: string;
      standard?: string;
      expanded?: string;
    };
    regulationMark?: string;
    images?: {
      small: string;
      large: string;
    };
    tcgplayer?: {
      url: string;
      updatedAt?: string;
      prices?: {
        [key: string]: {
          low?: number;
          mid?: number;
          high?: number;
          market?: number;
          directLow?: number;
        };
      };
    };
    cardmarket?: {
      url: string;
      updatedAt?: string;
      prices?: {
        averageSellPrice?: number;
        lowPrice?: number;
        trendPrice?: number;
        germanProLow?: number | null;
        suggestedPrice?: number | null;
        reverseHoloSell?: number | null;
        reverseHoloLow?: number | null;
        reverseHoloTrend?: number | null;
        lowPriceExPlus?: number;
        avg1?: number;
        avg7?: number;
        avg30?: number;
        reverseHoloAvg1?: number | null;
        reverseHoloAvg7?: number | null;
        reverseHoloAvg30?: number | null;
      };
    };
  }