import { PhoneFrame } from "./_components/phone-frame";
import { SearchPage } from "./_pages/search";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="16 · Search Results">
        <SearchPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
