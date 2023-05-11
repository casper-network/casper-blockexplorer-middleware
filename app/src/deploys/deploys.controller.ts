import { Controller, Get, Param } from "@nestjs/common";
import { IsString } from "class-validator";
import { IsValidHash, ValidationError } from "src/utils/nest-validation";

import { DeploysService } from "./deploys.service";

export class DeploysByHashParamsDtp {
  @IsValidHash("hash", { message: ValidationError.Hash })
  @IsString()
  public hash: string;
}

@Controller("deploys")
export class DeploysController {
  constructor(private readonly deploysService: DeploysService) {}

  @Get(":hash")
  async getDeployByHash(@Param() params: DeploysByHashParamsDtp) {
    const { hash } = params;

    console.log({ params });

    const deploy = await this.deploysService.getDeploy(hash);

    return deploy;
  }
}
