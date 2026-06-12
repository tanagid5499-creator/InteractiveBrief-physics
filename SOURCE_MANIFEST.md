# Source Manifest

Portable source and output map for InteractiveBrief.

## Implemented Outputs

- `261111-lab-01-*` through `261111-lab-10-*`
- `261112-lab-01-*` through `261112-lab-09-*`
- Root launcher: `index.html`
- Shared assets: `shared/`
- Clicker demo: `clicker/`

Every lab output is stored in:

```text
<lab-directory>/interactive-lab/
```

## Equipment Photos

The expected source-image directory is a sibling of this repository:

```text
..\ภาพอุปกรณ์การทดลอง\
```

Typical contents:

```text
ภาพอุปกรณ์การทดลอง/
  261111/
  261112/
  การทดลอง/
```

Processed images are copied into each lab as:

```text
interactive-lab/assets/equip/equip-NN.webp
```

Current `261111` baseline:

- 52 local WebP photos
- 6 SVG placeholders awaiting source images

See `NEXT_STEPS.md` for the exact placeholder list.

## Original Documents

The old project notes referenced owner-specific PDF paths outside the
repository. Those paths are not portable and the PDFs are not required to run
the current site. If the owner supplies authoritative source PDFs later, record
their repository-relative or shared-drive location here before using them.

For current implementation context, use:

- `HANDOFF.md`
- `CLAUDE.md`
- Existing lab HTML pages
- The sibling equipment-photo directory
