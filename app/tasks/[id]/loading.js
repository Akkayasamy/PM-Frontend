export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-lg font-medium">Loading task details...</p>
      <p className="text-sm text-muted-foreground">
        Please wait while we retrieve the task information
      </p>
    </div>
  );
}
