import { FeedItem, type FeedItemViewModel } from './feed-item';

export function FeedList({ items, empty }: { items: FeedItemViewModel[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-muted text-center py-4">{empty ?? '今日还没人出招'}</p>;
  return (
    <div className="space-y-2">
      {items.map((it) => <FeedItem key={it.id} item={it} />)}
    </div>
  );
}
