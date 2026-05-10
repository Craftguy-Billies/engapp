import { PhoneFrame } from "./_components/phone-frame";
import { FeedPage } from "./_pages/feed";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="06 · Feed · main swipe">
        <FeedPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
