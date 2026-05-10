import { PhoneFrame } from "./_components/phone-frame";
import { OnboardingPage } from "./_pages/onboarding";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="03 · Onboarding · Exam goal">
        <OnboardingPage step="exam" />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
