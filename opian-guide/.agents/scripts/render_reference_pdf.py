from pathlib import Path

import pymupdf


source = Path("/home/runner/workspace/attached_assets/Opian-Life-Personal-Objectives-Report_(1)_1793956163431.pdf")
output_dir = Path(__file__).resolve().parents[1] / "outputs" / "toolkit-reference"
output_dir.mkdir(parents=True, exist_ok=True)

document = pymupdf.open(source)
matrix = pymupdf.Matrix(1.45, 1.45)

for page_number, page in enumerate(document, start=1):
    page.get_pixmap(matrix=matrix, alpha=False).save(
        output_dir / f"reference-page-{page_number}.png"
    )

print(f"Rendered {document.page_count} pages to {output_dir}")
