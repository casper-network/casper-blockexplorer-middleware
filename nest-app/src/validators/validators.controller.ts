import { Controller, Get, Query } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { ValidatorsService } from "./validators.service";

@Controller("validators")
export class ValidatorsController {
  constructor(private readonly validatorsService: ValidatorsService) {}

  @Get("current-era-validators-status")
  async getCurrentEraValidatorStatus() {
    console.log("in getCurrentEraValidatorStatus");

    const currentEraValidatorStatus =
      this.validatorsService.getCurrentEraValidatorStatus();
  }
}
