from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "diploma_work_template_kesi.md"
OUTPUT = ROOT / "docs" / "diploma_work_template_kesi.docx"
DOCX_W3CDTF_TIMESTAMP = "2026-01-01T00:00:00Z"
ZIP_MEMBER_TIMESTAMP = (2026, 1, 1, 0, 0, 0)


def read_paragraphs(path: Path) -> list[str]:
    paragraphs: list[str] = []
    current: list[str] = []

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()

        if not line:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            continue

        if line.startswith("#"):
            if current:
                paragraphs.append(" ".join(current))
                current = []
            paragraphs.append(line.lstrip("#").strip())
            continue

        current.append(line)

    if current:
        paragraphs.append(" ".join(current))

    return paragraphs


def paragraph_xml(text: str) -> str:
    safe = escape(text)
    return f'<w:p><w:r><w:t xml:space="preserve">{safe}</w:t></w:r></w:p>'


def build_document_xml(paragraphs: list[str]) -> str:
    body = "".join(paragraph_xml(p) for p in paragraphs)
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    {body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1134" w:bottom="1440" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>
"""


def build_core_xml() -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Рабочий шаблон дипломной работы</dc:title>
  <dc:creator>Cursor Cloud</dc:creator>
  <cp:lastModifiedBy>Cursor Cloud</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{DOCX_W3CDTF_TIMESTAMP}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{DOCX_W3CDTF_TIMESTAMP}</dcterms:modified>
</cp:coreProperties>
"""


def write_archive_entry(archive: ZipFile, name: str, content: str) -> None:
    info = ZipInfo(name)
    info.date_time = ZIP_MEMBER_TIMESTAMP
    info.compress_type = ZIP_DEFLATED
    archive.writestr(info, content)


def write_docx(paragraphs: list[str], destination: Path) -> None:
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Cursor Cloud</Application>
</Properties>
"""
    word_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
"""

    destination.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(destination, "w", compression=ZIP_DEFLATED) as archive:
        write_archive_entry(archive, "[Content_Types].xml", content_types)
        write_archive_entry(archive, "_rels/.rels", rels)
        write_archive_entry(archive, "docProps/app.xml", app)
        write_archive_entry(archive, "docProps/core.xml", build_core_xml())
        write_archive_entry(archive, "word/document.xml", build_document_xml(paragraphs))
        write_archive_entry(archive, "word/_rels/document.xml.rels", word_rels)


def main() -> None:
    paragraphs = read_paragraphs(SOURCE)
    write_docx(paragraphs, OUTPUT)
    print(f"Generated {OUTPUT}")


if __name__ == "__main__":
    main()
