import { PhoneFrame } from "./_components/phone-frame";
import { ErrorStatePage } from "./_pages/states";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="20 · Error / Offline">
        <ErrorStatePage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
