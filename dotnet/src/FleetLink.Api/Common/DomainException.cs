namespace FleetLink.Api.Common;

/// <summary>
/// The one exception the domain throws (Module 2.D). A service raises a <see cref="DomainException"/>
/// carrying the exact FSD status code and a stable machine-readable <see cref="Code"/>; the
/// <see cref="ExceptionHandlingMiddleware"/> turns it into the single response shape { error, code }.
/// This is how a rule enforced in a service surfaces as the right HTTP status without the endpoint
/// knowing the rule.
/// </summary>
public sealed class DomainException : Exception
{
    public int Status { get; }
    public string Code { get; }

    public DomainException(int status, string code, string message) : base(message)
    {
        Status = status;
        Code = code;
    }
}
