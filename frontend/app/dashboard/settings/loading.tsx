export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-48 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="h-10 w-full max-w-md bg-muted rounded animate-pulse" />
        
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
