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
    } catch (e) {
      console.log({ e });
    }
  }

  async getCsprNetworkCoinExchangeInfo() {
    try {
      const {
        data: {
          market_data: { current_price },
        },
      } = await this.api.get<{
        market_data: { current_price: { [key: string]: number } };
      }>("/coins/casper-network");

      return current_price;
    } catch (e) {
      console.log({ e });
    }
  }
}
