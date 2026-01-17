interface EmptyStateProps {
  title: string;
  description: string;
  testId?: string;
}

export function EmptyState({ title, description, testId }: EmptyStateProps) {
  return (
    <div
      className="rounded-lg border border-dashed p-12 text-center"
      data-test-id={testId || "empty-state"}
    >
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </div>
  );
}
