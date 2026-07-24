using System.Globalization;

namespace FleetLink.Api.Common;

/// <summary>
/// ISO date parsing for the request boundary (Module 2.D). FleetLink dates are 'yyyy-MM-dd'. The
/// boundary accepts them as strings and parses here so a malformed date fails as a clean 400
/// validation_error through the one error shape — not as an opaque model-binding fault.
/// </summary>
public static class Dates
{
    public static bool TryParseIso(string? value, out DateOnly date) =>
        DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out date);

    public static DateOnly ParseIso(string? value)
    {
        if (!TryParseIso(value, out var date)) throw Errors.Validation($"'{value}' is not an ISO date (yyyy-MM-dd).");
        return date;
    }
}
