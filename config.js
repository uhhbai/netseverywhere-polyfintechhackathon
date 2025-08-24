const commonConfigs = {
  apiHeader: {
    "api-key": import.meta.env.VITE_SANDBOX_API_KEY,
    "project-id": import.meta.env.VITE_SANDBOX_PROJECT_ID,
  },
  apiUrls: {
    requestNetsApi: () => "https://sandbox.nets.openapipaas.com/api/v1/common/payments/nets-qr/request",
    queryNetsApi: () => "https://sandbox.nets.openapipaas.com/api/v1/common/payments/nets-qr/query",
    webhookNetsApi: (txnRetrieval_ref) => `https://sandbox.nets.openapipaas.com/api/v1/common/payments/nets/webhook?txn_retrieval_ref=${txnRetrieval_ref}`,
  }
};

export default commonConfigs;