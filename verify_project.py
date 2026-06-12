"""Structural verification for the InteractiveBrief project."""

from __future__ import annotations

from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
import subprocess
import sys


ROOT = Path(__file__).resolve().parent
EXPECTED_COUNTS = {"261111": 10, "261112": 9}
EXPECTED_BLOOM = {
    "remember",
    "understand",
    "apply",
    "analyze",
    "evaluate",
    "create",
}
EXPECTED_OPTIONS = {"A", "B", "C", "D", "E"}


@dataclass
class Quiz:
    qid: str
    bloom: str
    answer: str
    options: set[str] = field(default_factory=set)


class LabParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sections = 0
        self.equipment_cards = 0
        self.equipment_images = 0
        self.equipment_svgs = 0
        self.asset_refs: list[str] = []
        self.quizzes: list[Quiz] = []
        self._quiz: Quiz | None = None
        self._quiz_depth = 0
        self._inside_equipment = 0

    @staticmethod
    def _attrs(attrs: list[tuple[str, str | None]]) -> dict[str, str]:
        return {key: value or "" for key, value in attrs}

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        data = self._attrs(attrs)
        classes = set(data.get("class", "").split())

        if tag == "section":
            self.sections += 1

        if tag == "figure" and "equip-card" in classes:
            self.equipment_cards += 1
            self._inside_equipment += 1

        if tag == "img":
            src = data.get("src", "")
            if src:
                self.asset_refs.append(src)
            if self._inside_equipment and "assets/equip/" in src:
                self.equipment_images += 1

        if tag in {"script", "link"}:
            ref = data.get("src") or data.get("href")
            if ref:
                self.asset_refs.append(ref)

        if tag == "svg" and self._inside_equipment:
            self.equipment_svgs += 1

        if tag == "div":
            if self._quiz is None and "quick-quiz" in classes:
                self._quiz = Quiz(
                    qid=data.get("data-qid", ""),
                    bloom=data.get("data-bloom", ""),
                    answer=data.get("data-answer", ""),
                )
                self._quiz_depth = 1
            elif self._quiz is not None:
                self._quiz_depth += 1

        if self._quiz is not None and tag == "button":
            option = data.get("data-quiz-option", "")
            if option:
                self._quiz.options.add(option)

    def handle_endtag(self, tag: str) -> None:
        if tag == "figure" and self._inside_equipment:
            self._inside_equipment -= 1

        if tag == "div" and self._quiz is not None:
            self._quiz_depth -= 1
            if self._quiz_depth == 0:
                self.quizzes.append(self._quiz)
                self._quiz = None


def local_asset_exists(page: Path, reference: str) -> bool:
    if not reference or reference.startswith(
        ("http://", "https://", "data:", "#", "mailto:")
    ):
        return True
    clean = reference.split("?", 1)[0].split("#", 1)[0]
    return (page.parent / clean).resolve().exists()


def parse_lab(page: Path) -> tuple[LabParser, str]:
    text = page.read_text(encoding="utf-8")
    parser = LabParser()
    parser.feed(text)
    return parser, text


