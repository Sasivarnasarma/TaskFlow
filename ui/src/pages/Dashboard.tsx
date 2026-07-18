export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage your tasks and view completion statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['Total Tasks', 'Completed', 'Pending', 'Completion Rate'].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-sm font-medium text-muted-foreground">{stat}</h3>
            <p className="text-2xl font-bold mt-2">{i === 3 ? '0%' : '0'}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col items-center justify-center min-h-[300px] text-center">
        <p className="text-muted-foreground font-medium">No tasks yet.</p>
        <p className="text-sm text-muted-foreground/80 mt-1">Create tasks to populate the dashboard.</p>
      </div>
    </div>
  )
}
