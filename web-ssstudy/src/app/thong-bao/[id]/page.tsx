import NotificationDetailClient from "./_components/NotificationDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NotificationDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const messageUserId = typeof resolvedSearchParams.message_user_id === 'string' 
    ? resolvedSearchParams.message_user_id 
    : undefined;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
      <NotificationDetailClient notificationId={id} messageUserId={messageUserId} />
    </div>
  );
}

