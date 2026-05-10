import { PhoneFrame } from "./_components/phone-frame";
import { SignInPage } from "./_pages/states";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="21 · Sign-in (placeholder)">
        <SignInPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
