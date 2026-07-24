using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

/// <summary>
/// App metadata behind an interface — the same service pattern the domain will use in Module 2.D,
/// demonstrated here with no business rules.
/// </summary>
public interface IMetaService
{
    MetaDto GetMeta();
}