def main() -> int:
    failures: list[str] = []
    warnings: list[str] = []
    all_pages: list[Path] = []
    versions: dict[str, set[str]] = {"css": set(), "js": set()}
    term1_photo_count = 0
    term1_svg_count = 0

    for course, expected in EXPECTED_COUNTS.items():
        lab_dirs = sorted(ROOT.glob(f"{course}-lab-*"))
        if len(lab_dirs) != expected:
            failures.append(
                f"{course}: expected {expected} lab directories, found {len(lab_dirs)}"
            )

        for lab_dir in lab_dirs:
            lab_root = lab_dir / "interactive-lab"
            required = [
                lab_root / "index.html",
                lab_root / "styles.css",
                lab_root / "js" / "app.js",
            ]
            for path in required:
                if not path.exists():
                    failures.append(f"Missing required file: {path.relative_to(ROOT)}")

            page = required[0]
            if not page.exists():
                continue

            all_pages.append(page)
            parser, text = parse_lab(page)
            label = lab_dir.name

            if parser.sections < 14:
                failures.append(f"{label}: only {parser.sections} section elements")

            for kind, pattern in (
                ("css", r"drafting-sheet\.css\?v=(\d+)"),
                ("js", r"brief-core\.js\?v=(\d+)"),
            ):
                match = re.search(pattern, text)
                if not match:
                    failures.append(f"{label}: missing shared {kind} cache version")
                else:
                    versions[kind].add(match.group(1))

            for reference in parser.asset_refs:
                if not local_asset_exists(page, reference):
                    failures.append(f"{label}: missing asset {reference}")

            if parser.equipment_cards != (
                parser.equipment_images + parser.equipment_svgs
            ):
                failures.append(
                    f"{label}: {parser.equipment_cards} equipment cards but "
                    f"{parser.equipment_images} images + "
                    f"{parser.equipment_svgs} SVG placeholders"
                )

            uncommented = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
            for tag in ("div", "section", "aside", "button", "figure"):
                opened = len(re.findall(fr"<{tag}\b", uncommented, re.IGNORECASE))
                closed = len(re.findall(fr"</{tag}>", uncommented, re.IGNORECASE))
                if opened != closed:
                    failures.append(
                        f"{label}: unbalanced <{tag}> tags ({opened} open, {closed} close)"
                    )

            if course == "261111":
                expected_questions = 8 if "-lab-01-" in label else 6
                if len(parser.quizzes) != expected_questions:
                    failures.append(
                        f"{label}: expected {expected_questions} quizzes, "
                        f"found {len(parser.quizzes)}"
                    )

                qids = [quiz.qid for quiz in parser.quizzes]
                if any(not qid for qid in qids):
                    failures.append(f"{label}: quiz missing data-qid")
                if len(qids) != len(set(qids)):
                    failures.append(f"{label}: duplicate data-qid values")

                bloom = {quiz.bloom for quiz in parser.quizzes}
                if not EXPECTED_BLOOM.issubset(bloom):
                    missing = ", ".join(sorted(EXPECTED_BLOOM - bloom))
                    failures.append(f"{label}: missing Bloom levels: {missing}")

                for quiz in parser.quizzes:
                    if quiz.answer not in EXPECTED_OPTIONS:
                        failures.append(
                            f"{label}/{quiz.qid or '?'}: invalid answer "
                            f"{quiz.answer or '(empty)'}"
                        )
                    if quiz.options != EXPECTED_OPTIONS:
                        failures.append(
                            f"{label}/{quiz.qid or '?'}: options are "
                            f"{sorted(quiz.options)}, expected A-E"
                        )

                term1_photo_count += parser.equipment_images
                term1_svg_count += parser.equipment_svgs

    if len(all_pages) != sum(EXPECTED_COUNTS.values()):
        failures.append(f"Expected 19 lab pages, found {len(all_pages)}")

    for kind, values in versions.items():
        if len(values) != 1:
            failures.append(
                f"Shared {kind} cache versions are inconsistent: {sorted(values)}"
            )

    if versions["css"] != versions["js"]:
        failures.append(
            f"Shared CSS/JS cache versions differ: "
            f"{sorted(versions['css'])} vs {sorted(versions['js'])}"
        )

    if term1_photo_count < 52:
        failures.append(
            f"261111 equipment-photo baseline regressed: "
            f"{term1_photo_count} found, expected at least 52"
        )
    if term1_svg_count > 6:
        failures.append(
            f"261111 placeholder baseline regressed: "
            f"{term1_svg_count} found, expected at most 6"
        )

    js_files = [
        ROOT / "shared" / "brief-core.js",
        *sorted(ROOT.glob("clicker/*.js")),
        *sorted(ROOT.glob("*-lab-*/interactive-lab/js/app.js")),
    ]
    js_files = sorted({path.resolve() for path in js_files if path.exists()})
    node = shutil.which("node")
    if node:
        for js_file in js_files:
            result = subprocess.run(
                [node, "--check", str(js_file)],
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode:
                detail = (result.stderr or result.stdout).strip()
                failures.append(
                    f"JavaScript syntax error in "
                    f"{js_file.relative_to(ROOT)}: {detail}"
                )
    else:
        warnings.append("Node.js not found; JavaScript syntax checks were skipped")

    current_version = next(iter(versions["css"]), "unknown")
    print("InteractiveBrief verification")
    print(f"  Lab pages: {len(all_pages)}/19")
    print(f"  Shared cache version: v{current_version}")
    print(f"  261111 equipment photos: {term1_photo_count}")
    print(f"  261111 SVG placeholders: {term1_svg_count}")
    print(f"  JavaScript files checked: {len(js_files) if node else 0}")
    for warning in warnings:
        print(f"WARNING: {warning}")

    if failures:
        print(f"FAIL: {len(failures)} issue(s)")
        for failure in failures:
            print(f"  - {failure}")
        return 1

    print("PASS: project structure and Phase 1 baselines are valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
