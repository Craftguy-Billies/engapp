import { PhoneFrame } from "./_components/phone-frame";
import { KnownPage } from "./_pages/lists";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="09 · Known words">
        <KnownPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
