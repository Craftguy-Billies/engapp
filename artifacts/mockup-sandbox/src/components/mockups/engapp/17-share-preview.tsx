import { PhoneFrame } from "./_components/phone-frame";
import { SharePreviewPage } from "./_pages/share";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="17 · Share Card Preview">
        <SharePreviewPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
