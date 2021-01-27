import { Env, loadConfig } from "env-decorator";

export class Config {
    @Env("NODE_ENV")
    env: string = "development";

    @Env("PORT")
    port: number = 3000;

    @Env("DB_NAME")
    dbName: string = "iti_community";

    @Env("DB_URL")
    dbUrl: string = "http://localhost:8529";

    @Env("AUTH_SECRET")
    authSecret: string = "6zKOFPXCJVT2rSIBIGczyN4noGZoTtkR";

    @Env("LOCAL_FILES_URL")
    filesUrl: string = "http://localhost:3000/file";
}

export const config = loadConfig(Config);