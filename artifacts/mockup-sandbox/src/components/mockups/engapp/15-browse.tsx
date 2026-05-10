import { PhoneFrame } from "./_components/phone-frame";
import { BrowsePage } from "./_pages/browse";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="15 · Browse / Filter">
        <BrowsePage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
