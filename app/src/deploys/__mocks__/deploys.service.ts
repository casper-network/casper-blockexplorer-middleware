import { getDeployStub } from "../stubs/deploys.stub";

export const DeploysService = jest.fn().mockReturnValue({
  getDeploy: jest.fn().mockReturnValue(getDeployStub()),
});
