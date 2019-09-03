import glob from "glob";
import fs from "fs";
import path from "path";
import { convertSDL } from "nexus";
import fsExtra from "fs-extra";
import { SDLConverter } from "nexus/dist/core";
import { buildSchema } from "graphql";

const nexusTsDir = path.join(__dirname, "..", "src", "generated", "nexus");

fsExtra.emptyDirSync(nexusTsDir);

const nexusTsPath = path.join(nexusTsDir, "types.ts");
fs.writeFileSync(nexusTsPath, "// Generated Nexus Code from Provided SDL\n\n");

glob("./graphql/*.gql", (err, sdlPaths) => {
    const sdl = sdlPaths
        .map(sdlPath => {
            const sdlStr = fs.readFileSync(sdlPath, "utf8");
            try {
                buildSchema(sdlStr)
            } catch(error) {
                console.error(`Error building schema for ${sdlPath}`, error)
                process.exit(1)
            }
            return sdlStr
        })
        .join("\n\n");


    const converter = new SDLConverter(sdl, false, JSON)

    fs.appendFileSync(nexusTsPath, converter.print());
});
