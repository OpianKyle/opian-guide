import { z } from "zod/v4";
export declare const leadImportHistoryTable: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "lead_import_history";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "lead_import_history";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: true;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        sourceUrl: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "source_url";
            tableName: "lead_import_history";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        importedCount: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "imported_count";
            tableName: "lead_import_history";
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "status";
            tableName: "lead_import_history";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "created_at";
            tableName: "lead_import_history";
            dataType: "date";
            columnType: "MySqlTimestamp";
            data: Date;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "mysql";
}>;
export declare const insertLeadImportHistorySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    sourceUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    importedCount: z.ZodOptional<z.ZodInt>;
}, {
    out: {};
    in: {};
}>;
export type InsertLeadImportHistory = z.infer<typeof insertLeadImportHistorySchema>;
export type LeadImportHistory = typeof leadImportHistoryTable.$inferSelect;
//# sourceMappingURL=lead_import_history.d.ts.map