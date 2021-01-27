import { Container } from "inversify";
import { ArangoDbConnection } from "./services";

export async function registerDatabaseModule(container: Container, dbUrl: string, dbName: string) {
    const cnx = new ArangoDbConnection(dbUrl, dbName);
    container.bind(ArangoDbConnection).toConstantValue(cnx);
    await cnx.initialize();
}