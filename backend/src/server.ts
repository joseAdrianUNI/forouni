import { createApp } from "./app";
import { env } from "./config/env";
import { assertDbConnection } from "./config/db";

async function bootstrap() {
  try {
    await assertDbConnection();
    // eslint-disable-next-line no-console
    console.log("✅ Conexión a PostgreSQL verificada");

    const app = createApp();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Foro UNI API escuchando en http://localhost:${env.port}`);
      // eslint-disable-next-line no-console
      console.log(`   Entorno: ${env.nodeEnv}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ No se pudo iniciar el servidor:", err);
    process.exit(1);
  }
}

bootstrap();
