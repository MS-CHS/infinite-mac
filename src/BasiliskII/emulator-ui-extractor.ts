import JSZip from "jszip";
import {saveAs} from "file-saver";
import type {
    EmulatorWorkerDirectorExtraction,
    EmulatorWorkerDirectorExtractionEntry,
} from "./emulator-common";

export async function handleDirectoryExtraction(
    extraction: EmulatorWorkerDirectorExtraction
) {
    const zip = new JSZip();
    const manifest: string[] = [];

    function addToZip(
        path: string,
        zip: JSZip,
        entries: EmulatorWorkerDirectorExtractionEntry[]
    ) {
        for (const entry of entries) {
            if (Array.isArray(entry.contents)) {
                addToZip(
                    path + "/" + entry.name,
                    zip.folder(entry.name)!,
                    entry.contents
                );
            } else {
                zip.file(entry.name, entry.contents);
                manifest.push(path + "/" + entry.name);
            }
        }
    }

    addToZip("", zip, extraction.contents);

    const zipBlob = await zip.generateAsync({
        compression: "DEFLATE",
        compressionOptions: {level: 9},
        type: "blob",
    });
    const zipName = extraction.name + ".zip";

    saveAs(zipBlob, zipName);

    const manifestBlob = new Blob([JSON.stringify(manifest)]);
    const manifestName = extraction.name + ".json";

    saveAs(manifestBlob, manifestName);
}
