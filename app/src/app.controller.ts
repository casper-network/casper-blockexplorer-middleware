import { Controller, Get } from "@nestjs/common";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("status")
  async getStatus() {
    const status = await this.appService.getStatus();

    return status;
  }

  @Get("version")
  async getVersion() {
    const version = await this.appService.getVersion();

    return version;
  }
}
