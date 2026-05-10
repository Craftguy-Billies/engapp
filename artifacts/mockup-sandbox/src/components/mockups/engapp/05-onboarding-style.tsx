import { PhoneFrame } from "./_components/phone-frame";
import { OnboardingPage } from "./_pages/onboarding";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="05 · Onboarding · Style picker">
        <OnboardingPage step="style" />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
