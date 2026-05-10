import { PhoneFrame } from "./_components/phone-frame";
import { BookmarksPage } from "./_pages/lists";
import { EngappStoreProvider } from "./_lib/store";

export default function Mockup() {
  return (
    <EngappStoreProvider>
      <PhoneFrame label="08 · Bookmarks">
        <BookmarksPage />
      </PhoneFrame>
    </EngappStoreProvider>
  );
}
