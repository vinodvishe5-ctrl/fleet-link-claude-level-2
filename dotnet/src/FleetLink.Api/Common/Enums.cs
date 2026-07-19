namespace FleetLink.Api.Common;

/// <summary>
/// Parses the string enum values FleetLink accepts on the wire (root CLAUDE.md: enums are strings) into
/// the domain enum, rejecting anything not a defined name as a clean 400 validation_error. Numeric
/// strings like "5" are rejected too (Enum.IsDefined guard).
/// </summary>
public static class Enums
{
    public static T Parse<T>(string? value, string field) where T : struct, Enum
    {
        if (Enum.TryParse<T>(value, ignoreCase: false, out var result) && Enum.IsDefined(result))
            return result;
        throw Errors.Validation($"{field} must be one of {string.Join(", ", Enum.GetNames<T>())}.");
    }

    public static bool IsValid<T>(string? value) where T : struct, Enum =>
        Enum.TryParse<T>(value, ignoreCase: false, out var result) && Enum.IsDefined(result);
}
