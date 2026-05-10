import { PhoneFrame } from "./_components/phone-frame";
import { OnboardingPage } from "./_pages/onboarding";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="04 · Onboarding · Daily goal">
        <OnboardingPage step="daily" />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
