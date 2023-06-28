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

  async getCsprNetworkCoinInfo() {
    try {
      const result = await this.api.get("/coins/casper-network");

      return result;
    } catch (e) {
      console.log({ e });
    }
  }
}
