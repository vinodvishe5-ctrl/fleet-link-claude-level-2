using System.Text.Json;

namespace FleetLink.Api.Common;

/// <summary>
/// The ONE error shape for the whole API (Module 2.D, Part C). Every failure — a rule thrown from a
/// service, a boundary validation error, or an unexpected fault — leaves through here as the same body
/// { error, code } with the FSD status. There is not a different error shape per endpoint.
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (DomainException ex)
        {
            await Write(context, ex.Status, ex.Message, ex.Code);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error");
            await Write(context, 500, "Internal server error.", "internal");
        }
    }

    private static Task Write(HttpContext context, int status, string error, string code)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(new { error, code }, Json));
    }
}
