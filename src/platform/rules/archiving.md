# Archiving

Archive whole prototypes to keep them locally while excluding them from production builds.

- Set `meta.json.status` to `archived`. Remove it or set it to `active` to unarchive.
- Do not invent another status. Unknown values fail the build.
- Individual views, documents, and canvases cannot be archived. A folder can organize them, but does not exclude them from publication.
- Prefer archiving when the person wants to set work aside for later. Delete only when requested.
- Check active links before archiving. The build warns about links to excluded prototypes.
- Apply the [contributor scope rule](contributor-scope.md).

The [Prototypes README](../../platform/modules/prototypes/README.md) describes the local controls. `src/platform/core/archive.ts` defines production exclusion.
