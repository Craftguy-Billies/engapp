import { PhoneFrame } from "./_components/phone-frame";
import { PaywallPage } from "./_pages/paywall";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="18 · Paywall · premium" innerBg="#0F0F0F">
        <PaywallPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
