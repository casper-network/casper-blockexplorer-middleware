import { Controller, Get, Param } from "@nestjs/common";
import { IsString } from "class-validator";
import { IsValidHash } from "src/blocks/blocks.controller";

import { DeploysService } from "./deploys.service";

export class DeploysByHashParamsDtp {
  @IsValidHash("hash", { message: "Not a valid hash." })
  @IsString()
  public hash: string;
}

@Controller("deploys")
export class DeploysController {
  constructor(private readonly deploysService: DeploysService) {}

  @Get(":hash")
  async getDeployByHash(@Param() params: DeploysByHashParamsDtp) {
    const { hash } = params;

    const deploy = await this.deploysService.getDeploy(hash);

    return deploy;
  }
}
