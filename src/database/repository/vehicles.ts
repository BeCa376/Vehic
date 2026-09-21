import { db } from "../connections";

export class VehiclesRepository {
    async create(
        userId: number,
        name: string,
        brand: string,
        vehicleModel: string
    ) {
        return await db.runAsync(
            `INSERT INTO vehicles (user_id, name, vehicle_type, brand, vehicle_model)
            VALUES (?, ?, ?, ?, ?)`,
            [userId, name, "motorcycle", brand, vehicleModel]
        );
    }
    async getAll() {
    return await db.getAllAsync(
        "SELECT * FROM vehicles"
    );
    }
}