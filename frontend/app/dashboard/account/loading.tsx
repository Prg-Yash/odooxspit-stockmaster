export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-48 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2 text-center w-full">
              <div className="h-6 w-32 bg-muted rounded animate-pulse mx-auto" />
              <div className="h-4 w-40 bg-muted rounded animate-pulse mx-auto" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-72 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
