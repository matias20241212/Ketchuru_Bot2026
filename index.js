// ============================================================
// 🔐 ENV
// ============================================================

require("dotenv").config();

console.log(
    "🔎 GUILD_ID:",
    process.env.GUILD_ID
);


// ============================================================
// 🚨 ERRORES GLOBALES
// ============================================================

process.on(
    "unhandledRejection",
    (error) => {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "❌ UNHANDLED REJECTION"
        );

        console.error(error);

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }
);

process.on(
    "uncaughtException",
    (error) => {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "❌ UNCAUGHT EXCEPTION"
        );

        console.error(error);

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }
);


// ============================================================
// 📦 IMPORTACIONES
// ============================================================

const rankingAPI =
    require("./Web/api/ranking.js");

const express =
    require("express");
    const cors = require("cors");
    const crypto = require("crypto");

const db =
    require("./database");

const topTragamonedas =
    require("./commands/Economy/toptragamonedas.js");

const fs =
    require("fs");

const path =
    require("path");

const cron =
    require("node-cron");

const {
    Client,
    GatewayIntentBits
} =
    require("discord.js");

const { REST, Routes } = require("discord.js");

// ============================================================
// 🌐 SERVIDOR WEB
// ============================================================

const app =
    express();
    app.use(cors({
  origin: "https://ketchuru-web.onrender.com",
  credentials: true
}));

const PORT =
    process.env.PORT || 3000;


// ============================================================
// 📦 MIDDLEWARE
// ============================================================

app.use(
    express.json()
);


// ============================================================
// 📁 ARCHIVOS ESTÁTICOS DE LA WEB
// ============================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "Web"
        )
    )
);


// ============================================================
// 🏠 PÁGINA PRINCIPAL
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "Web",
                "public",
                "index.html"
            )
        );

    }
);


// ============================================================
// 📊 DASHBOARD
// ============================================================

app.get(
    "/dashboard",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "Web",
                "pages",
                "dashboard.html"
            )
        );

    }
);


// ============================================================
// 🔌 API
// ============================================================

app.use(
    "/api",
    rankingAPI
);

// =====================================================
// 🔐 DISCORD OAUTH2 — DASHBOARD
// =====================================================

const dashboardSessions = new Map();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI;

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";

  const match = cookies
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function crearDashboardSession(data) {
  const sessionId = crypto.randomBytes(32).toString("hex");

  dashboardSessions.set(sessionId, {
    ...data,
    createdAt: Date.now()
  });

  return sessionId;
}

function obtenerDashboardSession(req) {
  const sessionId = getCookie(req, "ketchuru_dashboard");

  if (!sessionId) return null;

  return dashboardSessions.get(sessionId) || null;
}

function requireDashboardAuth(req, res, next) {
  const session = obtenerDashboardSession(req);

  if (!session) {
    return res.status(401).json({
      error: "NO_AUTH"
    });
  }

  req.dashboardSession = session;
  next();
}


// =====================================================
// 🔑 INICIAR LOGIN CON DISCORD
// =====================================================

app.get("/api/auth/login", (req, res) => {

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: OAUTH_REDIRECT_URI,
    scope: "identify guilds"
  });

  res.redirect(
    `https://discord.com/oauth2/authorize?${params.toString()}`
  );
});


// =====================================================
// 🔄 CALLBACK DE DISCORD
// =====================================================

app.get("/api/auth/callback", async (req, res) => {

  try {

    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Falta el código de autorización.");
    }

    // Obtener token
    const tokenResponse = await fetch(
      "https://discord.com/api/v10/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: OAUTH_REDIRECT_URI
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {

      console.error("❌ Error OAuth:", tokenData);

      return res.status(500).send(
        "No se pudo iniciar sesión con Discord."
      );
    }

    // Obtener usuario
    const userResponse = await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        headers: {
          Authorization: `${tokenData.token_type} ${tokenData.access_token}`
        }
      }
    );

    const user = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(500).send(
        "No se pudo obtener tu usuario de Discord."
      );
    }

    // Crear sesión
    const sessionId = crearDashboardSession({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user
    });

    res.setHeader(
      "Set-Cookie",
      `ketchuru_dashboard=${encodeURIComponent(sessionId)}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`
    );

    res.redirect("https://ketchuru-web.onrender.com/");

  } catch (error) {

    console.error("❌ OAuth callback error:", error);

    res.status(500).send(
      "Error interno al iniciar sesión."
    );
  }
});


// =====================================================
// 👤 USUARIO ACTUAL
// =====================================================

app.get("/api/auth/me", requireDashboardAuth, (req, res) => {

  res.json({
    authenticated: true,
    user: req.dashboardSession.user
  });

});


// =====================================================
// 🚪 CERRAR SESIÓN
// =====================================================

app.get("/api/auth/logout", (req, res) => {

  const sessionId = getCookie(
    req,
    "ketchuru_dashboard"
  );

  if (sessionId) {
    dashboardSessions.delete(sessionId);
  }

  res.setHeader(
    "Set-Cookie",
    "ketchuru_dashboard=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );

  res.redirect("/dashboard");

});

// ============================================================
// 🚀 INICIAR SERVIDOR WEB
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `🌐 Servidor iniciado en el puerto ${PORT}`
        );

    }
);
// ============================================================
// 🤖 CLIENTE DISCORD
// ============================================================

console.log(
    "🤖 Creando cliente Discord..."
);

const client =
    new Client({

        intents: [

            GatewayIntentBits.Guilds,

            GatewayIntentBits.GuildMessages,

            GatewayIntentBits.MessageContent,

            GatewayIntentBits.GuildMembers

        ]

    });

