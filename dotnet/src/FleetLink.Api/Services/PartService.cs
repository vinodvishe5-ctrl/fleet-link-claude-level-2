using FleetLink.Api.Data;
using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

public sealed class PartService : IPartService
{
    private readonly FleetStore _store;
    public PartService(FleetStore store) => _store = store;

    public IReadOnlyList<PartDto> ListParts() => _store.Parts.Select(p => p.ToDto()).ToList();
}
