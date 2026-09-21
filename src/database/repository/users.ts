import { db } from "../connections";

export class UsersRepository {
    async create(
        name: string,
        email: string
    ) {
        return await db.runAsync(
            `INSERT INTO users (name, email) 
            VALUES (?, ?)`,
            [name, email]
        );
    }
    async getAll() {
    return await db.getAllAsync(
        "SELECT * FROM users"
    );
    }
}