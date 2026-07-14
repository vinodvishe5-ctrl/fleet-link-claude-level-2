# Services/

Business rules live here, behind interfaces (`IWorkOrderService`, …). Endpoints stay thin and call services.

As of Module 2.B this holds only `IMetaService` / `MetaService` (non-domain, **no business logic** — it
just proves the endpoint → service layering). The domain services with the FSD §5 rules arrive in
**Module 2.D**.
