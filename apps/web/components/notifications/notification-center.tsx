"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Inbox, Settings2, X } from "lucide-react";
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationPreference,
  NotificationUnreadCount,
  UpdateNotificationPreferencesRequest
} from "@ninibu/types";
import { formatJalaliDateTime, formatRelativeFa, toPersianDigits } from "@/lib/datetime";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationPreferences } from "./notification-preferences";
import { notificationCategoryLabel, notificationPriorityLabel, notificationTimestamp } from "./notification-data";

type InboxMode = "all" | "unread";
type CenterView = "inbox" | "settings";

export function NotificationCenter({ unreadCount, openRequest = 0 }: { unreadCount: number; openRequest?: number }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CenterView>("inbox");
  const [mode, setMode] = useState<InboxMode>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (openRequest > 0) {
      setView("inbox");
      setOpen(true);
    }
  }, [openRequest]);

  const inboxQuery = useQuery({
    queryKey: ["notifications", "list", mode, page],
    queryFn: () => clientApi<NotificationListResponse>(
      `/api/ninibu/notifications?page=${page}&limit=20&unread_only=${mode === "unread" ? "true" : "false"}`
    ),
    enabled: open && view === "inbox"
  });

  const preferencesQuery = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => clientApi<NotificationPreference[]>("/api/ninibu/notification-preferences"),
    enabled: open && view === "settings"
  });

  async function refreshNotificationQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    ]);
  }

  const markRead = useMutation({
    mutationFn: (id: number) => clientApi<NotificationItem>(`/api/ninibu/notifications/${id}/read`, { method: "POST" }),
    onSuccess: refreshNotificationQueries
  });

  const markAllRead = useMutation({
    mutationFn: () => clientApi<unknown>("/api/ninibu/notifications/read-all", { method: "POST" }),
    onSuccess: refreshNotificationQueries
  });

  const savePreferences = useMutation({
    mutationFn: (payload: UpdateNotificationPreferencesRequest) =>
      clientApi<NotificationPreference[]>("/api/ninibu/notification-preferences", {
        method: "PATCH",
        body: JSON.stringify(payload)
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    }
  });

  function changeMode(next: InboxMode) {
    setMode(next);
    setPage(1);
  }

  const totalPages = inboxQuery.data?.pagination.total_pages ?? 1;
  const items = inboxQuery.data?.items ?? [];

  return <>
    <button
      className="notification-button"
      aria-label={`${unreadCount} اعلان خوانده‌نشده`}
      aria-expanded={open}
      onClick={() => setOpen(true)}
    >
      <Bell size={20} />
      {unreadCount > 0 && <span>{unreadCount > 99 ? "۹۹+" : toPersianDigits(unreadCount)}</span>}
    </button>

    {open && <div className="notification-center-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <aside className="notification-center" role="dialog" aria-modal="true" aria-label="مرکز اعلان‌ها" onMouseDown={(event) => event.stopPropagation()}>
        <header className="notification-center-header">
          <div>
            <strong>{view === "inbox" ? "اعلان‌ها" : "تنظیم اعلان‌ها"}</strong>
            <span>{unreadCount ? `${toPersianDigits(unreadCount)} خوانده‌نشده` : "همه اعلان‌ها خوانده شده‌اند"}</span>
          </div>
          <div className="notification-center-header-actions">
            <button onClick={() => setView(view === "inbox" ? "settings" : "inbox")} aria-label={view === "inbox" ? "تنظیم اعلان‌ها" : "بازگشت به اعلان‌ها"}>
              {view === "inbox" ? <Settings2 size={18} /> : <Inbox size={18} />}
            </button>
            <button onClick={() => setOpen(false)} aria-label="بستن"><X size={19} /></button>
          </div>
        </header>

        {view === "inbox" ? <>
          <div className="notification-toolbar">
            <div className="notification-tabs" role="tablist" aria-label="فیلتر اعلان‌ها">
              <button className={mode === "all" ? "is-active" : ""} onClick={() => changeMode("all")}>همه</button>
              <button className={mode === "unread" ? "is-active" : ""} onClick={() => changeMode("unread")}>خوانده‌نشده</button>
            </div>
            <Button variant="outline" disabled={unreadCount === 0 || markAllRead.isPending} onClick={() => markAllRead.mutate()}>
              <CheckCheck size={15} /> {markAllRead.isPending ? "در حال ثبت…" : "خواندن همه"}
            </Button>
          </div>

          <div className="notification-center-scroll">
            {inboxQuery.isLoading && <NotificationSkeleton />}
            {inboxQuery.isError && <NotificationError message={inboxQuery.error.message} onRetry={() => inboxQuery.refetch()} />}
            {!inboxQuery.isLoading && !inboxQuery.isError && items.length === 0 && <div className="notification-empty">
              <Inbox size={28} />
              <strong>{mode === "unread" ? "اعلان خوانده‌نشده‌ای ندارید" : "هنوز اعلانی ندارید"}</strong>
              <p>وقتی یادآوری یا رویداد مهمی برای شما ایجاد شود، اینجا دیده می‌شود.</p>
            </div>}

            <div className="notification-list">
              {items.map((item) => <NotificationRow
                key={item.id}
                item={item}
                busy={markRead.isPending && markRead.variables === item.id}
                onRead={() => item.status !== "read" && markRead.mutate(item.id)}
              />)}
            </div>
          </div>

          {totalPages > 1 && <footer className="notification-pagination">
            <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronRight size={17} /> قبلی</button>
            <span>صفحه {toPersianDigits(page)} از {toPersianDigits(totalPages)}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>بعدی <ChevronLeft size={17} /></button>
          </footer>}
        </> : <div className="notification-center-scroll settings-view">
          {preferencesQuery.isLoading && <NotificationSkeleton />}
          {preferencesQuery.isError && <NotificationError message={preferencesQuery.error.message} onRetry={() => preferencesQuery.refetch()} />}
          {preferencesQuery.data && <NotificationPreferences
            key={preferencesQuery.data.map((item) => `${item.category}:${item.updated_at ?? ""}`).join("|")}
            items={preferencesQuery.data}
            saving={savePreferences.isPending}
            error={savePreferences.isError ? savePreferences.error.message : undefined}
            onSave={(payload) => savePreferences.mutate(payload)}
          />}
        </div>}
      </aside>
    </div>}
  </>;
}

