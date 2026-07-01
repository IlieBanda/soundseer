import { DiscoverSearch } from "./discover-search";

export default function DiscoverPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Поиск музыки</h1>
      <p className="mt-2 mb-6 text-zinc-400">
        Найдите артиста и запросите альбом для своей библиотеки.
      </p>
      <DiscoverSearch />
    </div>
  );
}
