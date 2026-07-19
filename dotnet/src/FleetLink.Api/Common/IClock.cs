namespace FleetLink.Api.Common;

/// <summary>
/// The server "today", behind an interface so the date rules (FSD rule 5 — no back-dating; rule 6 —
/// the Critical SLA window) can be tested deterministically. Production uses <see cref="SystemClock"/>;
/// tests inject a fixed clock.
/// </summary>
public interface IClock
{
    DateOnly Today { get; }
}

public sealed class SystemClock : IClock
{
    public DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);
}