function NotificationRow({ item, busy, onRead }: { item: NotificationItem; busy: boolean; onRead: () => void }) {
  const timestamp = notificationTimestamp(item);
  const unread = item.status !== "read";
  return <article className={`notification-row ${unread ? "is-unread" : ""}`}>
    <button className="notification-row-main" onClick={onRead} disabled={busy || !unread}>
      <div className="notification-row-topline">
        <span className="notification-category">{notificationCategoryLabel(item.category)}</span>
        <span className={`notification-priority priority-${item.priority}`}>{notificationPriorityLabel(item.priority)}</span>
      </div>
      <strong>{item.title}</strong>
      <p>{item.body}</p>
      {timestamp && <div className="notification-time" title={formatJalaliDateTime(timestamp)}>
        <span>{formatRelativeFa(timestamp)}</span>
        <small>{formatJalaliDateTime(timestamp)}</small>
      </div>}
    </button>
    {unread && <button className="notification-read-action" disabled={busy} onClick={onRead}>
      {busy ? "…" : "خواندم"}
    </button>}
  </article>;
}

function NotificationSkeleton() {
  return <div className="notification-loading" aria-label="در حال دریافت اعلان‌ها">
    {[1, 2, 3, 4].map((item) => <div key={item} className="notification-loading-row">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-36" />
    </div>)}
  </div>;
}

function NotificationError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="notification-error-state">
    <strong>دریافت اطلاعات انجام نشد</strong>
    <p>{message}</p>
    <Button variant="outline" onClick={onRetry}>تلاش دوباره</Button>
  </div>;
}
