import type { PaymentSimulationRequest, PaymentSimulationResponse } from "@show-booking/types";
import { api } from "./api";

export async function simulatePayment(request: PaymentSimulationRequest) {
  const response = await api.post<PaymentSimulationResponse>("/payments/simulate", request);
  return response.data;
}
