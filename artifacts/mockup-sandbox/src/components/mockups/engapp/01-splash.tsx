import { PhoneFrame } from "./_components/phone-frame";
import { SplashPage } from "./_pages/splash";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="01 · Splash / Boot">
        <SplashPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
