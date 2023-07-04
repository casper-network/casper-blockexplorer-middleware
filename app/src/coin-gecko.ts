import axios, { AxiosInstance } from "axios";

export class CoinGecko {
  private api: AxiosInstance;

  constructor(public url: string) {
    this.api = axios.create({ baseURL: url });
  }

  async getCoinList() {
    try {
      const result = await this.api.get("/coins/list");

      return result;
    } catch (error) {
      // TODO: will update to use logger in #115
      console.log("Error requesting coin list from coin gecko.", error);
    }
  }

  async getCsprNetworkCoinExchangeInfo() {
    try {
      const {
        data: {
          market_data: { current_price: currentExchangePrices },
        },
      } = await this.api.get<{
        market_data: { current_price: { [key: string]: number } };
      }>("/coins/casper-network");

      return currentExchangePrices;
    } catch (error) {
      // TODO: will update to use logger in #115
      console.log(
        "Error requesting coin exchange info from coin gecko.",
        error
      );
    }
  }
}
