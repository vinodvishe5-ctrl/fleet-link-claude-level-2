using FleetLink.Api.Dtos;

namespace FleetLink.Api.Services;

/// <summary>Part reads (Module 2.D, Part A). Stock changes only through IWorkOrderService.AddParts (rule 8).</summary>
public interface IPartService
{
    IReadOnlyList<PartDto> ListParts();
}
