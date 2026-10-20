import { z } from "zod/v4";
export declare const adminsTable: import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: "admins";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: "admins";
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
        name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "name";
            tableName: "admins";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        email: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "email";
            tableName: "admins";
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        passwordHash: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "password_hash";
            tableName: "admins";
            dataType: "string";
            columnType: "MySqlText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        role: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "role";
            tableName: "admins";
            dataType: "string";
            columnType: "MySqlEnumColumn";
            data: "super_admin" | "admin";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["super_admin", "admin"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "created_at";
            tableName: "admins";
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
export declare const insertAdminSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        super_admin: "super_admin";
        admin: "admin";
    }>>;
}, {
    out: {};
    in: {};
}>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof adminsTable.$inferSelect;
//# sourceMappingURL=admins.d.ts.map