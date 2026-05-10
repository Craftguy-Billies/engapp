import { PhoneFrame } from "./_components/phone-frame";
import { OnboardingPage } from "./_pages/onboarding";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="02 · Onboarding · Language">
        <OnboardingPage step="language" />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
