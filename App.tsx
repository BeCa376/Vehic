import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { runMigrations } from "./src/database/migrations";
import { UsersRepository } from "./src/database/repository/users";
import { VehiclesRepository } from "./src/database/repository/vehicles";

export default function App() {

  const [user, setUser] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {

    async function init() {

      await runMigrations();

      const usersRepository =
        new UsersRepository();

      const vehiclesRepository =
        new VehiclesRepository();

      const users =
        await usersRepository.getAll();

      const vehicles =
        await vehiclesRepository.getAll();

      if (users.length > 0) {
        setUser(users[0]);
      }

      if (vehicles.length > 0) {
        setVehicle(vehicles[0]);
      }

      console.log(users);
      console.log(vehicles);
    }

    init();

  }, []);

  return (
    <View style={{ padding: 20 }}>

      <Text>Vehic 🚀</Text>

      <Text>
        Usuário: {user?.name}
      </Text>

      <Text>
        Email: {user?.email}
      </Text>

      <Text>
        Veículo: {vehicle?.name}
      </Text>

      <Text>
        Marca: {vehicle?.brand}
      </Text>

      <Text>
        Modelo: {vehicle?.vehicle_model}
      </Text>

    </View>
  );
}