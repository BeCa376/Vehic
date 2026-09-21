import { db } from "./connections";

export async function runMigrations() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        photo_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        nickname TEXT,
        vehicle_type TEXT NOT NULL,
        vehicle_year INTEGER,
        brand TEXT NOT NULL,
        vehicle_model TEXT NOT NULL,
        plate TEXT UNIQUE,
        renavam TEXT UNIQUE,
        vin TEXT UNIQUE,
        color TEXT,
        tank_capacity REAL CHECK(tank_capacity >= 0),
        reserve_capacity REAL CHECK(reserve_capacity >= 0),
        purchase_date DATE,
        active INTEGER DEFAULT 1 CHECK(active IN (0,1)),
        current_odometer INTEGER DEFAULT 0 CHECK(current_odometer >= 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vehicle_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL UNIQUE,
        front_tire_pressure REAL,
        rear_tire_pressure REAL,
        recommended_front_tire_pressure REAL,
        recommended_rear_tire_pressure REAL,
        oil_change_interval_km INTEGER,
        oil_change_interval_days INTEGER,
        calibration_interval_days INTEGER,
        chain_lubrication_interval_km INTEGER,
        chain_lubrication_interval_days INTEGER,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS fuel_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        fuel_date DATE NOT NULL,
        odometer INTEGER NOT NULL,
        liters REAL NOT NULL CHECK (liters > 0),
        total_cost REAL NOT NULL,
        fuel_type TEXT,
        station_name TEXT,
        notes TEXT,
        is_full_tank INTEGER DEFAULT 0 CHECK (is_full_tank IN (0,1)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        manufacturer TEXT
    );

    CREATE TABLE IF NOT EXISTS maintenance_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        priority INTEGER DEFAULT 1 CHECK(priority BETWEEN 1 AND 3),
        default_interval_km INTEGER,
        default_interval_days INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS maintenance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        maintenance_type_id INTEGER NOT NULL,
        maintenance_date DATE NOT NULL,
        odometer INTEGER NOT NULL CHECK (odometer >= 0),
        cost REAL,
        description TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id),
        FOREIGN KEY(maintenance_type_id)
            REFERENCES maintenance_types(id)
    );

    CREATE TABLE IF NOT EXISTS maintenance_parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        maintenance_id INTEGER NOT NULL,
        part_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1 CHECK(quantity > 0),
        cost REAL,
        FOREIGN KEY(maintenance_id)
            REFERENCES maintenance_records(id),
        FOREIGN KEY(part_id)
            REFERENCES parts(id)
    );

    CREATE TABLE IF NOT EXISTS scheduled_maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        maintenance_type_id INTEGER NOT NULL,
        interval_km INTEGER,
        interval_days INTEGER,
        last_service_date DATE,
        last_service_odometer INTEGER,
        warning_km INTEGER,
        warning_days INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE,
        FOREIGN KEY(maintenance_type_id)
            REFERENCES maintenance_types(id)
    );

    CREATE TABLE IF NOT EXISTS maintenance_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        maintenance_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(maintenance_id)
            REFERENCES maintenance_records(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tire_pressure_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        calibration_date DATE NOT NULL,
        front_pressure REAL NOT NULL,
        rear_pressure REAL NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS insurance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        company TEXT NOT NULL,
        policy_number TEXT,
        annual_cost REAL,
        assistance_phone TEXT,
        start_date DATE,
        expiration_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        file_path TEXT,
        issue_date DATE,
        expiration_date DATE,
        notes TEXT,
        is_expired INTEGER DEFAULT 0 CHECK(is_expired IN (0,1)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        file_path TEXT,
        issue_date DATE,
        expiration_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        expense_date DATE NOT NULL,
        category TEXT NOT NULL,
        value REAL NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER,
        title TEXT NOT NULL,
        due_date DATE NOT NULL,
        reminder_type TEXT,
        calendar_event_id TEXT,
        calendar_provider TEXT,
        notification_sent INTEGER DEFAULT 0 CHECK(notification_sent IN (0,1)),
        completed INTEGER DEFAULT 0 CHECK (completed IN (0,1)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vehicle_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vehicle_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        reference_id INTEGER,
        event_date DATE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS odometer_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        odometer INTEGER NOT NULL,
        recorded_at DATE NOT NULL,
        FOREIGN KEY(vehicle_id)
            REFERENCES vehicles(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        biometric_enabled INTEGER DEFAULT 1 CHECK(biometric_enabled IN (0,1)),
        notifications_enabled INTEGER DEFAULT 1 CHECK(notifications_enabled IN (0,1)),
        dark_mode INTEGER DEFAULT 0 CHECK(dark_mode IN (0,1)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_fuel_vehicle
    ON fuel_records(vehicle_id);

    CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle
    ON maintenance_records(vehicle_id);

    CREATE INDEX IF NOT EXISTS idx_expenses_vehicle
    ON expenses(vehicle_id);

    CREATE INDEX IF NOT EXISTS idx_events_vehicle
    ON vehicle_events(vehicle_id);

    CREATE INDEX IF NOT EXISTS idx_reminders_due
    ON reminders(due_date);

    CREATE INDEX IF NOT EXISTS idx_fuel_date
    ON fuel_records(vehicle_id, fuel_date);

    CREATE INDEX IF NOT EXISTS idx_maintenance_date
    ON maintenance_records(vehicle_id, maintenance_date);

    CREATE INDEX IF NOT EXISTS idx_odometer_date
    ON odometer_history(vehicle_id, recorded_at);

    CREATE INDEX IF NOT EXISTS idx_vehicle_user
    ON vehicles(user_id);

    CREATE INDEX IF NOT EXISTS idx_reminder_vehicle
    ON reminders(vehicle_id);

    CREATE INDEX IF NOT EXISTS idx_document_expiration
    ON documents(expiration_date);
  `);
}