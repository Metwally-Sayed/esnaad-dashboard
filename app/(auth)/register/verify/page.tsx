import { Suspense } from 'react';
import { VerifyOtpPage } from "@/components/VerifyOtpPage";

export default function VerifyOtp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
}