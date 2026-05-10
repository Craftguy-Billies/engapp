import { PhoneFrame } from "./_components/phone-frame";
import { WordDetailPage } from "./_pages/word-detail";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="07 · Word detail">
        <WordDetailPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
