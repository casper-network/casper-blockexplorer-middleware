import {
  getCurrentEraValidatorsStub,
  getCurrentEraValidatorStatusStub,
} from "../stubs/validators.stub";

export const ValidatorsService = jest.fn().mockReturnValue({
  getCurrentEraValidators: jest
    .fn()
    .mockReturnValue(getCurrentEraValidatorsStub()),
  getCurrentEraValidatorStatus: jest
    .fn()
    .mockReturnValue(getCurrentEraValidatorStatusStub()),
});
