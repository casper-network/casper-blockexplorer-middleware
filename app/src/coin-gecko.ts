import { Logger } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";

export class CoinGecko {
  private api: AxiosInstance;
  readonly logger = new Logger(CoinGecko.name);

  constructor(public url: string) {
    this.api = axios.create({ baseURL: url });
  }

  async getCoinList() {
    try {
      const result = await this.api.get("/coins/list");

      return result;
    } catch (error) {
      this.logger.error("Error requesting coin list from coin gecko.", error);
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
      this.logger.error(
        "Error requesting coin exchange info from coin gecko.",
        error
      );
    }
  }
}