// ===============================
// DASHBOARD - SERVIDORES DE DISCORD
// ===============================

app.get("/api/dashboard/servers", requireDashboardAuth, async (req, res) => {
  try {
    const accessToken = req.dashboardSession.accessToken;

    const response = await fetch(
      "https://discord.com/api/v10/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const guilds = await response.json();

    if (!response.ok) {
      console.error("❌ Error obteniendo servidores:", guilds);
      return res.status(500).json({
        error: "No se pudieron obtener tus servidores."
      });
    }

    const servidores = guilds
      .filter(guild => {
        const permissions = BigInt(guild.permissions || "0");

        const esOwner = guild.owner === true;
        const esAdmin = (permissions & 8n) === 8n;
        const gestionaServidor = (permissions & 32n) === 32n;

        return esOwner || esAdmin || gestionaServidor;
      })
      .map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        botInstalled: client.guilds.cache.has(guild.id)
      }));

    res.json({
      success: true,
      servers: servidores
    });

  } catch (error) {
    console.error("❌ Error en /api/dashboard/servers:", error);

    res.status(500).json({
      error: "Error interno obteniendo los servidores."
    });
  }
});

// ===============================
// DASHBOARD - ROLES DEL SERVIDOR
// ===============================

app.get(
  "/api/dashboard/servers/:guildId/roles",
  requireDashboardAuth,
  async (req, res) => {
    try {
      const { guildId } = req.params;

      const accessToken = req.dashboardSession.accessToken;

      // Comprobar que el usuario tiene acceso al servidor
      const response = await fetch(
        "https://discord.com/api/v10/users/@me/guilds",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const guilds = await response.json();

      if (!response.ok) {
        return res.status(500).json({
          error: "No se pudieron comprobar tus servidores."
        });
      }

      const guild = guilds.find(server => server.id === guildId);

      if (!guild) {
        return res.status(403).json({
          error: "No tienes acceso a este servidor."
        });
      }

      // Comprobar que Ketchuru está dentro del servidor
      const discordGuild = client.guilds.cache.get(guildId);

      if (!discordGuild) {
        return res.status(404).json({
          error: "Ketchuru no está en este servidor."
        });
      }

      // Obtener roles reales
      const roles = discordGuild.roles.cache
        .filter(role => role.id !== guildId)
        .sort((a, b) => b.position - a.position)
        .map(role => ({
          id: role.id,
          name: role.name,
          position: role.position
        }));

      res.json({
        success: true,
        roles
      });

    } catch (error) {
      console.error("❌ Error obteniendo roles:", error);

      res.status(500).json({
        error: "Error interno obteniendo los roles."
      });
    }
  }
);

// ===============================
// DASHBOARD - CONFIGURACIÓN
// ===============================

app.get(
  "/api/dashboard/servers/:guildId/config",
  requireDashboardAuth,
  async (req, res) => {
    try {
      const { guildId } = req.params;

      const accessToken = req.dashboardSession.accessToken;

      // Comprobar que el usuario administra el servidor
      const response = await fetch(
        "https://discord.com/api/v10/users/@me/guilds",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const guilds = await response.json();

      if (!response.ok) {
        return res.status(500).json({
          error: "No se pudieron comprobar tus servidores."
        });
      }

      const guild = guilds.find(server => server.id === guildId);

      if (!guild) {
        return res.status(403).json({
          error: "No tienes acceso a este servidor."
        });
      }

      // Buscar configuración en Neon
      const result = await db.query(
        `
        SELECT guild_id, dashboard_roles, command_roles
        FROM dashboard_server_config
        WHERE guild_id = $1
        `,
        [guildId]
      );

      // Si todavía no existe configuración
      if (result.rows.length === 0) {
        return res.json({
          success: true,
          guildId,
          dashboardRoles: [],
          commandRoles: {}
        });
      }

      const config = result.rows[0];

      res.json({
        success: true,
        guildId: config.guild_id,
        dashboardRoles: config.dashboard_roles || [],
        commandRoles: config.command_roles || {}
      });

    } catch (error) {
      console.error("❌ Error obteniendo configuración:", error);

      res.status(500).json({
        error: "Error interno obteniendo la configuración."
      });
    }
  }
);

// ===============================
// DASHBOARD - GUARDAR CONFIGURACIÓN
// ===============================

app.post(
  "/api/dashboard/servers/:guildId/config",
  requireDashboardAuth,
  async (req, res) => {
    try {
      const { guildId } = req.params;
      const { dashboardRoles, commandRoles } = req.body;

      const accessToken = req.dashboardSession.accessToken;

      // Comprobar que el usuario administra el servidor
      const response = await fetch(
        "https://discord.com/api/v10/users/@me/guilds",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const guilds = await response.json();

      if (!response.ok) {
        return res.status(500).json({
          error: "No se pudieron comprobar tus servidores."
        });
      }

      const guild = guilds.find(server => server.id === guildId);

      if (!guild) {
        return res.status(403).json({
          error: "No tienes acceso a este servidor."
        });
      }

      // Comprobar que Ketchuru está dentro del servidor
      const discordGuild = client.guilds.cache.get(guildId);

      if (!discordGuild) {
        return res.status(404).json({
          error: "Ketchuru no está en este servidor."
        });
      }

      // Obtener todos los roles existentes
      const rolesValidos = new Set(
        discordGuild.roles.cache.map(role => role.id)
      );

      // Validar roles del dashboard
      const dashboardRolesValidos = Array.isArray(dashboardRoles)
        ? dashboardRoles.filter(roleId => rolesValidos.has(roleId))
        : [];

      // Validar roles de cada comando
      const commandRolesValidos = {};

      if (commandRoles && typeof commandRoles === "object") {
        for (const [command, roleIds] of Object.entries(commandRoles)) {
          if (!Array.isArray(roleIds)) continue;

          commandRolesValidos[command] = roleIds.filter(
            roleId => rolesValidos.has(roleId)
          );
        }
      }

      // Guardar en Neon
      await db.query(
        `
        INSERT INTO dashboard_server_config
          (guild_id, dashboard_roles, command_roles, updated_at)
        VALUES
          ($1, $2::jsonb, $3::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (guild_id)
        DO UPDATE SET
          dashboard_roles = EXCLUDED.dashboard_roles,
          command_roles = EXCLUDED.command_roles,
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          guildId,
          JSON.stringify(dashboardRolesValidos),
          JSON.stringify(commandRolesValidos)
        ]
      );

      res.json({
        success: true,
        message: "Configuración guardada correctamente."
      });

    } catch (error) {
      console.error("❌ Error guardando configuración:", error);

      res.status(500).json({
        error: "Error interno guardando la configuración."
      });
    }
  }
);

// ============================================================
// 📦 COMANDOS
// ============================================================

console.log(
    "📦 Cargando comandos..."
);

require(
    "./handlers/comandos"
)(client);

console.log(
    "✅ Carga de comandos terminada."
);

console.log(
    `💬 Comandos ! cargados: ${client.commands?.size || 0}`
);

console.log(
    `🔵 Slash Commands / cargados: ${client.slashCommands?.size || 0}`
);


// ============================================================
// 🔵 REGISTRAR SLASH COMMANDS EN DISCORD
// ============================================================

async function registrarSlashCommands() {

    try {

        const guildId =
            process.env.GUILD_ID;

        const token =
            process.env.TOKEN;

        if (!guildId) {

            console.error(
                "❌ GUILD_ID no está configurado."
            );

            return;

        }

        if (!token) {

            console.error(
                "❌ TOKEN no está configurado."
            );

            return;

        }

        if (
            !client.slashCommands ||
            client.slashCommands.size === 0
        ) {

            console.warn(
                "⚠️ No hay Slash Commands cargados para registrar."
            );

            return;

        }

        const commands = [];

        for (
            const command of client.slashCommands.values()
        ) {

            try {

                if (
                    command.data &&
                    typeof command.data.toJSON === "function"
                ) {

                    commands.push(
                        command.data.toJSON()
                    );

                    continue;

                }

                if (
                    typeof command.toJSON === "function"
                ) {

                    commands.push(
                        command.toJSON()
                    );

                    continue;

                }

                console.warn(
                    "⚠️ Slash Command ignorado:",
                    command.name || "SIN NOMBRE"
                );

            } catch (error) {

                console.error(
                    `❌ Error preparando Slash Command: ${
                        command.name || "SIN NOMBRE"
                    }`,
                    error
                );

            }

        }

        if (
            commands.length === 0
        ) {

            console.warn(
                "⚠️ No se encontraron Slash Commands válidos."
            );

            return;

        }

        const rest =
            new REST({
                version: "10"
            }).setToken(
                token
            );

        console.log(
            "🔄 Registrando Slash Commands en Discord..."
        );

        console.log(
            `🏠 GUILD_ID: ${guildId}`
        );

        console.log(
            `🔵 Comandos a registrar: ${commands.length}`
        );

        const data =
            await rest.put(
                Routes.applicationGuildCommands(
                    client.user.id,
                    guildId
                ),
                {
                    body:
                        commands
                }
            );

        console.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.log(
            `✅ ${data.length} SLASH COMMANDS REGISTRADOS CORRECTAMENTE`
        );

        console.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    } catch (error) {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "❌ ERROR REGISTRANDO SLASH COMMANDS"
        );

        console.error(error);

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }

}


// ============================================================
// 👋 BIENVENIDAS / DESPEDIDAS
// ============================================================

const {
    bienvenida,
    despedida
} =
    require(
        "./systems/bienvenidas/bienvenida"
    );

client.on(
    "guildMemberAdd",
    async (member) => {

        try {

            console.log(
                `👋 NUEVO MIEMBRO: ${member.user.tag}`
            );

            await bienvenida(
                member
            );

        } catch (error) {

            console.error(
                "❌ Error en bienvenida:",
                error
            );

        }

    }
);

client.on(
    "guildMemberRemove",
    async (member) => {

        try {

            console.log(
                `👋 MIEMBRO SALIÓ: ${member.user.tag}`
            );

            await despedida(
                member
            );

        } catch (error) {

            console.error(
                "❌ Error en despedida:",
                error
            );

        }

    }
);


// ============================================================
// 🎒 INVENTARIO
// ============================================================

let inventory = {};

const inventoryFile =
    path.join(
        __dirname,
        "data",
        "inventory.json"
    );

if (
    fs.existsSync(
        inventoryFile
    )
) {

    try {

        inventory =
            JSON.parse(
                fs.readFileSync(
                    inventoryFile,
                    "utf8"
                )
            );

    } catch (error) {

        console.error(
            "❌ Error cargando inventory.json:",
            error
        );

        inventory = {};

    }

}

async function saveInventory() {

    try {

        await fs.promises.writeFile(
            inventoryFile,
            JSON.stringify(
                inventory,
                null,
                2
            )
        );

    } catch (error) {

        console.error(
            "❌ Error guardando inventario:",
            error
        );

    }

}


// ============================================================
// 📦 SISTEMAS
// ============================================================

const feriaButtons =
    require("./handlers/buttons");

const {
    restockShop
} =
    require("./systems/shop");

const {
    avanzarMision
} =
    require("./systems/missionProgress");

const giftButtons =
    require("./systems/gifts/giftButtons");

const giftSystem =
    require("./systems/gifts/giftSystem");


// ============================================================
// 🇨🇱 HORA CHILE
// ============================================================

function getChileDate() {

    const formatter =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    "America/Santiago",

                weekday:
                    "short",

                hour:
                    "numeric",

                hour12:
                    false

            }
        );

    const parts =
        formatter.formatToParts(
            new Date()
        );

    const weekday =
        parts.find(
            part =>
                part.type === "weekday"
        )?.value;

    let hour =
        Number(
            parts.find(
                part =>
                    part.type === "hour"
            )?.value
        );

    if (
        hour === 24
    ) {

        hour = 0;

    }

    const days = {

        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6

    };

    return {

        day:
            days[weekday],

        hour

    };

}


// ============================================================
// 👇 ADMIN ABUSE
// ============================================================

function getAdminAbuseTime() {

    return {

        saturday: 15,
        tuesday: 20

    };

}


// ============================================================
// 🚨 EVENTOS DE DISCORD
// ============================================================

client.on(
    "debug",
    (info) => {

        console.log(
            "🔎 DISCORD DEBUG:",
            info
        );

    }
);

client.on(
    "warn",
    (warning) => {

        console.warn(
            "⚠️ DISCORD WARN:",
            warning
        );

    }
);

client.on(
    "error",
    (error) => {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "❌ ERROR DEL CLIENTE DISCORD"
        );

        console.error(
            "📛 Nombre:",
            error?.name
        );

        console.error(
            "📛 Mensaje:",
            error?.message
        );

        console.error(
            "📛 Código:",
            error?.code
        );

        console.error(
            "📛 Stack:",
            error?.stack
        );

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }
);

client.on(
    "shardError",
    (error, shardId) => {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "❌ ERROR DEL GATEWAY"
        );

        console.error(
            "🔢 SHARD:",
            shardId
        );

        console.error(
            "📛 Nombre:",
            error?.name
        );

        console.error(
            "📛 Mensaje:",
            error?.message
        );

        console.error(
            "📛 Código:",
            error?.code
        );

        console.error(
            "📛 Stack:",
            error?.stack
        );

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }
);


// ============================================================
// 🔴 DESCONEXIÓN DEL GATEWAY
// ============================================================

client.on(
    "shardDisconnect",
    (event, shardId) => {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "🔴 DISCORD GATEWAY DESCONECTADO"
        );

        console.error(
            "🔢 SHARD:",
            shardId
        );

        console.error(
            "🔢 CÓDIGO:",
            event?.code
        );

        console.error(
            "📝 RAZÓN:",
            event?.reason
                ? event.reason.toString()
                : "Discord no proporcionó una razón"
        );

        switch (
            event?.code
        ) {

            case 4004:

                console.error(
                    "🚨 CÓDIGO 4004"
                );

                console.error(
                    "🚨 AUTENTICACIÓN RECHAZADA POR DISCORD."
                );

                console.error(
                    "🚨 Revisar el TOKEN configurado en Render."
                );

                break;

            case 4013:

                console.error(
                    "🚨 CÓDIGO 4013"
                );

                console.error(
                    "🚨 INTENTS INVÁLIDOS."
                );

                break;

            case 4014:

                console.error(
                    "🚨 CÓDIGO 4014"
                );

                console.error(
                    "🚨 INTENT PRIVILEGIADO NO AUTORIZADO."
                );

                console.error(
                    "🚨 Revisar Message Content Intent."
                );

                console.error(
                    "🚨 Revisar Server Members Intent."
                );

                break;

            case 4010:

                console.error(
                    "🚨 CÓDIGO 4010"
                );

                console.error(
                    "🚨 SHARD INVÁLIDO."
                );

                break;

            default:

                console.error(
                    "ℹ️ Código no identificado por el diagnóstico."
                );

                break;

        }

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }
);


// ============================================================
// 🔄 RECONEXIÓN
// ============================================================

client.on(
    "shardReconnecting",
    (shardId) => {

        console.warn(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.warn(
            `🔄 DISCORD INTENTANDO RECONEXIÓN | SHARD ${shardId}`
        );

        console.warn(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }
);


// ============================================================
// 🟢 SHARD READY
// ============================================================

client.on(
    "shardReady",
    (shardId) => {

        console.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.log(
            `🟢 SHARD ${shardId} CONECTADO CORRECTAMENTE`
        );

        console.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }
);


// ============================================================
// ❌ SESIÓN INVALIDADA
// ============================================================

client.on(
    "invalidated",
    () => {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "❌ SESIÓN DE DISCORD INVALIDADA"
        );

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

    }
);


// ============================================================
// 🟢 BOT CONECTADO
// ============================================================

client.once(
    "clientReady",
    async () => {

        console.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.log(
            `✅ KETCHURUBOT CONECTADO COMO: ${client.user.tag}`
        );

        console.log(
            `🆔 ID DEL BOT: ${client.user.id}`
        );

        console.log(
            `🏠 SERVIDORES: ${client.guilds.cache.size}`
        );

        console.log(
            `💬 COMANDOS !: ${client.commands?.size || 0}`
        );

        console.log(
            `🔵 SLASH COMMANDS /: ${client.slashCommands?.size || 0}`
        );

        console.log(
            "🧩 MODO: CONEXIÓN NORMAL SIN SHARD MANUAL"
        );

        console.log(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );


        // ====================================================
        // 🔵 REGISTRAR SLASH COMMANDS
        // ====================================================

        await registrarSlashCommands();


        // ====================================================
        // 🏆 CREAR TABLA DEL TOP TRAGAMONEDAS
        // ====================================================

        try {

            await db.query(`
                CREATE TABLE IF NOT EXISTS top_tragamonedas_config (
                    guild_id TEXT PRIMARY KEY,
                    channel_id TEXT NOT NULL,
                    message_id TEXT NOT NULL
                )
            `);

            console.log(
                "✅ Tabla top_tragamonedas_config preparada."
            );

        } catch (error) {

            console.error(
                "❌ Error preparando Top Tragamonedas:",
                error
            );

        }


        // ====================================================
        // 🔥 RECUPERAR TOP TRAGAMONEDAS
        // ====================================================

        try {

            await topTragamonedas.recuperarRanking(
                client
            );

        } catch (error) {

            console.error(
                "❌ Error iniciando recuperación del Top Tragamonedas:",
                error
            );

        }


        // ====================================================
        // 🛒 SHOP RESTOCK
        // ====================================================

        setInterval(
            () => {

                try {

                    const {
                        day,
                        hour
                    } =
                        getChileDate();

                    let shouldRestock =
                        false;


                    // LUNES - JUEVES

                    if (
                        day >= 1 &&
                        day <= 4 &&
                        hour === 20
                    ) {

                        shouldRestock =
                            true;

                    }


                    // VIERNES

                    if (
                        day === 5 &&
                        (
                            hour === 8 ||
                            hour === 20
                        )
                    ) {

                        shouldRestock =
                            true;

                    }


                    // SÁBADO

                    if (
                        day === 6 &&
                        hour % 6 === 0
                    ) {

                        shouldRestock =
                            true;

                    }


                    // DOMINGO

                    if (
                        day === 0 &&
                        (
                            hour === 8 ||
                            hour === 20
                        )
                    ) {

                        shouldRestock =
                            true;

                    }


                    if (
                        shouldRestock
                    ) {

                        restockShop();

                        console.log(
                            "🛒 HAMMER TIME RESTOCK"
                        );

                    }

                } catch (error) {

                    console.error(
                        "❌ Error en restock:",
                        error
                    );

                }

            },
            60 * 60 * 1000
        );


        // ====================================================
        // 👇 ADMIN ABUSE
        // ====================================================

        cron.schedule(
            "0 * * * *",
            async () => {

                try {

                    const channel =
                        client.channels.cache.get(
                            "1512250127518011613"
                        );

                    if (
                        !channel
                    ) {

                        console.warn(
                            "⚠️ Canal de Admin Abuse no encontrado."
                        );

                        return;

                    }

                    const {
                        saturday,
                        tuesday
                    } =
                        getAdminAbuseTime();

                    const now =
                        new Date();

                    const day =
                        now.getUTCDay();

                    const hour =
                        now.getUTCHours();


                    // SÁBADO - 12 HORAS ANTES

                    if (
                        day === 6 &&
                        hour === saturday - 12
                    ) {

                        await channel.send(
                            "⏰ 12 HORAS PARA ADMIN ABUSE (sábado) - 15:00 UTC"
                        );

                    }


                    // MARTES - 12 HORAS ANTES

                    if (
                        day === 2 &&
                        hour === tuesday - 12
                    ) {

                        await channel.send(
                            "⏰ 12 HORAS PARA ADMIN ABUSE (martes) - 20:00 UTC"
                        );

                    }


                    // SÁBADO - INICIO

                    if (
                        day === 6 &&
                        hour === saturday
                    ) {

                        await channel.send(
                            "🔥 ADMIN ABUSE INICIADO (sábado) 15:00 UTC (Hammer time)"
                        );

                    }


                    // MARTES - INICIO

                    if (
                        day === 2 &&
                        hour === tuesday
                    ) {

                        await channel.send(
                            "🔥 ADMIN ABUSE INICIADO (martes) 20:00 UTC (Hammer time)"
                        );

                    }

                } catch (error) {

                    console.error(
                        "❌ Error en Admin Abuse:",
                        error
                    );

                }

            }
        );

    }
);


// ============================================================
// 💬 MENSAJES
// ============================================================

const mensajes =
    new Map();

const statsServidor =
    new Map();

client.on(
    "messageCreate",
    async (message) => {

        try {

            // IGNORAR BOTS

            if (
                message.author.bot
            ) {

                return;

            }


            // IGNORAR PRIVADOS

            if (
                !message.guild
            ) {

                return;

            }

            const guildId =
                message.guild.id;

            const userId =
                message.author.id;


            // =================================================
            // 💰 CREAR USUARIO
            // =================================================

            await db.query(
                `
                INSERT INTO users (
                    discord_id,
                    balance
                )
                VALUES ($1, $2)
                ON CONFLICT (discord_id)
                DO NOTHING
                `,
                [
                    userId,
                    50
                ]
            );


            // =================================================
            // 📅 DAILY STATS
            // =================================================

            try {

                await db.query(
                    `
                    UPDATE daily_stats
                    SET active_today = true
                    WHERE discord_id = $1
                    `,
                    [
                        userId
                    ]
                );

            } catch (error) {

                console.error(
                    "⚠️ Error actualizando daily_stats:",
                    error
                );

            }


            // =================================================
            // 🎯 MISIONES
            // =================================================

            let misionMensaje =
                null;

            try {

                misionMensaje =
                    await avanzarMision(
                        userId,
                        "messages"
                    );

            } catch (error) {

                console.error(
                    "❌ Error avanzando misión:",
                    error
                );

            }

            if (
                misionMensaje
            ) {

                await message.reply(
                    `
🎉 **MISIÓN COMPLETADA**

💬 ${misionMensaje.nombre}

💰 Recompensa:
+${misionMensaje.recompensa} monedas
`
                ).catch(
                    console.error
                );

            }


            // =================================================
            // 🔥 COMANDOS !
            // =================================================

            if (
                message.content.startsWith("!")
            ) {

                const args =
                    message.content
                        .slice(1)
                        .trim()
                        .split(/ +/);

                const commandName =
                    args
                        .shift()
                        .toLowerCase();

                const command =
                    client.commands?.get(
                        commandName
                    );

                if (
                    command
                ) {

                    console.log(
                        `⚡ Ejecutando comando: !${commandName}`
                    );

                    const ejecutar =
                        command.ejecutar ||
                        command.execute;

                    if (
                        typeof ejecutar !==
                        "function"
                    ) {

                        console.error(
                            `❌ El comando !${commandName} no tiene ejecutar/execute`
                        );

                        return;

                    }

                    return ejecutar(
                        message,
                        args,
                        db
                    );

                }

            }


            // =================================================
            // 📊 SISTEMA DE MENSAJES
            // =================================================

            if (
                !mensajes.has(
                    guildId
                )
            ) {

                mensajes.set(
                    guildId,
                    new Map()
                );

            }

            if (
                !statsServidor.has(
                    guildId
                )
            ) {

                statsServidor.set(
                    guildId,
                    {
                        total: 0,
                        firstMessageTime:
                            Date.now()
                    }
                );

            }

            const guildData =
                mensajes.get(
                    guildId
                );

            const serverStats =
                statsServidor.get(
                    guildId
                );

            if (
                !guildData.has(
                    userId
                )
            ) {

                guildData.set(
                    userId,
                    0
                );

            }

            guildData.set(
                userId,
                guildData.get(userId) + 1
            );

            serverStats.total++;


            // =================================================
            // !MENSAJES
            // =================================================

            if (
                message.content ===
                "!mensajes"
            ) {

                const count =
                    guildData.get(
                        userId
                    ) || 0;

                return message.reply(
                    `📊 Has enviado **${count} mensajes** en este servidor`
                );

            }


            // =================================================
            // !TOPMENSAJES
            // =================================================

            if (
                message.content ===
                "!topmensajes"
            ) {

                const sorted =
                    [
                        ...guildData.entries()
                    ]
                        .sort(
                            (a, b) =>
                                b[1] - a[1]
                        )
                        .slice(
                            0,
                            10
                        );

                let text =
                    "🏆 **TOP MENSAJES DEL SERVIDOR**\n\n";

                for (
                    let i = 0;
                    i < sorted.length;
                    i++
                ) {

                    const [
                        targetUserId,
                        count
                    ] =
                        sorted[i];

                    const user =
                        await client.users
                            .fetch(
                                targetUserId
                            )
                            .catch(
                                () => null
                            );

                    text +=
                        `#${i + 1} - ${
                            user
                                ? user.username
                                : "Usuario"
                        }: ${count} mensajes\n`;

                }

                return message.reply(
                    text
                );

            }


            // =================================================
            // !STATS
            // =================================================

            if (
                message.content ===
                "!stats"
            ) {

                const total =
                    serverStats.total;

                const dias =
                    Math.max(
                        1,
                        Math.floor(
                            (
                                Date.now() -
                                serverStats.firstMessageTime
                            ) /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        )
                    );

                const promedio =
                    (
                        total /
                        dias
                    ).toFixed(2);

                return message.reply(
                    `📊 **ESTADÍSTICAS DEL SERVIDOR**\n\n` +
                    `💬 Mensajes totales: ${total}\n` +
                    `📅 Días activos: ${dias}\n` +
                    `📈 Promedio por día: ${promedio}`
                );

            }

        } catch (error) {

            console.error(
                "❌ ERROR EN messageCreate:",
                error
            );

        }

    }
);


// ============================================================
// 🎁 INTERACCIONES
// ============================================================

client.on(
    "interactionCreate",
    async (interaction) => {

        try {

            // =================================================
            // 🔵 SLASH COMMANDS /
            // =================================================

            if (
                interaction.isChatInputCommand()
            ) {

                const command =
                    client.slashCommands?.get(
                        interaction.commandName
                    );

                if (
                    !command
                ) {

                    console.warn(
                        `⚠️ Slash Command no encontrado: /${interaction.commandName}`
                    );

                    return interaction.reply(
                        {
                            content:
                                "❌ Ese comando no está disponible.",
                            ephemeral:
                                true
                        }
                    );

                }

                if (
                    typeof command.execute !==
                    "function"
                ) {

                    console.error(
                        `❌ El Slash Command /${interaction.commandName} no tiene una función execute().`
                    );

                    return interaction.reply(
                        {
                            content:
                                "❌ Este comando no está configurado correctamente.",
                            ephemeral:
                                true
                        }
                    );

                }

                console.log(
                    `🔵 Ejecutando Slash Command: /${interaction.commandName}`
                );

                return await command.execute(
                    interaction,
                    db
                );

            }


            // =================================================
            // 🔘 BOTONES
            // =================================================

            if (
                interaction.isButton()
            ) {

                // =================================================
                // 🎪 FERIA
                // =================================================

                if (

                    interaction.customId ===
                        "confirmar_createferia" ||

                    interaction.customId ===
                        "cancelar_createferia" ||

                    interaction.customId.startsWith(
                        "feria_comprar_"
                    ) ||

                    interaction.customId.startsWith(
                        "feria_poder_"
                    ) ||

                    interaction.customId.startsWith(
                        "feria_cancelar_"
                    )

                ) {

                    return feriaButtons(
                        interaction
                    );

                }


                // =================================================
                // 🎁 ACEPTAR REGALO
                // =================================================

                if (
                    interaction.customId ===
                    "gift_accept"
                ) {

                    try {

                        const regalos =
                            await giftSystem
                                .obtenerRegalos(
                                    interaction.user.id
                                );

                        return giftButtons
                            .mostrarSeleccionRegalo(
                                interaction,
                                regalos,
                                "accept"
                            );

                    } catch (error) {

                        console.error(
                            "❌ ERROR GIFT ACCEPT:",
                            error
                        );

                        if (
                            !interaction.replied &&
                            !interaction.deferred
                        ) {

                            return interaction.reply(
                                {
                                    content:
                                        "❌ No se pudieron cargar los regalos.",
                                    ephemeral:
                                        true
                                }
                            );

                        }

                    }

                }


                // =================================================
                // 🎁 RECHAZAR REGALO
                // =================================================

                if (
                    interaction.customId ===
                    "gift_reject"
                ) {

                    try {

                        const regalos =
                            await giftSystem
                                .obtenerRegalos(
                                    interaction.user.id
                                );

                        return giftButtons
                            .mostrarSeleccionRegalo(
                                interaction,
                                regalos,
                                "reject"
                            );

                    } catch (error) {

                        console.error(
                            "❌ ERROR GIFT REJECT:",
                            error
                        );

                        if (
                            !interaction.replied &&
                            !interaction.deferred
                        ) {

                            return interaction.reply(
                                {
                                    content:
                                        "❌ No se pudieron cargar los regalos.",
                                    ephemeral:
                                        true
                                }
                            );

                        }

                    }

                }


                // =================================================
                // ⭐ REPUTACIÓN
                // =================================================

                if (
                    interaction.customId.startsWith(
                        "review_"
                    )
                ) {

                    const estrellas =
                        Number(
                            interaction.customId
                                .split("_")[1]
                        );

                    return interaction.reply(
                        {
                            content:
                                `⭐ Elegiste ${estrellas} estrellas.\n\nAhora escribe tu comentario.`,
                            ephemeral:
                                true
                        }
                    );

                }


                // =================================================
                // 🎒 INVENTARIO
                // =================================================

                if (
                    interaction.customId.startsWith(
                        "inv_item"
                    )
                ) {

                    const data =
                        interaction.customId
                            .split("_");

                    const ownerId =
                        data[2];

                    const page =
                        Number(
                            data[3]
                        );

                    const index =
                        Number(
                            data[4]
                        );

                    if (
                        interaction.user.id !==
                        ownerId
                    ) {

                        return interaction.reply(
                            {
                                content:
                                    "⚠️ Este inventario no es tuyo.",
                                ephemeral:
                                    true
                            }
                        );

                    }

                    const {
                        getInventory
                    } =
                        require(
                            "./systems/inventory"
                        );

                    const {
                        paginate
                    } =
                        require(
                            "./systems/inventorySystem"
                        );

                    const {
                        createUseMenu
                    } =
                        require(
                            "./systems/inventoryUseMenu"
                        );

                    await interaction.deferReply(
                        {
                            ephemeral:
                                true
                        }
                    );

                    const items =
                        await getInventory(
                            interaction.user.id
                        );

                    const current =
                        paginate(
                            items,
                            page,
                            10
                        );

                    const objeto =
                        current[index];

                    if (
                        !objeto
                    ) {

                        return interaction.editReply(
                            {
                                content:
                                    "❌ No existe ese objeto.",
                                components:
                                    []
                            }
                        );

                    }

                    const {
                        setInventoryState
                    } =
                        require(
                            "./systems/inventoryMenu"
                        );

                    setInventoryState(
                        interaction.user.id,
                        {
                            ownerId,
                            item:
                                objeto.item
                        }
                    );

                    return interaction.editReply(
                        {
                            content:
                                `
🎒 **Objeto seleccionado**

${objeto.emoji || "📦"} **${objeto.item}**

📦 Cantidad:
${objeto.amount}

¿Cuántos quieres usar?
`,
                            components:
                                createUseMenu(
                                    objeto.item
                                )
                        }
                    );

                }


                // =================================================
                // ⚡ USAR ITEM
                // =================================================

                if (
                    interaction.customId.startsWith(
                        "use_"
                    )
                ) {

                    const data =
                        interaction.customId
                            .split("_");

                    const accion =
                        data[1];

                    const {
                        getInventoryState
                    } =
                        require(
                            "./systems/inventoryMenu"
                        );

                    const {
                        removeItem
                    } =
                        require(
                            "./systems/inventory"
                        );

                    const state =
                        getInventoryState(
                            interaction.user.id
                        );

                    if (
                        !state
                    ) {

                        return interaction.reply(
                            {
                                content:
                                    "⚠️ Inventario cerrado.",
                                ephemeral:
                                    true
                            }
                        );

                    }


                    // CANCELAR

                    if (
                        accion ===
                        "cancel"
                    ) {

                        return interaction.update(
                            {
                                content:
                                    "❌ Acción cancelada.",
                                components:
                                    []
                            }
                        );

                    }


                    let cantidad =
                        1;


                    // 3 ITEMS

                    if (
                        accion ===
                        "three"
                    ) {

                        cantidad =
                            3;

                    }


                    // PERSONALIZADO

                    if (
                        accion ===
                        "custom"
                    ) {

                        const {
                            ModalBuilder,
                            TextInputBuilder,
                            TextInputStyle,
                            ActionRowBuilder
                        } =
                            require(
                                "discord.js"
                            );

                        const modal =
                            new ModalBuilder()
                                .setCustomId(
                                    "modal_use"
                                )
                                .setTitle(
                                    "Cantidad a usar"
                                );

                        const input =
                            new TextInputBuilder()
                                .setCustomId(
                                    "cantidad"
                                )
                                .setLabel(
                                    "Cantidad"
                                )
                                .setStyle(
                                    TextInputStyle.Short
                                )
                                .setRequired(
                                    true
                                );

                        modal.addComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    input
                                )
                        );

                        return interaction.showModal(
                            modal
                        );

                    }

                    await interaction.deferReply(
                        {
                            ephemeral:
                                true
                        }
                    );

                    await removeItem(
                        interaction.user.id,
                        state.item,
                        cantidad
                    );

                    return interaction.editReply(
                        {
                            content:
                                `✔ Usaste **${cantidad}x ${state.item}**`
                        }
                    );

                }

            }


            // =================================================
            // 🧾 MODAL
            // =================================================

            if (
                interaction.isModalSubmit()
            ) {

                if (
                    interaction.customId !==
                    "modal_use"
                ) {

                    return;

                }

                const {
                    getInventoryState
                } =
                    require(
                        "./systems/inventoryMenu"
                    );

                const {
                    removeItem
                } =
                    require(
                        "./systems/inventory"
                    );

                const cantidad =
                    parseInt(
                        interaction.fields
                            .getTextInputValue(
                                "cantidad"
                            )
                    );

                if (
                    isNaN(cantidad) ||
                    cantidad <= 0
                ) {

                    return interaction.reply(
                        {
                            content:
                                "❌ Cantidad inválida",
                            ephemeral:
                                true
                        }
                    );

                }

                const state =
                    getInventoryState(
                        interaction.user.id
                    );

                if (
                    !state
                ) {

                    return interaction.reply(
                        {
                            content:
                                "⚠️ Inventario cerrado.",
                            ephemeral:
                                true
                        }
                    );

                }

                await interaction.deferReply(
                    {
                        ephemeral:
                            true
                    }
                );

                await removeItem(
                    interaction.user.id,
                    state.item,
                    cantidad
                );

                return interaction.editReply(
                    {
                        content:
                            `✔ Usaste **${cantidad}x ${state.item}**`
                    }
                );

            }

        } catch (error) {

            console.error(
                "❌ ERROR EN interactionCreate:",
                error
            );

            try {

                if (
                    interaction.deferred
                ) {

                    await interaction.editReply(
                        {
                            content:
                                "❌ Ocurrió un error procesando esta interacción."
                        }
                    );

                } else if (
                    !interaction.replied
                ) {

                    await interaction.reply(
                        {
                            content:
                                "❌ Ocurrió un error procesando esta interacción.",
                            ephemeral:
                                true
                        }
                    );

                }

            } catch (replyError) {

                console.error(
                    "❌ No se pudo responder a la interacción:",
                    replyError
                );

            }

        }

    }
);


// ============================================================
// 🔑 LOGIN DISCORD
// ============================================================

console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);

console.log(
    "🔑 TOKEN:",
    process.env.TOKEN
        ? "DETECTADO"
        : "❌ NO DETECTADO"
);

console.log(
    "🔐 LONGITUD DEL TOKEN:",
    process.env.TOKEN
        ? process.env.TOKEN.length
        : 0
);

console.log(
    "🔐 PREFIJO DEL TOKEN:",
    process.env.TOKEN
        ? process.env.TOKEN.substring(0, 10) + "..."
        : "N/A"
);

console.log(
    "🧩 SHARDING MANUAL: DESACTIVADO"
);

console.log(
    "🧩 DISCORD.JS: CONEXIÓN NORMAL"
);

console.log(
    "🔌 INTENTANDO CONECTAR CON DISCORD GATEWAY..."
);

console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);


// ============================================================
// 🚨 COMPROBAR TOKEN
// ============================================================

if (
    !process.env.TOKEN
) {

    console.error(
        "❌ ERROR CRÍTICO: TOKEN NO ENCONTRADO."
    );

    process.exit(1);

}


// ============================================================
// 🔐 LOGIN
// ============================================================

async function iniciarBot() {

    try {

        console.log(
            "🔐 Ejecutando client.login()..."
        );

        await client.login(
            process.env.TOKEN
        );

        console.log(
            "✅ client.login() terminó correctamente."
        );

    } catch (error) {

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "❌❌❌ ERROR AL INICIAR DISCORD ❌❌❌"
        );

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        console.error(
            "📛 Nombre:",
            error?.name
        );

        console.error(
            "📛 Mensaje:",
            error?.message
        );

        console.error(
            "📛 Código:",
            error?.code
        );

        console.error(
            "📛 Stack:",
            error?.stack
        );

        console.error(
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        );

        process.exit(1);

    }

}


// ============================================================
// 🚀 INICIAR
// ============================================================

iniciarBot();