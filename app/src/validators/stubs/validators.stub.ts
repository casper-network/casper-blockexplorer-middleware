export const getCurrentEraValidatorStatusStub = () => ({
  validatorsCount: 100,
  bidsCount: 110,
});

export const getCurrentEraValidatorsStub = () => ({
  validators: [
    {
      publicKey:
        "015692c70f62a5227b4af46b90f03b0966725d8101215dfcf395445459e5ba2fad",
      totalStakeMotes: 115914132215810220,
      feePercentage: 10,
      delegatorsCount: 5,
      selfPercentage: 1.37,
      percentageOfNetwork: 1.33,
      rank: 25,
    },
  ],
  status: { validatorsCount: 100, bidsCount: 110, latestEraId: 8887 },
});
