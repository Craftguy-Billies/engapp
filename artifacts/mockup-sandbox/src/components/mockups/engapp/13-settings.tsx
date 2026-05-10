import { PhoneFrame } from "./_components/phone-frame";
import { SettingsPage } from "./_pages/settings";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="13 · Settings">
        <SettingsPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
