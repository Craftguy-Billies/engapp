import { PhoneFrame } from "./_components/phone-frame";
import { ProfilePage } from "./_pages/profile";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="12 · Profile">
        <ProfilePage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
