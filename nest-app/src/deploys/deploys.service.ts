import { Injectable } from "@nestjs/common";

@Injectable()
export class DeploysService {
  async onModuleInit() {
    console.log("init deploy service");
  }

  async getDeploy(hash: string) {
    console.log("in getDeploy hash", hash);
  }
}
